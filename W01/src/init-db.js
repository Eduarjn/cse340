import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcrypt';
import pool from './database.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

// The account the QA team uses to check the admin features.
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'cse340!';
const ADMIN_NAME = 'Site Administrator';

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

// Adds the roles and users tables to a database that predates them, without
// touching the organizations, projects and categories already stored there.
export const ensureAuthTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS roles (
      role_id SERIAL PRIMARY KEY,
      role_name VARCHAR(50) NOT NULL UNIQUE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role_id INT NOT NULL REFERENCES roles (role_id)
    )
  `);

  await pool.query(`
    INSERT INTO roles (role_name)
    VALUES ('admin'), ('user')
    ON CONFLICT (role_name) DO NOTHING
  `);
};

// Adds the volunteer join table to a database that predates it, leaving the
// rows already stored in the other tables alone.
export const ensureVolunteerTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS volunteer (
      user_id INT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
      project_id INT NOT NULL REFERENCES project (project_id) ON DELETE CASCADE,
      signed_up_on DATE NOT NULL DEFAULT CURRENT_DATE,
      PRIMARY KEY (user_id, project_id)
    )
  `);
};

// Seeds the QA admin account. Safe to run on every boot: the account is only
// created once, and its role is corrected if it ever drifts.
export const ensureAdminUser = async () => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role_id)
     VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = 'admin'))
     ON CONFLICT (email) DO NOTHING
     RETURNING user_id`,
    [ADMIN_NAME, ADMIN_EMAIL, passwordHash],
  );

  // The account already existed, so make sure it still carries the admin role.
  if (rows.length === 0) {
    await pool.query(
      `UPDATE users
       SET role_id = (SELECT role_id FROM roles WHERE role_name = 'admin')
       WHERE email = $1`,
      [ADMIN_EMAIL],
    );
    return false;
  }

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
