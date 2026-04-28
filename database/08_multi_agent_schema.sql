-- FASE 1: Preparação para Arquitetura Multi-Agente sem n8n

-- 1. Tabela de Clínicas (Tenants)
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    whatsapp_number TEXT UNIQUE, -- Número de destino que identifica a clínica
    receptionist_phone TEXT,    -- Número para transbordo humano
    google_calendar_id TEXT,
    asaas_api_key TEXT,
    config_json JSONB,          -- Horários, serviços, preços, etc.
    assistant_id TEXT,          -- Caso opte por usar OpenAI Assistants API
    prompt_context TEXT,        -- Instruções específicas e tom de voz
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Pacientes
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinic_id, phone)
);

-- 3. Tabela de Histórico de Conversas (Threads/Messages)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para otimização de busca de contexto
CREATE INDEX IF NOT EXISTS idx_chat_messages_patient ON chat_messages(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clinics_whatsapp ON clinics(whatsapp_number);

-- 4. Tabela de Agendamentos (Appointments)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled', -- scheduled, confirmed, cancelled
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(start_time);
