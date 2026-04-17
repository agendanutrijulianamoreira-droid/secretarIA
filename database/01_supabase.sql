-- =============================================================================
-- SECRETARIA IA — NUTRI JULIANA
-- Schema Supabase (01_supabase.sql)
-- Executar no SQL Editor do Supabase
-- =============================================================================

-- -----------------------------------------------------------------------------
-- EXTENSÕES
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- TABELA: consultorio_config
-- Configurações do consultório — alimentadas pelo App de gestão
-- =============================================================================
CREATE TABLE IF NOT EXISTS consultorio_config (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave            VARCHAR(100) UNIQUE NOT NULL,
  valor            TEXT,
  descricao        TEXT,
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Valores padrão
INSERT INTO consultorio_config (chave, valor, descricao) VALUES
  ('nome_consultorio',           'Nutri Juliana',                        'Nome exibido pela Lívia'),
  ('nome_nutricionista',         'Juliana Moreira',                      'Nome completo da profissional'),
  ('crn',                        'CRN-X XXXXX',                          'CRN da nutricionista'),
  ('especialidade',              'Saúde feminina, hormonal e intestinal', 'Especialidade principal'),
  ('metodo',                     'Método REINO',                          'Nome do método/marca'),
  ('horario_atendimento',        'Segunda a sexta, 8h às 18h',           'Horário que Juliana está disponível'),
  ('dias_sem_agendamento',       'sábado,domingo',                        'Dias sem agendamento (vírgula)'),
  ('tempo_resposta_humano_min',  '60',                                    'Minutos até resposta humana esperada'),
  ('followup_d1_dias',           '3',                                     'Dias após triagem para 1º follow-up'),
  ('followup_d2_dias',           '7',                                     'Dias após triagem para 2º follow-up'),
  ('followup_d3_dias',           '14',                                    'Dias após triagem para 3º follow-up (final)'),
  ('followup_max',               '3',                                     'Total de follow-ups antes de marcar inativo'),
  ('palavras_escalar_humano',    'urgente,emergência,dor forte,internação,desmaio,médico agora', 'Gatilhos de escalada imediata'),
  ('saudacao_livia',             'Olá! Sou a Lívia, assistente do consultório da Nutri Juliana. Como posso te ajudar hoje?', 'Mensagem de boas-vindas'),
  ('assinatura_livia',           'Lívia | Equipe Nutri Juliana',          'Assinatura em notificações'),
  ('lgpd_mensagem',              'Antes de continuarmos, preciso te informar que registramos as informações que você compartilhar para que possamos te atender melhor. Você concorda com isso? (responda Sim ou Não)', 'Mensagem de consentimento LGPD')
ON CONFLICT (chave) DO NOTHING;


-- =============================================================================
-- TABELA: contatos
-- CRM principal — um registro por número de WhatsApp
-- =============================================================================
CREATE TABLE IF NOT EXISTS contatos (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone                  VARCHAR(20) UNIQUE NOT NULL,  -- formato: 5511999999999
  nome                   VARCHAR(100),
  email                  VARCHAR(100),
  cidade                 VARCHAR(100),
  estado                 VARCHAR(50),
  principal_queixa       TEXT,

  -- Status e roteamento
  status                 VARCHAR(30)  NOT NULL DEFAULT 'LEAD',
  -- LEAD | AGENDADO | PACIENTE_ATIVO | INATIVO
  setor                  VARCHAR(30)  NOT NULL DEFAULT 'RECEPCAO',
  -- RECEPCAO | ACOMPANHAMENTO | FOLLOWUP | HUMANO | PRECO | EXAME
  etiqueta               VARCHAR(50)  NOT NULL DEFAULT 'NOVO_LEAD',
  -- NOVO_LEAD | EM_ATENDIMENTO_IA | AGUARDANDO_HUMANO | CONSULTA_AGENDADA
  -- PACIENTE_ATIVO | FOLLOW_UP_PENDENTE | INATIVO_30D | AGUARDANDO_PRECO

  -- Controle da IA
  ia_pausada             BOOLEAN      NOT NULL DEFAULT false,
  pausada_em             TIMESTAMPTZ,
  retomada_em            TIMESTAMPTZ,
  pausada_por            VARCHAR(100),  -- usuário do app que pausou

  -- LGPD
  lgpd_consent           BOOLEAN      DEFAULT NULL,  -- NULL = ainda não perguntou
  lgpd_consent_at        TIMESTAMPTZ,

  -- Atividade
  primeiro_contato       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  ultima_mensagem        TIMESTAMPTZ,
  total_mensagens        INT          NOT NULL DEFAULT 0,
  turno_atual            VARCHAR(10)  DEFAULT 'ia',  -- ia | humano

  -- Follow-up
  followup_count         INT          NOT NULL DEFAULT 0,
  ultimo_followup        TIMESTAMPTZ,
  proximo_followup       TIMESTAMPTZ,

  -- Agendamento e plano
  consulta_agendada_em   TIMESTAMPTZ,
  plano_ativo            VARCHAR(50),
  -- TRIMESTRAL | SEMESTRAL | ANUAL

  -- Segurança
  tentativa_jailbreak    BOOLEAN      NOT NULL DEFAULT false,
  jailbreak_count        INT          NOT NULL DEFAULT 0,

  -- Metadata
  created_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_contatos_phone        ON contatos(phone);
CREATE INDEX IF NOT EXISTS idx_contatos_status       ON contatos(status);
CREATE INDEX IF NOT EXISTS idx_contatos_etiqueta     ON contatos(etiqueta);
CREATE INDEX IF NOT EXISTS idx_contatos_followup     ON contatos(proximo_followup) WHERE ia_pausada = false;
CREATE INDEX IF NOT EXISTS idx_contatos_ia_pausada   ON contatos(ia_pausada);
CREATE INDEX IF NOT EXISTS idx_contatos_ultima_msg   ON contatos(ultima_mensagem DESC);


-- =============================================================================
-- TRIGGER: updated_at automático
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contatos_updated_at
  BEFORE UPDATE ON contatos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_config_updated_at
  BEFORE UPDATE ON consultorio_config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- TABELA: jailbreak_logs
-- Registros de tentativas de manipulação
-- =============================================================================
CREATE TABLE IF NOT EXISTS jailbreak_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         VARCHAR(20) NOT NULL,
  mensagem_raw  TEXT        NOT NULL,
  tipo          VARCHAR(30) DEFAULT 'JAILBREAK',  -- JAILBREAK | SENSIVEL
  agente        VARCHAR(30),
  resolvido     BOOLEAN     NOT NULL DEFAULT false,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jailbreak_phone    ON jailbreak_logs(phone);
CREATE INDEX IF NOT EXISTS idx_jailbreak_resolvido ON jailbreak_logs(resolvido) WHERE resolvido = false;


-- =============================================================================
-- TABELA: notificacoes_humano
-- Fila de notificações para Juliana (escaladas pela IA)
-- =============================================================================
CREATE TABLE IF NOT EXISTS notificacoes_humano (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       VARCHAR(20) NOT NULL,
  motivo      VARCHAR(100) NOT NULL,
  -- PRECO | EXAME | CLINICO | JAILBREAK | SOLICITACAO_HUMANO | CONFLITO
  resumo      TEXT,
  lida        BOOLEAN      NOT NULL DEFAULT false,
  lida_em     TIMESTAMPTZ,
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_lida    ON notificacoes_humano(lida) WHERE lida = false;
CREATE INDEX IF NOT EXISTS idx_notif_phone   ON notificacoes_humano(phone);
CREATE INDEX IF NOT EXISTS idx_notif_criado  ON notificacoes_humano(criado_em DESC);


-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Ativar para todas as tabelas — o app usa service_key server-side
-- =============================================================================
ALTER TABLE contatos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultorio_config    ENABLE ROW LEVEL SECURITY;
ALTER TABLE jailbreak_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes_humano   ENABLE ROW LEVEL SECURITY;

-- Política: service_role (usado pelo n8n e backend) tem acesso total
-- anon_key NÃO tem acesso (dados de saúde — LGPD)
CREATE POLICY "service_role_all_contatos"
  ON contatos FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_config"
  ON consultorio_config FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_jailbreak"
  ON jailbreak_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_notificacoes"
  ON notificacoes_humano FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- O App React autentica com JWT do Supabase Auth (usuária = Juliana)
-- Política: usuária autenticada lê e escreve tudo
CREATE POLICY "authenticated_all_contatos"
  ON contatos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_all_config"
  ON consultorio_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_read_jailbreak"
  ON jailbreak_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_jailbreak"
  ON jailbreak_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_all_notificacoes"
  ON notificacoes_humano FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- =============================================================================
-- REALTIME
-- Habilitar para tabelas que o app monitora em tempo real
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE contatos;
ALTER PUBLICATION supabase_realtime ADD TABLE notificacoes_humano;


-- =============================================================================
-- FUNÇÕES UTILITÁRIAS
-- =============================================================================

-- Busca contato por phone, criando se não existir
CREATE OR REPLACE FUNCTION upsert_contato(p_phone VARCHAR(20))
RETURNS contatos AS $$
DECLARE
  v_contato contatos;
BEGIN
  INSERT INTO contatos (phone)
  VALUES (p_phone)
  ON CONFLICT (phone) DO UPDATE
    SET ultima_mensagem  = now(),
        total_mensagens  = contatos.total_mensagens + 1
  RETURNING * INTO v_contato;
  RETURN v_contato;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pausa IA para um contato
CREATE OR REPLACE FUNCTION pausar_ia(p_phone VARCHAR(20), p_usuario VARCHAR(100) DEFAULT 'sistema')
RETURNS VOID AS $$
BEGIN
  UPDATE contatos SET
    ia_pausada   = true,
    pausada_em   = now(),
    pausada_por  = p_usuario,
    turno_atual  = 'humano',
    etiqueta     = 'AGUARDANDO_HUMANO'
  WHERE phone = p_phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retoma IA para um contato
CREATE OR REPLACE FUNCTION retomar_ia(p_phone VARCHAR(20))
RETURNS VOID AS $$
BEGIN
  UPDATE contatos SET
    ia_pausada   = false,
    retomada_em  = now(),
    turno_atual  = 'ia',
    etiqueta     = 'EM_ATENDIMENTO_IA'
  WHERE phone = p_phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Registra consentimento LGPD
CREATE OR REPLACE FUNCTION registrar_lgpd(p_phone VARCHAR(20), p_consent BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE contatos SET
    lgpd_consent    = p_consent,
    lgpd_consent_at = now()
  WHERE phone = p_phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Busca contatos elegíveis para follow-up
CREATE OR REPLACE FUNCTION contatos_para_followup()
RETURNS SETOF contatos AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM contatos
  WHERE proximo_followup <= now()
    AND status IN ('LEAD', 'AGENDADO')
    AND ia_pausada = false
    AND lgpd_consent = true
    AND followup_count < (
      SELECT valor::int FROM consultorio_config WHERE chave = 'followup_max'
    )
  ORDER BY proximo_followup ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- FIM DO SCHEMA SUPABASE
-- =============================================================================
