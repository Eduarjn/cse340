import pool from '../database.js';

// Signs a user up for a project. ON CONFLICT makes the call idempotent: a
// double click, or a second tab, leaves exactly one row instead of raising a
// primary key violation.
const addVolunteer = async (userId, projectId) => {
  const sql = `INSERT INTO volunteer (user_id, project_id)
               VALUES ($1, $2)
               ON CONFLICT (user_id, project_id) DO NOTHING`;
  await pool.query(sql, [userId, projectId]);
};

const removeVolunteer = async (userId, projectId) => {
  const sql = `DELETE FROM volunteer
               WHERE user_id = $1 AND project_id = $2`;
  await pool.query(sql, [userId, projectId]);
};

// Every project one user signed up for, with the organization that hosts it,
// so the dashboard can list them without a second query.
const getProjectsByVolunteer = async (userId) => {
  const sql = `SELECT p.project_id, p.project_name AS title, p.date, p.location,
                      o.organization_name, v.signed_up_on
               FROM volunteer v
               JOIN project p      ON p.project_id = v.project_id
               JOIN organization o ON o.organization_id = p.organization_id
               WHERE v.user_id = $1
               ORDER BY p.date ASC`;
  const result = await pool.query(sql, [userId]);
  return result.rows;
};

// Whether this user already signed up, which decides which of the two links
// the project page shows.
const isVolunteering = async (userId, projectId) => {
  const sql = `SELECT 1
               FROM volunteer
               WHERE user_id = $1 AND project_id = $2`;
  const result = await pool.query(sql, [userId, projectId]);
  return result.rowCount > 0;
};

// Everyone signed up for one project, so the details page can show how much
// company a volunteer would have.
const getVolunteersByProject = async (projectId) => {
  const sql = `SELECT u.user_id, u.name, v.signed_up_on
               FROM volunteer v
               JOIN users u ON u.user_id = v.user_id
               WHERE v.project_id = $1
               ORDER BY v.signed_up_on ASC, u.name ASC`;
  const result = await pool.query(sql, [projectId]);
  return result.rows;
};

export {
  addVolunteer,
  removeVolunteer,
  getProjectsByVolunteer,
  isVolunteering,
  getVolunteersByProject,
};
