import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Render requires SSL; a local Postgres normally does not.
const useSsl = process.env.DATABASE_SSL !== 'false';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

export default pool;
