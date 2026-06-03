-- ============================================================
-- SecretarIA — Configurações de Agentes por Cliente
-- ============================================================

CREATE TABLE IF NOT EXISTS agente_configs (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            uuid REFERENCES clients(id) ON DELETE CASCADE,
  tipo                 text NOT NULL,
  ativo                boolean DEFAULT true,
  nome                 text DEFAULT '',
  instrucoes           text DEFAULT '',
  pode_falar_preco     boolean DEFAULT false,
  pode_agendar         boolean DEFAULT false,
  escalar_para_humano  boolean DEFAULT true,
  config_extra         jsonb DEFAULT '{}',
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now(),
  UNIQUE (client_id, tipo)
);

ALTER TABLE agente_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client owns agente_configs"
  ON agente_configs FOR ALL
  USING (true);
