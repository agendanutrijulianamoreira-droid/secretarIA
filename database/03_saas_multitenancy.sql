-- =============================================================================
-- SECRETARIA IA — PLATAFORMA SAAS MULTI-TENANT
-- 03_saas_multitenancy.sql
-- Executar APÓS 01_supabase.sql
-- Requer: Supabase Auth habilitado
-- =============================================================================


-- =============================================================================
-- TABELA: profiles
-- Uma linha por nutricionista cadastrada na plataforma
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dados pessoais e do consultório
  nome_profissional       TEXT,
  especialidade           TEXT,
  registro_profissional   TEXT,       -- CRN, CRM, etc.
  nome_consultorio        TEXT,
  metodo_marca            TEXT,       -- Ex: Método REINO
  foco_atendimento        TEXT,
  publico_alvo            TEXT,
  modalidade              TEXT DEFAULT 'online',   -- online | presencial | hibrido
  horario_atendimento     TEXT DEFAULT 'Segunda a sexta, 8h às 18h',
  dias_sem_agendamento    TEXT DEFAULT 'sábado,domingo',
  cidade                  TEXT,
  estado                  TEXT,

  -- WhatsApp Cloud API (Meta Oficial)
  wa_phone_number_id      TEXT UNIQUE,  -- identifica o tenant no webhook
  wa_access_token         TEXT,         -- token permanente (System User)
  wa_waba_id              TEXT,         -- WhatsApp Business Account ID
  wa_verify_token         TEXT DEFAULT gen_random_uuid()::text,  -- token único p/ verificação
  wa_numero_display       TEXT,         -- número formatado para exibição
  wa_conectado            BOOLEAN NOT NULL DEFAULT false,
  wa_conectado_em         TIMESTAMPTZ,

  -- Configuração da IA
  nome_assistente         TEXT NOT NULL DEFAULT 'Lívia',
  tom_voz                 TEXT NOT NULL DEFAULT 'acolhedor',
  -- acolhedor | profissional | descontraido

  -- Plataforma / billing
  is_admin                BOOLEAN NOT NULL DEFAULT false,
  plano                   TEXT NOT NULL DEFAULT 'trial',
  -- trial | starter | pro | enterprise
  plano_ativo             BOOLEAN NOT NULL DEFAULT false,
  trial_expira_em         TIMESTAMPTZ DEFAULT (now() + interval '14 days'),

  -- Onboarding
  onboarding_step         INT NOT NULL DEFAULT 0,
  -- 0=não iniciado 1=consultório 2=assistente 3=whatsapp 4=concluído
  onboarding_completo     BOOLEAN NOT NULL DEFAULT false,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: usuária vê apenas o próprio perfil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_self"
  ON profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_service_role"
  ON profiles FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Realtime para onboarding ao vivo
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;


-- =============================================================================
-- TABELA: config
-- Configurações flexíveis por nutricionista (chave-valor)
-- Substitui consultorio_config global
-- =============================================================================
CREATE TABLE IF NOT EXISTS config (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chave       TEXT NOT NULL,
  valor       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, chave)
);

CREATE INDEX IF NOT EXISTS idx_config_user ON config(user_id);

CREATE TRIGGER trg_config_user_updated_at
  BEFORE UPDATE ON config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "config_owner"
  ON config FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "config_service_role"
  ON config FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);


-- =============================================================================
-- ADICIONAR user_id NAS TABELAS EXISTENTES
-- =============================================================================

-- contatos
ALTER TABLE contatos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_contatos_user ON contatos(user_id);

-- notificacoes_humano
ALTER TABLE notificacoes_humano ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notificacoes_humano(user_id);

-- jailbreak_logs
ALTER TABLE jailbreak_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_jailbreak_user ON jailbreak_logs(user_id);


-- =============================================================================
-- ATUALIZAR RLS DAS TABELAS EXISTENTES
-- =============================================================================

-- Remover políticas antigas globais
DROP POLICY IF EXISTS "authenticated_all_contatos" ON contatos;
DROP POLICY IF EXISTS "authenticated_all_notificacoes" ON notificacoes_humano;
DROP POLICY IF EXISTS "authenticated_read_jailbreak" ON jailbreak_logs;
DROP POLICY IF EXISTS "authenticated_update_jailbreak" ON jailbreak_logs;

-- Novas políticas por tenant
CREATE POLICY "contatos_owner"
  ON contatos FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notificacoes_owner"
  ON notificacoes_humano FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "jailbreak_owner"
  ON jailbreak_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- NOVOS CAMPOS NOS CONTATOS (funcionalidades SaaS)
-- =============================================================================
ALTER TABLE contatos
  ADD COLUMN IF NOT EXISTS data_nascimento        DATE,
  ADD COLUMN IF NOT EXISTS nps_ultima_nota        INT CHECK (nps_ultima_nota BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS nps_data               TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS anamnese_enviada        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS anamnese_preenchida     BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS anamnese_enviada_em     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS retorno_agendado_em     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consulta_realizada_em   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS posconsulta_enviada     BOOLEAN DEFAULT false;


-- =============================================================================
-- TABELA: uso_tokens_saas
-- Monitoramento de custo por tenant
-- =============================================================================
CREATE TABLE IF NOT EXISTS uso_tokens_saas (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  data            DATE NOT NULL DEFAULT CURRENT_DATE,
  agente          VARCHAR(30) NOT NULL,
  modelo          VARCHAR(50) NOT NULL,
  tokens_prompt   INT NOT NULL DEFAULT 0,
  tokens_resposta INT NOT NULL DEFAULT 0,
  total_chamadas  INT NOT NULL DEFAULT 0,
  UNIQUE (user_id, data, agente, modelo)
);

CREATE INDEX IF NOT EXISTS idx_tokens_user ON uso_tokens_saas(user_id, data DESC);

ALTER TABLE uso_tokens_saas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tokens_owner" ON uso_tokens_saas FOR ALL
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tokens_service" ON uso_tokens_saas FOR ALL
  TO service_role USING (true) WITH CHECK (true);


-- =============================================================================
-- FUNÇÃO: criar perfil automaticamente ao criar conta
-- Disparada pelo trigger do Supabase Auth
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nome_profissional)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_profissional', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger no Auth
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =============================================================================
-- FUNÇÃO: lookup de tenant pelo phone_number_id (usada pelo n8n)
-- =============================================================================
CREATE OR REPLACE FUNCTION get_tenant_by_phone_number_id(p_phone_number_id TEXT)
RETURNS TABLE (
  user_id                 UUID,
  nome_assistente         TEXT,
  wa_access_token         TEXT,
  wa_phone_number_id      TEXT,
  onboarding_completo     BOOLEAN,
  plano_ativo             BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.nome_assistente,
    p.wa_access_token,
    p.wa_phone_number_id,
    p.onboarding_completo,
    p.plano_ativo
  FROM profiles p
  WHERE p.wa_phone_number_id = p_phone_number_id
    AND p.wa_conectado = true
    AND p.onboarding_completo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- FUNÇÃO: upsert de config por tenant (usada pelo app)
-- =============================================================================
CREATE OR REPLACE FUNCTION set_config(p_user_id UUID, p_chave TEXT, p_valor TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO config (user_id, chave, valor)
  VALUES (p_user_id, p_chave, p_valor)
  ON CONFLICT (user_id, chave) DO UPDATE SET valor = p_valor, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- FUNÇÃO: retorna toda a config de um tenant como JSON
-- Usada pelo n8n para carregar configuração da nutricionista
-- =============================================================================
CREATE OR REPLACE FUNCTION get_tenant_config(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile JSONB;
  v_config  JSONB;
BEGIN
  SELECT to_jsonb(p) INTO v_profile
  FROM profiles p WHERE p.id = p_user_id;

  SELECT jsonb_object_agg(chave, valor) INTO v_config
  FROM config WHERE user_id = p_user_id;

  RETURN v_profile || COALESCE(v_config, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- INSERIR CONFIGS PADRÃO PARA NOVOS USUÁRIOS
-- Chamar quando onboarding_step = 4 (concluído)
-- =============================================================================
CREATE OR REPLACE FUNCTION inserir_config_padrao(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO config (user_id, chave, valor) VALUES
    (p_user_id, 'followup_d1_dias',           '3'),
    (p_user_id, 'followup_d2_dias',           '7'),
    (p_user_id, 'followup_d3_dias',           '14'),
    (p_user_id, 'followup_max',               '3'),
    (p_user_id, 'tempo_resposta_humano_min',  '60'),
    (p_user_id, 'confirmacao_consulta_ativa', 'true'),
    (p_user_id, 'confirmacao_horas_antes',    '24'),
    (p_user_id, 'nps_ativo',                  'true'),
    (p_user_id, 'nps_horas_apos_consulta',    '48'),
    (p_user_id, 'aniversario_ativo',          'true'),
    (p_user_id, 'reengajamento_ativo',        'true'),
    (p_user_id, 'reengajamento_dias',         '30'),
    (p_user_id, 'palavras_escalar_humano',    'urgente,emergência,dor forte,internação,desmaio,médico agora'),
    (p_user_id, 'followup_template_1',        'Olá, {{nome}}! Vi que conversamos há alguns dias e queria saber se ainda tem interesse em agendar sua avaliação. O primeiro passo é sempre uma conversa — sem compromisso. Posso te ajudar?'),
    (p_user_id, 'followup_template_2',        '{{nome}}, passando para deixar a porta aberta. Se {{queixa}} ainda estiver presente no seu dia a dia, uma avaliação personalizada pode fazer bastante diferença. Quando quiser, é só me chamar.'),
    (p_user_id, 'followup_template_3',        '{{nome}}, vou deixar este como último contato por enquanto — não quero ser invasiva. Se em algum momento quiser cuidar da sua saúde com acompanhamento especializado, estaremos aqui. Cuide-se bem. 💛'),
    (p_user_id, 'lgpd_mensagem',              'Antes de continuarmos, preciso te informar que registramos as informações compartilhadas para te atender melhor. Seus dados são tratados com sigilo. Você concorda? (responda Sim ou Não)'),
    (p_user_id, 'mensagem_preco',             'Os investimentos dos planos são personalizados conforme o acompanhamento escolhido. A equipe vai te passar todos os detalhes em breve — quer que eu facilite esse contato?'),
    (p_user_id, 'saudacao_inicial',           'Olá! Sou {{nome_assistente}}, assistente do consultório da {{nome_profissional}}. Como posso te ajudar hoje?')
  ON CONFLICT (user_id, chave) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- VIEW: métricas por tenant (usada no dashboard)
-- =============================================================================
CREATE OR REPLACE VIEW v_metricas_tenant AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE status = 'LEAD')                           AS total_leads,
  COUNT(*) FILTER (WHERE status = 'PACIENTE_ATIVO')                 AS total_pacientes_ativos,
  COUNT(*) FILTER (WHERE etiqueta = 'AGUARDANDO_HUMANO')            AS aguardando_humano,
  COUNT(*) FILTER (WHERE etiqueta = 'CONSULTA_AGENDADA')            AS consultas_agendadas,
  COUNT(*) FILTER (WHERE etiqueta = 'FOLLOW_UP_PENDENTE')           AS followups_pendentes,
  COUNT(*) FILTER (WHERE tentativa_jailbreak = true)                AS tentativas_jailbreak,
  COUNT(*) FILTER (WHERE
    ultima_mensagem >= now() - interval '7 days')                   AS ativos_7d,
  AVG(nps_ultima_nota) FILTER (WHERE nps_ultima_nota IS NOT NULL)   AS nps_medio,
  COUNT(*) FILTER (WHERE
    primeiro_contato >= date_trunc('week', now()))                  AS leads_esta_semana,
  COUNT(*) FILTER (WHERE
    consulta_agendada_em >= date_trunc('week', now()))              AS consultas_esta_semana
FROM contatos
GROUP BY user_id;

-- Apenas a própria nutricionista vê suas métricas
CREATE OR REPLACE VIEW v_minhas_metricas AS
SELECT * FROM v_metricas_tenant
WHERE user_id = auth.uid();


-- =============================================================================
-- FIM DA MIGRAÇÃO SAAS
-- =============================================================================
