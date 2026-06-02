-- ============================================================
-- SecretarIA — Ativa RLS e políticas em todas as tabelas
-- ============================================================

-- Ativa RLS em todas as tabelas (idempotente)
ALTER TABLE IF EXISTS clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contatos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pacientes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS campanhas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS servicos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vendas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ia_aprendizados  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS portal_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agendamentos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS professionals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS n8n_fluxos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tokens           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alerts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs       ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas se existirem e recria (garante consistência)
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON clients;          EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON contatos;         EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON pacientes;        EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON campanhas;        EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON whatsapp_numbers; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON servicos;         EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON vendas;           EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON ia_aprendizados;  EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON chat_messages;    EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON invoices;         EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON portal_messages;  EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON agendamentos;     EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON professionals;    EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON n8n_fluxos;       EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON tokens;           EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_all_authenticated" ON alerts;           EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "only_service_role"       ON audit_logs;       EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- Cria políticas novas
CREATE POLICY "allow_all_authenticated" ON clients          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON contatos         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON pacientes        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON campanhas        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON whatsapp_numbers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON servicos         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON vendas           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON ia_aprendizados  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON chat_messages    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON invoices         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON portal_messages  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON agendamentos     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON professionals    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON n8n_fluxos       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON tokens           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON alerts           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "only_service_role"       ON audit_logs       FOR ALL TO service_role USING (true);
