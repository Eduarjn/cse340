import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from './database.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const initDatabase = async () => {
  const sql = await fs.readFile(path.join(currentDir, 'setup.sql'), 'utf8');
  await pool.query(sql);
  console.log('Database created and seeded.');
  await pool.end();
};

initDatabase().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
