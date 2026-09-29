import bcrypt from 'bcrypt';
import pool from '../database.js';

const SALT_ROUNDS = 10;

// Every user row comes back with the role name rather than the role id, so the
// session can answer "is this an admin?" without a second query on every page.
const findUserByEmail = async (email) => {
  const sql = `SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
               FROM users u
               JOIN roles r ON r.role_id = u.role_id
               WHERE u.email = $1`;
  const result = await pool.query(sql, [email]);
  return result.rows[0];
};

// Only the hash is ever stored. The plain password lives in memory for the
// length of one request and is never written anywhere.
const createUser = async (name, email, password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const passwordHash = await bcrypt.hash(password, salt);

  const sql = `INSERT INTO users (name, email, password_hash, role_id)
               VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = 'user'))
               RETURNING user_id`;
  const result = await pool.query(sql, [name, email, passwordHash]);
  return result.rows[0].user_id;
};

const verifyPassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

// Returns the user without the hash when the credentials match, otherwise null.
// The same null is returned for an unknown email and for a wrong password, so
// the response never reveals which accounts exist.
const authenticateUser = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const matches = await verifyPassword(password, user.password_hash);

  if (!matches) {
    return null;
  }

  return {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role_name: user.role_name,
  };
};

// Every registered account, for the admin only users page.
const getAllUsers = async () => {
  const sql = `SELECT u.user_id, u.name, u.email, r.role_name
               FROM users u
               JOIN roles r ON r.role_id = u.role_id
               ORDER BY u.name ASC`;
  const result = await pool.query(sql);
  return result.rows;
};

export { createUser, findUserByEmail, authenticateUser, getAllUsers };
