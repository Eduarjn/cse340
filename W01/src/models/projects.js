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
// The schedule comes along because the edit form has to show it.
const getProjectDetails = async (id) => {
  const sql = `SELECT p.project_id, p.project_name AS title, p.description,
                      p.date, p.location, p.schedule,
                      p.organization_id, o.organization_name
               FROM project p
               JOIN organization o ON o.organization_id = p.organization_id
               WHERE p.project_id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
};

// Every category one project is filed under, so the details page can tag it.
const getCategoriesByProject = async (id) => {
  const sql = `SELECT c.category_id, c.category_name
               FROM category c
               JOIN project_category pc ON pc.category_id = c.category_id
               WHERE pc.project_id = $1
               ORDER BY c.category_name ASC`;
  const result = await pool.query(sql, [id]);
  return result.rows;
};

// Inserts a new project and hands back the new id, so the controller can
// redirect straight to the page of what was just created.
const createProject = async (projectName, description, date, location, schedule, organizationId) => {
  const sql = `INSERT INTO project (project_name, description, date, location, schedule, organization_id)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING project_id`;
  const result = await pool.query(sql, [
    projectName,
    description,
    date,
    location,
    schedule,
    organizationId,
  ]);
  return result.rows[0].project_id;
};

const updateProject = async (id, projectName, description, date, location, schedule, organizationId) => {
  const sql = `UPDATE project
               SET project_name = $2, description = $3, date = $4,
                   location = $5, schedule = $6, organization_id = $7
               WHERE project_id = $1`;
  await pool.query(sql, [
    id,
    projectName,
    description,
    date,
    location,
    schedule,
    organizationId,
  ]);
};

export {
  getAllProjects,
  getUpcomingProjects,
  getProjectDetails,
  getCategoriesByProject,
  createProject,
  updateProject,
};
