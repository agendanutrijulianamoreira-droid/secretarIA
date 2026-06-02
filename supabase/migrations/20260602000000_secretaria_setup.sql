-- ============================================================
-- SecretarIA — Setup completo do banco de dados
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── CLIENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  email           text,
  phone           text,
  avatar          text,
  color           text,
  status          text DEFAULT 'setup',
  plan            text DEFAULT 'Starter',
  payment_status  text DEFAULT 'pending',
  briefing        jsonb DEFAULT '{}',
  capabilities    text[] DEFAULT ARRAY['text'],
  calendar_email  text,
  msgs_today      int DEFAULT 0,
  msgs_month      int DEFAULT 0,
  n8n_status      text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── CONTATOS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contatos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid REFERENCES clients(id) ON DELETE CASCADE,
  telefone         text,
  nome             text,
  atendimento_ia   text DEFAULT 'ativo',
  ia_nome          text DEFAULT '',
  crm_status       text DEFAULT 'novo',
  crm_notes        text DEFAULT '',
  ultima_interacao timestamptz DEFAULT now(),
  total_mensagens  int DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ── PACIENTES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pacientes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid REFERENCES clients(id) ON DELETE CASCADE,
  nome             text DEFAULT '',
  telefone         text DEFAULT '',
  email            text DEFAULT '',
  data_nascimento  text DEFAULT '',
  observacoes      text DEFAULT '',
  ativo            boolean DEFAULT true,
  origem           text DEFAULT 'manual',
  contato_id       uuid REFERENCES contatos(id),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ── CAMPANHAS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campanhas (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid REFERENCES clients(id) ON DELETE CASCADE,
  tipo             text DEFAULT '',
  titulo           text DEFAULT '',
  mensagem         text DEFAULT '',
  pacientes_alvo   jsonb DEFAULT '[]',
  status           text DEFAULT 'rascunho',
  agendada_para    timestamptz,
  enviados         int DEFAULT 0,
  falhas           int DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ── WHATSAPP NUMBERS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid REFERENCES clients(id) ON DELETE CASCADE,
  numero          text DEFAULT '',
  nome_display    text DEFAULT '',
  ia_nome         text DEFAULT '',
  ia_funcao       text DEFAULT '',
  status          text DEFAULT 'pendente',
  cobrado_extra   boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── SERVIÇOS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS servicos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid REFERENCES clients(id) ON DELETE CASCADE,
  nome             text DEFAULT '',
  descricao        text DEFAULT '',
  preco            numeric DEFAULT 0,
  duracao_minutos  int DEFAULT 60,
  ativo            boolean DEFAULT true,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ── VENDAS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendas (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid REFERENCES clients(id) ON DELETE CASCADE,
  paciente_nome    text DEFAULT '',
  paciente_id      uuid REFERENCES pacientes(id),
  servico_nome     text DEFAULT '',
  servico_id       uuid REFERENCES servicos(id),
  valor            numeric DEFAULT 0,
  forma_pagamento  text DEFAULT '',
  status           text DEFAULT 'pendente',
  observacoes      text DEFAULT '',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ── IA APRENDIZADOS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS ia_aprendizados (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid REFERENCES clients(id) ON DELETE CASCADE,
  tipo             text DEFAULT 'conversa',
  resumo           text DEFAULT '',
  aprendizado      text DEFAULT '',
  status           text DEFAULT 'pendente',
  telefone_origem  text DEFAULT '',
  corrigido        boolean DEFAULT false,
  aprovado_at      timestamptz,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ── CHAT MESSAGES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid REFERENCES clients(id) ON DELETE CASCADE,
  telefone    text,
  role        text DEFAULT 'user',
  content     text DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

-- ── INVOICES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid REFERENCES clients(id) ON DELETE CASCADE,
  descricao     text DEFAULT '',
  amount        numeric DEFAULT 0,
  status        text DEFAULT 'pendente',
  due_date      text,
  payment_link  text,
  paid_at       timestamptz,
  created_at    timestamptz DEFAULT now()
);

-- ── PORTAL MESSAGES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid REFERENCES clients(id) ON DELETE CASCADE,
  text        text DEFAULT '',
  from_role   text DEFAULT 'client',
  read        boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ── AGENDAMENTOS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agendamentos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid REFERENCES clients(id) ON DELETE CASCADE,
  paciente_id       uuid REFERENCES pacientes(id),
  servico_id        uuid REFERENCES servicos(id),
  data_inicio       timestamptz,
  data_fim          timestamptz,
  status            text DEFAULT 'agendado',
  notas             text DEFAULT '',
  google_event_id   text,
  professional_id   uuid,
  lembrete_enviado  boolean DEFAULT false,
  nps_enviado       boolean DEFAULT false,
  created_at        timestamptz DEFAULT now()
);

-- ── PROFESSIONALS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS professionals (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             uuid REFERENCES clients(id) ON DELETE CASCADE,
  name                  text NOT NULL,
  especialidade         text DEFAULT '',
  google_calendar_email text DEFAULT '',
  ativo                 boolean DEFAULT true,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- ── N8N FLUXOS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS n8n_fluxos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid REFERENCES clients(id) ON DELETE CASCADE,
  status      text DEFAULT 'offline',
  webhook_url text DEFAULT '',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ── TOKENS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tokens (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id          uuid REFERENCES clients(id) ON DELETE CASCADE,
  openai_key         text DEFAULT '',
  waba_token         text DEFAULT '',
  waba_verify_token  text DEFAULT '',
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

-- ── ALERTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text DEFAULT 'INFO',
  title       text DEFAULT '',
  message     text DEFAULT '',
  read        boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ── AUDIT LOGS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid,
  user_email  text NOT NULL,
  action      text NOT NULL,
  resource    text,
  ip          text,
  created_at  timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs (user_email, created_at DESC);

-- ── FUNÇÕES ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_msgs(p_client_id uuid)
RETURNS void AS $$
  UPDATE clients
  SET msgs_today = msgs_today + 1,
      msgs_month = msgs_month + 1
  WHERE id = p_client_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_audit_logs() RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ── RLS ───────────────────────────────────────────────────
ALTER TABLE clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanhas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_aprendizados  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_fluxos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens           ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs       ENABLE ROW LEVEL SECURITY;

-- Políticas com proteção contra duplicatas
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON clients          FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON contatos         FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON pacientes        FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON campanhas        FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON whatsapp_numbers FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON servicos         FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON vendas           FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON ia_aprendizados  FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON chat_messages    FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON invoices         FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON portal_messages  FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON agendamentos     FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON professionals    FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON n8n_fluxos       FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON tokens           FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_authenticated" ON alerts           FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "only_service_role"       ON audit_logs       FOR ALL TO service_role  USING (true);                  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── REALTIME ──────────────────────────────────────────────
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE clients;        EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE contatos;       EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE portal_messages;EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE alerts;         EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;  EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE agendamentos;   EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE professionals;  EXCEPTION WHEN others THEN NULL; END $$;
