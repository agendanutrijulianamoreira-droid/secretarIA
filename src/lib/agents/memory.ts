import { Pool } from 'pg';
import { ChatMessage } from './types';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export class ChatMemory {
    async getHistory(clinicId: string, patientPhone: string, limit: number = 20): Promise<ChatMessage[]> {
        const query = `
            SELECT role, content 
            FROM chat_history 
            WHERE clinic_id = $1 AND patient_phone = $2 
            ORDER BY created_at ASC 
            LIMIT $3
        `;
        const result = await pool.query(query, [clinicId, patientPhone, limit]);

        return result.rows.map(row => ({
            role: row.role as 'user' | 'assistant' | 'system',
            content: row.content
        }));
    }

    async saveMessage(clinicId: string, patientPhone: string, role: string, content: string): Promise<void> {
        const query = `
            INSERT INTO chat_history (clinic_id, patient_phone, role, content) 
            VALUES ($1, $2, $3, $4)
        `;
        await pool.query(query, [clinicId, patientPhone, role, content]);
    }
}
