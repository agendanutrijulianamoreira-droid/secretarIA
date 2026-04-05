-- ============================================================
-- SecretarIA — Schema SQL (Supabase / PostgreSQL)
-- ============================================================
-- Execute na ordem abaixo no SQL Editor do Supabase
-- ============================================================


-- ── 1. CLIENTES (sua base — gerenciada pelo WA AI Manager) ──
CREATE TABLE IF NOT EXISTS clientes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  -- Identificação
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'Starter' CHECK (plan IN ('Starter','Pro','Enterprise')),
  status        TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('active','paused','setup')),

  -- Meta / WhatsApp Official API
  waba_id           TEXT UNIQUE,        -- WhatsApp Business Account ID
  phone_number_id   TEXT,               -- ID do número no Meta
  meta_token        TEXT,               -- Token permanente da Meta API

  -- n8n
  n8n_url       TEXT,                   -- URL do webhook n8n deste cliente
  n8n_status    TEXT DEFAULT 'pending',

  -- Google Calendar
  calendar_email TEXT,                  -- E-mail da agenda vinculada

  -- Capacidades ativas
  capabilities  TEXT[] DEFAULT ARRAY['text'],

  -- Briefing (JSON completo gerado pelo wizard)
  briefing      JSONB DEFAULT '{}'::JSONB,

  -- Métricas
  msgs_today    INT DEFAULT 0,
  msgs_month    INT DEFAULT 0
);

-- ── 2. CONTATOS (usuários finais que falam com a IA) ─────────
CREATE TABLE IF NOT EXISTS contatos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  client_id     UUID REFERENCES clientes(id) ON DELETE CASCADE,
  telefone      TEXT NOT NULL,
  nome          TEXT,
  email         TEXT,

  -- Controle de atendimento
  atendimento_ia  TEXT NOT NULL DEFAULT 'ativo'
                  CHECK (atendimento_ia IN ('ativo','pause')),

  -- Metadados úteis para o agente
  ultima_interacao  TIMESTAMPTZ,
  total_mensagens   INT DEFAULT 0,
  tags              TEXT[] DEFAULT ARRAY[]::TEXT[],

  UNIQUE(telefone, client_id)
);

-- ── 3. CHAT_MESSAGES (histórico completo) ────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),

  client_id     UUID REFERENCES clientes(id) ON DELETE CASCADE,
  telefone      TEXT NOT NULL,
  papel         TEXT NOT NULL CHECK (papel IN ('user','assistant','system')),
  mensagem      TEXT,
  resposta      TEXT,
  agent_name    TEXT,
  tipo_msg      TEXT DEFAULT 'text'
                CHECK (tipo_msg IN ('text','audio','image','document')),

  -- Metadados da conversa
  wamid         TEXT,                   -- ID da mensagem no Meta
  tokens_usados INT,
  escalado      BOOLEAN DEFAULT FALSE
);

-- ── 4. MEMÓRIA DE CHAT (usada pelo n8n Postgres Memory) ──────
-- Esta tabela é criada automaticamente pelo nó memoryPostgresChat
-- mas incluímos aqui para referência e índices extras
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
  id            BIGSERIAL PRIMARY KEY,
  session_id    TEXT NOT NULL,
  message       JSONB NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. AGENDAMENTOS (criados pela tool Google Calendar) ───────
CREATE TABLE IF NOT EXISTS agendamentos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),

  client_id     UUID REFERENCES clientes(id) ON DELETE CASCADE,
  telefone      TEXT NOT NULL,
  nome_contato  TEXT,

  -- Dados do evento
  titulo        TEXT NOT NULL,
  descricao     TEXT,
  data_inicio   TIMESTAMPTZ NOT NULL,
  data_fim      TIMESTAMPTZ,
  google_event_id TEXT,

  status        TEXT DEFAULT 'confirmado'
                CHECK (status IN ('confirmado','cancelado','remarcado'))
);

-- ── 6. COBRANÇAS / INVOICES (Asaas) ──────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  client_id       UUID REFERENCES clientes(id) ON DELETE CASCADE,
  asaas_id        TEXT UNIQUE,           -- ID da cobrança no Asaas
  descricao       TEXT NOT NULL,
  amount          NUMERIC(10,2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pago','pendente','vencido','cancelado')),
  due_date        DATE,
  payment_link    TEXT,                  -- Link gerado pelo Asaas
  paid_at         TIMESTAMPTZ
);

-- ── 7. CANAL DE MENSAGENS (portal cliente ↔ você) ────────────
CREATE TABLE IF NOT EXISTS portal_messages (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  client_id   UUID REFERENCES clientes(id) ON DELETE CASCADE,
  from_role   TEXT NOT NULL CHECK (from_role IN ('client','admin')),
  text        TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE
);

-- ════════════════════════════════════════════════════════════
-- ÍNDICES
-- ════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_contatos_telefone_client
  ON contatos(telefone, client_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_telefone
  ON chat_messages(telefone, client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created
  ON chat_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_n8n_chat_session
  ON n8n_chat_histories(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agendamentos_client
  ON agendamentos(client_id, data_inicio);

CREATE INDEX IF NOT EXISTS idx_invoices_client
  ON invoices(client_id, due_date);

CREATE INDEX IF NOT EXISTS idx_portal_messages_client
  ON portal_messages(client_id, created_at DESC);

-- ════════════════════════════════════════════════════════════
-- TRIGGERS — atualiza updated_at automaticamente
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientes_updated
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_contatos_updated
  BEFORE UPDATE ON contatos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════
-- ATUALIZA MÉTRICAS DO CLIENTE (chamado após cada mensagem)
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION incrementar_msgs_cliente()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.papel = 'user' THEN
    UPDATE clientes
    SET
      msgs_today  = msgs_today  + 1,
      msgs_month  = msgs_month  + 1,
      updated_at  = NOW()
    WHERE id = NEW.client_id;

    UPDATE contatos
    SET
      ultima_interacao = NOW(),
      total_mensagens  = total_mensagens + 1
    WHERE telefone = NEW.telefone AND client_id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_incrementa_msgs
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION incrementar_msgs_cliente();

-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) — isola dados por cliente
-- ════════════════════════════════════════════════════════════
ALTER TABLE clientes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_messages ENABLE ROW LEVEL SECURITY;

-- Política: service_role (n8n) acessa tudo
CREATE POLICY "service_role full access" ON clientes
  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role full access" ON contatos
  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role full access" ON chat_messages
  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role full access" ON agendamentos
  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role full access" ON invoices
  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role full access" ON portal_messages
  TO service_role USING (true) WITH CHECK (true);

-- ════════════════════════════════════════════════════════════
-- RESET DIÁRIO DE MSGS_TODAY (cron via Supabase ou n8n)
-- ════════════════════════════════════════════════════════════
-- Agende esse SQL para rodar todo dia à meia-noite:
-- UPDATE clientes SET msgs_today = 0;

-- ════════════════════════════════════════════════════════════
-- DADOS DE EXEMPLO (remova em produção)
-- ════════════════════════════════════════════════════════════
/*
INSERT INTO clientes (name, phone, plan, status, waba_id, meta_token, briefing)
VALUES (
  'Meu Primeiro Cliente',
  '+55 11 9 0000-0000',
  'Pro',
  'setup',
  'WABA_ID_AQUI',
  'TOKEN_META_AQUI',
  '{
    "segment": "Saúde / Clínica",
    "description": "Clínica de saúde integrada.",
    "ai_name": "Ana",
    "ai_tone": "Acolhedora e profissional",
    "ai_goal": "Agendamentos",
    "business_hours": "Seg-Sex 8h-18h",
    "escalation_trigger": "Urgências e reclamações",
    "escalation_number": "+55 11 9 0000-0001",
    "services": [{"name": "Consulta", "price": "R$ 200"}],
    "faqs": [{"q": "Atendem convênio?", "a": "Sim, Unimed e Bradesco."}],
    "restrictions": "Nunca confirmar diagnóstico.",
    "promotions": ""
  }'::JSONB
);
*/
