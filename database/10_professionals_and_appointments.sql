-- Migration 10: Professionals and Appointments for Multi-Professional Agenda
-- Created for multi-tenant strict isolation (Zero Trust)

-- 1. Create Professionals Table
CREATE TABLE IF NOT EXISTS professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    google_calendar_email TEXT NOT NULL,
    calendar_color TEXT DEFAULT '#10B981',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Update Appointments Table to link with Professionals
-- We use a DO block to safely add the column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='professional_id') THEN
        ALTER TABLE appointments ADD COLUMN professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 4. Strict Isolation Policies (Zero Trust)
-- These policies ensure that a clinic user can only see/manage data belonging to their clinic_id.
-- We assume the clinic_id is stored in the auth.jwt() user_metadata.

CREATE POLICY "Strict isolation for professionals by clinic_id" 
ON professionals 
FOR ALL 
USING (clinic_id = ((auth.jwt() -> 'user_metadata'::text) ->> 'clinic_id')::uuid);

CREATE POLICY "Strict isolation for appointments by clinic_id" 
ON appointments 
FOR ALL 
USING (clinic_id = ((auth.jwt() -> 'user_metadata'::text) ->> 'clinic_id')::uuid);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_professionals_clinic ON professionals(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic ON appointments(clinic_id);

-- 6. Trigger for updated_at on professionals
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_professionals_updated_at
    BEFORE UPDATE ON professionals
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
