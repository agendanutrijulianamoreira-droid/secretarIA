import { Pool } from 'pg';
import { ClinicContext } from './types';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
});

export class ClinicLoader {
    async getClinicBySlug(slug: string): Promise<ClinicContext | null> {
        const query = 'SELECT * FROM clinics WHERE slug = $1';
        const result = await pool.query(query, [slug]);

        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            operating_hours: row.operating_hours,
            address: row.address,
            tone_of_voice: row.tone_of_voice,
            specialties: row.specialties,
            receptionist_phone: row.receptionist_phone,
            google_calendar_id: row.google_calendar_id
        };
    }

    async getClinicByPhone(phone: string): Promise<ClinicContext | null> {
        const query = 'SELECT * FROM clinics WHERE whatsapp_number = $1';
        const result = await pool.query(query, [phone]);

        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            operating_hours: row.operating_hours,
            address: row.address,
            tone_of_voice: row.tone_of_voice,
            specialties: row.specialties,
            receptionist_phone: row.receptionist_phone,
            google_calendar_id: row.google_calendar_id
        };
    }
}
