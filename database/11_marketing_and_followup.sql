-- Migration 11: Marketing and Active Follow-up Engine
-- Created for multi-tenant strict isolation (Zero Trust) based on clinics

-- 1. Create Message Templates Table
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., 'welcome', 'puv', 'nps', 'recovery', 'reengagement'
    content_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Active Promotions Table
CREATE TABLE IF NOT EXISTS active_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    discount_rules TEXT,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Lead Followups Table
CREATE TABLE IF NOT EXISTS lead_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    followup_stage INT NOT NULL, -- e.g., 1 (Day 1), 3 (Day 3), 7 (Day 7)
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'replied'
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_followups ENABLE ROW LEVEL SECURITY;

-- 5. Strict Isolation Policies (Zero Trust)
-- Ensure a clinic user can only see/manage data belonging to their clinic_id

CREATE POLICY "Strict isolation for message_templates by clinic_id" 
ON message_templates 
FOR ALL 
USING (clinic_id = ((auth.jwt() -> 'user_metadata'::text) ->> 'clinic_id')::uuid);

CREATE POLICY "Strict isolation for active_promotions by clinic_id" 
ON active_promotions 
FOR ALL 
USING (clinic_id = ((auth.jwt() -> 'user_metadata'::text) ->> 'clinic_id')::uuid);

CREATE POLICY "Strict isolation for lead_followups by clinic_id" 
ON lead_followups 
FOR ALL 
USING (clinic_id = ((auth.jwt() -> 'user_metadata'::text) ->> 'clinic_id')::uuid);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_msg_templates_clinic ON message_templates(clinic_id);
CREATE INDEX IF NOT EXISTS idx_promotions_clinic ON active_promotions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_followups_clinic ON lead_followups(clinic_id);
CREATE INDEX IF NOT EXISTS idx_followups_patient ON lead_followups(patient_id);
CREATE INDEX IF NOT EXISTS idx_followups_status_sched ON lead_followups(status, scheduled_for);

-- 7. Triggers for updated_at
CREATE TRIGGER update_message_templates_updated_at
    BEFORE UPDATE ON message_templates
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_active_promotions_updated_at
    BEFORE UPDATE ON active_promotions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_lead_followups_updated_at
    BEFORE UPDATE ON lead_followups
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
