-- =============================================================================
-- SECRETARIA IA — OBSERVABILIDADE & DEBUG
-- 06_observabilidade.sql
-- Executar APÓS 03_saas_multitenancy.sql
-- =============================================================================


-- =============================================================================
-- TABELA: webhook_logs
-- Um registro por evento recebido pelo webhook do WhatsApp Cloud API
-- Escrito pelo n8n; lido pelo admin no painel de observabilidade
-- =============================================================================
CREATE TABLE IF NOT EXISTS webhook_logs (
  id                    BIGSERIAL PRIMARY KEY,
  user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  wa_phone_number_id    TEXT,                  -- tenant identificado
  evento                TEXT NOT NULL,          -- 'messages' | 'statuses' | 'verification' | 'unknown'
  direcao               TEXT,                  -- 'incoming' | 'outgoing' | null
  phone_contato         TEXT,                  -- número do contato
  conteudo_preview      TEXT,                  -- primeiros 200 chars da mensagem
  tipo_conteudo         TEXT,                  -- 'text' | 'audio' | 'image' | 'template' | 'status'
  status_processamento  TEXT NOT NULL DEFAULT 'received',
  -- 'received' | 'processed' | 'ignored' | 'error' | 'tenant_nao_encontrado' | 'ia_pausada'
  erro_detalhe          TEXT,
  payload_size_bytes    INT,                   -- tamanho do payload para detectar payloads anômalos
  duracao_ms            INT,                   -- tempo de processamento em ms
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_user    ON webhook_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_phone   ON webhook_logs(wa_phone_number_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status  ON webhook_logs(status_processamento, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_date    ON webhook_logs(created_at DESC);

ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "whl_service" ON webhook_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "whl_admin_read" ON webhook_logs FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    OR auth.uid() = user_id
  );


-- =============================================================================
-- TABELA: workflow_erros
-- Erros capturados pelos branches de erro dos workflows n8n
-- =============================================================================
CREATE TABLE IF NOT EXISTS workflow_erros (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  workflow_nome   TEXT NOT NULL,
  execucao_id     TEXT,               -- ID de execução do n8n (para correlacionar)
  node_nome       TEXT,               -- nó que gerou o erro
  mensagem_erro   TEXT NOT NULL,
  stack_trace     TEXT,
  payload         JSONB,              -- contexto do item que falhou (truncado)
  resolvido       BOOLEAN NOT NULL DEFAULT false,
  resolvido_em    TIMESTAMPTZ,
  resolvido_por   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wf_erros_user      ON workflow_erros(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wf_erros_workflow  ON workflow_erros(workflow_nome, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wf_erros_abertos   ON workflow_erros(resolvido, created_at DESC);

ALTER TABLE workflow_erros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wfe_service" ON workflow_erros FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "wfe_admin_read" ON workflow_erros FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "wfe_admin_update" ON workflow_erros FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );


-- =============================================================================
-- TABELA: health_checks
-- Registros periódicos do estado da integração (n8n → Supabase → WhatsApp)
-- =============================================================================
CREATE TABLE IF NOT EXISTS health_checks (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  componente      TEXT NOT NULL,  -- 'whatsapp_api' | 'supabase' | 'openai' | 'n8n'
  status          TEXT NOT NULL,  -- 'ok' | 'degradado' | 'erro'
  latencia_ms     INT,
  detalhe         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hc_user      ON health_checks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hc_comp      ON health_checks(componente, created_at DESC);

ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hc_service" ON health_checks FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "hc_admin_read" ON health_checks FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    OR auth.uid() = user_id
  );


-- =============================================================================
-- FUNÇÃO: marcar_erro_resolvido
-- =============================================================================
CREATE OR REPLACE FUNCTION marcar_erro_resolvido(p_id BIGINT, p_resolvido_por TEXT DEFAULT 'admin')
RETURNS VOID AS $$
BEGIN
  UPDATE workflow_erros
  SET resolvido = true, resolvido_em = now(), resolvido_por = p_resolvido_por
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- VIEW: resumo de saúde por tenant (últimas 24h)
-- =============================================================================
CREATE OR REPLACE VIEW v_saude_tenants AS
SELECT
  p.id                                                    AS user_id,
  p.nome_profissional,
  p.wa_conectado,
  p.wa_numero_display,
  p.plano,
  p.plano_ativo,

  -- Eventos de webhook nas últimas 24h
  COUNT(wl.id) FILTER (
    WHERE wl.created_at >= now() - interval '24 hours'
  )                                                       AS webhooks_24h,

  -- Erros de processamento nas últimas 24h
  COUNT(wl.id) FILTER (
    WHERE wl.status_processamento = 'error'
    AND   wl.created_at >= now() - interval '24 hours'
  )                                                       AS erros_webhook_24h,

  -- Erros de workflow abertos (não resolvidos)
  COUNT(we.id) FILTER (
    WHERE we.resolvido = false
  )                                                       AS erros_workflow_abertos,

  -- Última mensagem recebida
  MAX(wl.created_at) FILTER (
    WHERE wl.direcao = 'incoming'
  )                                                       AS ultimo_webhook_recebido

FROM profiles p
LEFT JOIN webhook_logs   wl ON wl.user_id = p.id
LEFT JOIN workflow_erros we ON we.user_id = p.id
GROUP BY p.id, p.nome_profissional, p.wa_conectado, p.wa_numero_display, p.plano, p.plano_ativo;


-- =============================================================================
-- FIM DA MIGRAÇÃO OBSERVABILIDADE
-- =============================================================================
