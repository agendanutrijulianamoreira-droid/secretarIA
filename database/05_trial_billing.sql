-- =============================================================================
-- SECRETARIA IA — GESTÃO DE PLANOS & BILLING
-- 05_trial_billing.sql
-- Executar APÓS 03_saas_multitenancy.sql
-- =============================================================================


-- =============================================================================
-- NOVOS CAMPOS EM PROFILES (billing)
-- =============================================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id         TEXT,
  ADD COLUMN IF NOT EXISTS plano_renovacao_em      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plano_cancelado_em      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS billing_email           TEXT;


-- =============================================================================
-- TABELA: plano_eventos
-- Histórico de mudanças de plano por tenant
-- =============================================================================
CREATE TABLE IF NOT EXISTS plano_eventos (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evento          TEXT NOT NULL,
  -- 'trial_iniciado' | 'trial_estendido' | 'plano_ativado' | 'plano_cancelado'
  -- | 'upgrade' | 'downgrade' | 'plano_expirado'
  plano_anterior  TEXT,
  plano_novo      TEXT,
  detalhes        JSONB,
  criado_por      TEXT,   -- 'sistema' | 'admin' | 'stripe_webhook'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plano_eventos_user
  ON plano_eventos(user_id, created_at DESC);

ALTER TABLE plano_eventos ENABLE ROW LEVEL SECURITY;

-- Admins (service_role) escrevem; usuária só lê o próprio histórico
CREATE POLICY "plano_eventos_service"
  ON plano_eventos FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "plano_eventos_owner_read"
  ON plano_eventos FOR SELECT TO authenticated
  USING (auth.uid() = user_id);


-- =============================================================================
-- FUNÇÃO: estender_trial
-- Usada pelo admin para conceder dias extras de trial
-- =============================================================================
CREATE OR REPLACE FUNCTION estender_trial(p_user_id UUID, p_dias INT DEFAULT 7)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET
    trial_expira_em = GREATEST(COALESCE(trial_expira_em, now()), now())
                      + (p_dias || ' days')::interval,
    updated_at = now()
  WHERE id = p_user_id;

  INSERT INTO plano_eventos (user_id, evento, detalhes, criado_por)
  VALUES (
    p_user_id,
    'trial_estendido',
    jsonb_build_object('dias_adicionados', p_dias),
    'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- FUNÇÃO: cancelar_plano
-- Desativa plano e registra evento
-- =============================================================================
CREATE OR REPLACE FUNCTION cancelar_plano(p_user_id UUID, p_motivo TEXT DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  v_plano TEXT;
BEGIN
  SELECT plano INTO v_plano FROM profiles WHERE id = p_user_id;

  UPDATE profiles
  SET
    plano_ativo       = false,
    plano_cancelado_em = now(),
    updated_at        = now()
  WHERE id = p_user_id;

  INSERT INTO plano_eventos (user_id, evento, plano_anterior, detalhes, criado_por)
  VALUES (
    p_user_id,
    'plano_cancelado',
    v_plano,
    CASE WHEN p_motivo IS NOT NULL
      THEN jsonb_build_object('motivo', p_motivo)
      ELSE NULL
    END,
    'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- TRIGGER: log automático ao mudar plano/status
-- =============================================================================
CREATE OR REPLACE FUNCTION _log_plano_evento()
RETURNS TRIGGER AS $$
BEGIN
  -- Plano mudou OU ativo/inativo mudou
  IF (OLD.plano IS DISTINCT FROM NEW.plano)
  OR (OLD.plano_ativo IS DISTINCT FROM NEW.plano_ativo) THEN

    -- Só loga se ainda não foi inserido por uma das funções acima
    -- (evita duplicatas — as funções inserem diretamente)
    IF NOT OLD.plano_ativo AND NEW.plano_ativo AND OLD.plano = NEW.plano THEN
      INSERT INTO plano_eventos (user_id, evento, plano_anterior, plano_novo, criado_por)
      VALUES (NEW.id, 'plano_ativado', OLD.plano, NEW.plano, 'sistema');

    ELSIF OLD.plano_ativo AND NOT NEW.plano_ativo AND OLD.plano = NEW.plano THEN
      -- cancelar_plano já insere; só loga se vier de UPDATE direto
      NULL;

    ELSIF OLD.plano IS DISTINCT FROM NEW.plano THEN
      INSERT INTO plano_eventos (user_id, evento, plano_anterior, plano_novo, criado_por)
      VALUES (
        NEW.id,
        CASE
          WHEN NEW.plano IN ('pro','enterprise') AND OLD.plano IN ('trial','starter') THEN 'upgrade'
          WHEN NEW.plano IN ('trial','starter') AND OLD.plano IN ('pro','enterprise') THEN 'downgrade'
          ELSE 'plano_alterado'
        END,
        OLD.plano,
        NEW.plano,
        'sistema'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cria o trigger apenas se ainda não existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_log_plano' AND tgrelid = 'profiles'::regclass
  ) THEN
    CREATE TRIGGER trg_log_plano
      AFTER UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION _log_plano_evento();
  END IF;
END;
$$;


-- =============================================================================
-- VIEW: resumo de uso mensal por tenant (para a aba Plano)
-- =============================================================================
CREATE OR REPLACE VIEW v_uso_mensal AS
SELECT
  user_id,
  SUM(tokens_prompt + tokens_resposta)  AS total_tokens,
  SUM(total_chamadas)                   AS total_chamadas,
  -- Estimativa de custo (GPT-4o-mini: ~$0.15/1M input + $0.60/1M output)
  ROUND(
    (SUM(tokens_prompt)  * 0.00000015 +
     SUM(tokens_resposta) * 0.0000006 )::numeric,
    4
  )                                      AS custo_usd_estimado
FROM uso_tokens_saas
WHERE data >= date_trunc('month', CURRENT_DATE)
GROUP BY user_id;

CREATE OR REPLACE VIEW v_meu_uso_mensal AS
SELECT * FROM v_uso_mensal WHERE user_id = auth.uid();


-- =============================================================================
-- FIM DA MIGRAÇÃO BILLING
-- =============================================================================
