import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = async (text: string, params?: any[]) => {
  if (process.env.TEST_E2E === 'true') {
    return (globalThis as any).__mockQuery(text, params);
  }
  return pool.query(text, params);
};

export default pool;
