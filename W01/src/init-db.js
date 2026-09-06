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

// Creates the schema when it is missing, or when it predates the
// contact_email / date / location columns, so a restart never wipes good data.
export const ensureDatabase = async () => {
  const { rows } = await pool.query(`
    SELECT to_regclass('public.organization') AS table_name,
           (SELECT COUNT(*) FROM information_schema.columns
             WHERE table_schema = 'public'
               AND ((table_name = 'organization' AND column_name = 'contact_email')
                 OR (table_name = 'project' AND column_name IN ('date', 'location')))
           ) AS new_column_count
  `);

  const { table_name: organizationTable, new_column_count: newColumnCount } = rows[0];

  if (organizationTable && Number(newColumnCount) === 3) {
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
