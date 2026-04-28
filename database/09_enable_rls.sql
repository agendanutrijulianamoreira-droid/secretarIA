-- FASE 2: Implementação de Row Level Security (RLS) para Isolamento Estrito
-- Objetivo: Garantir que cada clínica (tenant) só acesse seus próprios dados no PostgreSQL.

-- 1. Ativar RLS em todas as tabelas
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 2. Criar função auxiliar para obter o ID da clínica atual da sessão
-- O backend deve executar: SET LOCAL app.current_clinic_id = 'ID_DA_CLINICA';
-- Se não houver ID definido, o acesso é negado (Zero Trust).

-- 3. Políticas para a tabela 'clinics'
CREATE POLICY clinics_isolation_policy ON clinics
    USING (id = (current_setting('app.current_clinic_id', true)::uuid));

-- 4. Políticas para a tabela 'patients'
CREATE POLICY patients_isolation_policy ON patients
    USING (clinic_id = (current_setting('app.current_clinic_id', true)::uuid));

-- 5. Políticas para a tabela 'chat_messages'
CREATE POLICY messages_isolation_policy ON chat_messages
    USING (clinic_id = (current_setting('app.current_clinic_id', true)::uuid));

-- 6. Políticas para a tabela 'appointments'
CREATE POLICY appointments_isolation_policy ON appointments
    USING (clinic_id = (current_setting('app.current_clinic_id', true)::uuid));

-- NOTA PARA O ADMINISTRADOR:
-- Para o usuário 'postgres' (superusuário) ou o dono do schema contornar o RLS (ex: dashboards administrativos),
-- deve-se garantir que o RLS não seja aplicado ou usar políticas BYPASSRLS.
-- Para o backend em produção, use um usuário de banco de dados que não seja o dono da tabela.

-- 7. Política especial para o Admin (opcional, dependendo de como o admin acessa o banco)
-- Se o admin usar o mesmo fluxo, ele também define o 'app.current_clinic_id'.
-- Se for um acesso global, pode-se criar uma política baseada em role:
-- CREATE POLICY admin_all ON clinics FOR ALL TO admin_role USING (true);
