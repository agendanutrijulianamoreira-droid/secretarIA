-- =============================================================================
-- SECRETARIA IA — CAMPOS EXTRAS PARA NOVOS WORKFLOWS
-- 04_workflows_extras.sql
-- Executar APÓS 01_supabase.sql e 02_postgres.sql
--
-- Adiciona os campos necessários para:
--   - workflow_confirmacao   (confirmação de consulta)
--   - workflow_nps           (pesquisa NPS pós-consulta)
--   - workflow_aniversario   (mensagem de aniversário)
--   - workflow_reengajamento (reengajamento de inativos)
-- =============================================================================


-- -----------------------------------------------------------------------------
-- CAMPOS: confirmação de consulta
-- -----------------------------------------------------------------------------
ALTER TABLE contatos
  ADD COLUMN IF NOT EXISTS confirmacao_enviada      BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirmacao_enviada_em   TIMESTAMPTZ;

-- Índice para o workflow encontrar rapidamente os que precisam de confirmação
CREATE INDEX IF NOT EXISTS idx_contatos_confirmacao
  ON contatos(etiqueta, consulta_agendada_em)
  WHERE etiqueta = 'CONSULTA_AGENDADA' AND confirmacao_enviada = false;


-- -----------------------------------------------------------------------------
-- CAMPOS: NPS pós-consulta
-- -----------------------------------------------------------------------------
ALTER TABLE contatos
  ADD COLUMN IF NOT EXISTS nps_enviado      BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS nps_enviado_em   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS nps_nota         SMALLINT    CHECK (nps_nota BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS nps_respondido_em TIMESTAMPTZ;

-- Reeset de NPS quando volta a ser PACIENTE_ATIVO (nova consulta)
-- O workflow seta nps_enviado = false ao mudar status para PACIENTE_ATIVO


-- -----------------------------------------------------------------------------
-- CAMPOS: aniversário
-- -----------------------------------------------------------------------------
ALTER TABLE contatos
  ADD COLUMN IF NOT EXISTS data_nascimento       DATE,
  ADD COLUMN IF NOT EXISTS aniversario_enviado_em TIMESTAMPTZ;
-- aniversario_enviado_em guarda o ano do último envio — evita reenvio no mesmo ano

-- Índice para busca por mês/dia de nascimento
CREATE INDEX IF NOT EXISTS idx_contatos_nascimento
  ON contatos(
    EXTRACT(MONTH FROM data_nascimento),
    EXTRACT(DAY FROM data_nascimento)
  )
  WHERE data_nascimento IS NOT NULL;


-- -----------------------------------------------------------------------------
-- CAMPOS: reengajamento
-- -----------------------------------------------------------------------------
ALTER TABLE contatos
  ADD COLUMN IF NOT EXISTS reengajamento_enviado_em  TIMESTAMPTZ;
-- Armazena quando o último reengajamento foi enviado — evita spam


-- -----------------------------------------------------------------------------
-- CONFIG PADRÃO: novos workflows
-- Inseridos em consultorio_config (sistema single-tenant)
-- No SaaS multi-tenant, inserir via inserir_config_padrao() em 03_saas_multitenancy.sql
-- -----------------------------------------------------------------------------
INSERT INTO consultorio_config (chave, valor, descricao) VALUES
  ('confirmacao_consulta_ativa',  'true',  'Ativa o envio automático de confirmação de consulta'),
  ('confirmacao_horas_antes',     '24',    'Quantas horas antes da consulta enviar a confirmação'),
  ('tempo_resposta_humano_min',   '60',    'Minutos aguardados para resposta do humano'),
  ('nps_ativo',                   'true',  'Ativa o envio automático de NPS após consulta'),
  ('nps_horas_apos_consulta',     '48',    'Horas após a consulta para enviar o NPS'),
  ('aniversario_ativo',           'true',  'Ativa mensagem automática de aniversário'),
  ('reengajamento_ativo',         'true',  'Ativa reengajamento automático de inativos'),
  ('reengajamento_dias',          '30',    'Dias sem contato para disparar reengajamento')
ON CONFLICT (chave) DO NOTHING;


-- -----------------------------------------------------------------------------
-- ATUALIZAÇÃO: inserir_config_padrao() no multi-tenant (adicionar no 03_saas)
-- Executar manualmente para adicionar os novos defaults ao SaaS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION inserir_config_padrao(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO config (user_id, chave, valor) VALUES
    -- Consultório
    (p_user_id, 'nome_consultorio',           'Meu Consultório'),
    (p_user_id, 'nome_assistente',             'Lívia'),
    (p_user_id, 'tom_voz',                     'acolhedor'),
    (p_user_id, 'horario_atendimento',         'Segunda a sexta, 8h às 18h'),
    (p_user_id, 'dias_sem_agendamento',        'sábado,domingo'),
    -- Follow-up
    (p_user_id, 'followup_d1_dias',            '3'),
    (p_user_id, 'followup_d2_dias',            '7'),
    (p_user_id, 'followup_d3_dias',            '14'),
    (p_user_id, 'followup_max',                '3'),
    -- Confirmação
    (p_user_id, 'confirmacao_consulta_ativa',  'true'),
    (p_user_id, 'confirmacao_horas_antes',     '24'),
    (p_user_id, 'tempo_resposta_humano_min',   '60'),
    -- NPS
    (p_user_id, 'nps_ativo',                   'true'),
    (p_user_id, 'nps_horas_apos_consulta',     '48'),
    -- Aniversário
    (p_user_id, 'aniversario_ativo',           'true'),
    -- Reengajamento
    (p_user_id, 'reengajamento_ativo',         'true'),
    (p_user_id, 'reengajamento_dias',          '30'),
    -- LGPD
    (p_user_id, 'lgpd_mensagem',               'Antes de continuarmos, preciso te informar que registramos as informações que você compartilhar para que possamos te atender melhor. Você concorda com isso? (responda Sim ou Não)'),
    (p_user_id, 'palavras_escalar_humano',     'urgente,emergência,dor forte,internação,desmaio,médico agora')
  ON CONFLICT (user_id, chave) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- FIM DO SCRIPT
-- =============================================================================
