-- =============================================================================
-- SECRETARIA IA — NUTRI JULIANA
-- Schema PostgreSQL (02_postgres.sql)
-- Executar no banco PostgreSQL (memória de conversas + chat n8n)
-- =============================================================================

-- Extensão para busca semântica futura (pgvector)
CREATE EXTENSION IF NOT EXISTS vector;


-- =============================================================================
-- TABELA: historico_conversas
-- Armazena cada mensagem trocada, com identificação de agente e mídia
-- =============================================================================
CREATE TABLE IF NOT EXISTS historico_conversas (
  id           BIGSERIAL    PRIMARY KEY,
  phone        VARCHAR(20)  NOT NULL,
  role         VARCHAR(10)  NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content      TEXT         NOT NULL,
  tipo_midia   VARCHAR(20)  NOT NULL DEFAULT 'texto'
                            CHECK (tipo_midia IN ('texto', 'audio', 'imagem', 'documento')),
  agente       VARCHAR(30)
               CHECK (agente IN ('livia', 'reino_ia', 'gerente', 'humano', 'sistema', 'followup')),
  -- Metadados extras
  wa_message_id VARCHAR(100),          -- ID da mensagem no WhatsApp (para dedup)
  tokens_usados  INT,                   -- tokens da chamada OpenAI (para custo)
  modelo_usado   VARCHAR(50),           -- gpt-4o | gpt-4o-mini
  criado_em    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hist_phone         ON historico_conversas(phone);
CREATE INDEX IF NOT EXISTS idx_hist_phone_recente ON historico_conversas(phone, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_hist_wa_msg_id     ON historico_conversas(wa_message_id) WHERE wa_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hist_criado        ON historico_conversas(criado_em DESC);


-- =============================================================================
-- TABELA: chat_messages
-- Compatível com o nó "Postgres Chat Memory" do n8n
-- session_id = phone do contato (ou phone + setor para separar contextos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id           VARCHAR(100) PRIMARY KEY,
  session_id   VARCHAR(100) NOT NULL,
  message      JSONB        NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_session    ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_created    ON chat_messages(session_id, created_at DESC);


-- =============================================================================
-- TABELA: followup_templates
-- Templates editáveis de follow-up — podem ser alterados pelo app sem mudar n8n
-- =============================================================================
CREATE TABLE IF NOT EXISTS followup_templates (
  id           SERIAL       PRIMARY KEY,
  numero       INT          NOT NULL UNIQUE CHECK (numero BETWEEN 1 AND 5),
  titulo       VARCHAR(100) NOT NULL,
  template     TEXT         NOT NULL,
  -- Use {{nome}} e {{queixa}} como variáveis
  ativo        BOOLEAN      NOT NULL DEFAULT true,
  criado_em    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

INSERT INTO followup_templates (numero, titulo, template) VALUES
(1, 'Follow-up D+3',
'Olá, {{nome}}! Tudo bem por aí?

Vi que conversamos há alguns dias e queria saber se você ainda tem interesse em agendar sua avaliação com a Nutri Juliana.

O primeiro passo é sempre uma conversa — sem compromisso. Posso te ajudar a marcar?'),

(2, 'Follow-up D+7',
'{{nome}}, passando para deixar a porta aberta.

Sei que a vida é corrida, mas se {{queixa}} ainda estiver presente no seu dia a dia, uma avaliação personalizada pode fazer bastante diferença.

Quando quiser, é só me chamar aqui.'),

(3, 'Follow-up D+14 (Final)',
'{{nome}}, vou deixar este como último contato por enquanto — não quero ser invasiva.

Se em algum momento quiser cuidar da sua saúde com acompanhamento especializado, o consultório da Nutri Juliana está aqui.

Cuide-se bem. 💛')
ON CONFLICT (numero) DO NOTHING;

CREATE OR REPLACE FUNCTION set_followup_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_followup_updated_at
  BEFORE UPDATE ON followup_templates
  FOR EACH ROW EXECUTE FUNCTION set_followup_updated_at();


-- =============================================================================
-- TABELA: uso_tokens
-- Monitoramento de custo da OpenAI por agente e por dia
-- =============================================================================
CREATE TABLE IF NOT EXISTS uso_tokens (
  id              BIGSERIAL   PRIMARY KEY,
  data            DATE        NOT NULL DEFAULT CURRENT_DATE,
  agente          VARCHAR(30) NOT NULL,
  modelo          VARCHAR(50) NOT NULL,
  tokens_prompt   INT         NOT NULL DEFAULT 0,
  tokens_resposta INT         NOT NULL DEFAULT 0,
  total_chamadas  INT         NOT NULL DEFAULT 0,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (data, agente, modelo)
);

-- Função de upsert de tokens (chamada pelo n8n após cada request OpenAI)
CREATE OR REPLACE FUNCTION registrar_tokens(
  p_agente       VARCHAR(30),
  p_modelo       VARCHAR(50),
  p_prompt_tok   INT,
  p_resp_tok     INT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO uso_tokens (data, agente, modelo, tokens_prompt, tokens_resposta, total_chamadas)
  VALUES (CURRENT_DATE, p_agente, p_modelo, p_prompt_tok, p_resp_tok, 1)
  ON CONFLICT (data, agente, modelo) DO UPDATE SET
    tokens_prompt   = uso_tokens.tokens_prompt   + p_prompt_tok,
    tokens_resposta = uso_tokens.tokens_resposta + p_resp_tok,
    total_chamadas  = uso_tokens.total_chamadas  + 1;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- VIEW: últimas 20 mensagens por contato
-- Usada pelo n8n para montar o contexto do agente
-- =============================================================================
CREATE OR REPLACE VIEW v_historico_recente AS
SELECT DISTINCT ON (phone)
  phone,
  (
    SELECT json_agg(sub ORDER BY sub.criado_em ASC)
    FROM (
      SELECT role, content, tipo_midia, agente, criado_em
      FROM historico_conversas h2
      WHERE h2.phone = h1.phone
      ORDER BY criado_em DESC
      LIMIT 20
    ) sub
  ) AS mensagens
FROM historico_conversas h1;


-- =============================================================================
-- FUNÇÃO: Busca histórico formatado para contexto OpenAI
-- Retorna array JSON no formato [{role, content}]
-- =============================================================================
CREATE OR REPLACE FUNCTION get_historico_para_openai(
  p_phone    VARCHAR(20),
  p_limite   INT DEFAULT 20
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT json_agg(
    json_build_object('role', role, 'content', content)
    ORDER BY criado_em ASC
  )
  INTO v_result
  FROM (
    SELECT role, content, criado_em
    FROM historico_conversas
    WHERE phone = p_phone
    ORDER BY criado_em DESC
    LIMIT p_limite
  ) sub;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- FUNÇÃO: Limpa mensagens antigas do chat_messages (manutenção)
-- Mantém apenas as últimas 30 mensagens por session_id
-- =============================================================================
CREATE OR REPLACE FUNCTION limpar_chat_antigo()
RETURNS VOID AS $$
BEGIN
  DELETE FROM chat_messages
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at DESC) AS rn
      FROM chat_messages
    ) ranked
    WHERE rn <= 30
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- FIM DO SCHEMA POSTGRESQL
-- =============================================================================
