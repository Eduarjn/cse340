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

// Inserts a new organization and hands back the new id, so the controller can
// redirect straight to the page of what was just created.
const createOrganization = async (organizationName, description, contactEmail, imageUrl) => {
  const sql = `INSERT INTO organization (organization_name, description, contact_email, image_url)
               VALUES ($1, $2, $3, $4)
               RETURNING organization_id`;
  const result = await pool.query(sql, [organizationName, description, contactEmail, imageUrl]);
  return result.rows[0].organization_id;
};

const updateOrganization = async (id, organizationName, description, contactEmail, imageUrl) => {
  const sql = `UPDATE organization
               SET organization_name = $2, description = $3,
                   contact_email = $4, image_url = $5
               WHERE organization_id = $1`;
  await pool.query(sql, [id, organizationName, description, contactEmail, imageUrl]);
};

export {
  getAllOrganizations,
  getOrganizationDetails,
  getProjectsByOrganization,
  createOrganization,
  updateOrganization,
};
