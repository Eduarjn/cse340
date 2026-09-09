import pool from '../database.js';

// Every project belongs to one organization, but the organization name lives in
// the organization table, so each query joins the two through the foreign key.
const getAllProjects = async () => {
  const sql = `SELECT p.project_id, p.project_name AS title, p.description,
                      p.date, p.location, p.schedule,
                      p.organization_id, o.organization_name
               FROM project p
               JOIN organization o ON o.organization_id = p.organization_id
               ORDER BY p.date ASC, p.project_name ASC`;
  const result = await pool.query(sql);
  return result.rows;
};

// Returns the next upcoming projects, from today onwards, closest date first.
// The caller decides how many rows it wants.
const getUpcomingProjects = async (numberOfProjects) => {
  const sql = `SELECT p.project_id, p.project_name AS title, p.description,
                      p.date, p.location,
                      p.organization_id, o.organization_name
               FROM project p
               JOIN organization o ON o.organization_id = p.organization_id
               WHERE p.date >= CURRENT_DATE
               ORDER BY p.date ASC
               LIMIT $1`;
  const result = await pool.query(sql, [numberOfProjects]);
  return result.rows;
};

// Returns a single project, or undefined when the id does not exist.
const getProjectDetails = async (id) => {
  const sql = `SELECT p.project_id, p.project_name AS title, p.description,
                      p.date, p.location,
                      p.organization_id, o.organization_name
               FROM project p
               JOIN organization o ON o.organization_id = p.organization_id
               WHERE p.project_id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
};

export { getAllProjects, getUpcomingProjects, getProjectDetails };
