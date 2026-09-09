import pool from '../database.js';

const getAllOrganizations = async () => {
  const sql = `SELECT organization_id, organization_name, description, contact_email, image_url
               FROM organization
               ORDER BY organization_name ASC`;
  const result = await pool.query(sql);
  return result.rows;
};

// Returns a single organization, or undefined when the id does not exist.
const getOrganizationDetails = async (id) => {
  const sql = `SELECT organization_id, organization_name, description, contact_email, image_url
               FROM organization
               WHERE organization_id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
};

// Every project hosted by one organization, so the details page can link to them.
const getProjectsByOrganization = async (id) => {
  const sql = `SELECT project_id, project_name AS title, date, location
               FROM project
               WHERE organization_id = $1
               ORDER BY date ASC`;
  const result = await pool.query(sql, [id]);
  return result.rows;
};

export { getAllOrganizations, getOrganizationDetails, getProjectsByOrganization };
