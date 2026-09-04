import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from './database.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

// Runs src/setup.sql, which drops and recreates every table.
export const initDatabase = async () => {
  const sql = await fs.readFile(path.join(currentDir, 'setup.sql'), 'utf8');
  await pool.query(sql);
};

// Creates the schema only when it is missing, so a restart never wipes data.
export const ensureDatabase = async () => {
  const { rows } = await pool.query(`SELECT to_regclass('public.organization') AS table_name`);

  if (rows[0].table_name) {
    return false;
  }

  await initDatabase();
  return true;
};

const runFromCommandLine = process.argv[1] === fileURLToPath(import.meta.url);

if (runFromCommandLine) {
  try {
    await initDatabase();
    console.log('Database created and seeded.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
  await pool.end();
}
