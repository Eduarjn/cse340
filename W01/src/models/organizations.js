import pool from '../database.js';

export const getAllOrganizations = async () => {
  const sql = `SELECT organization_id, organization_name, description, contact_email, image_url
               FROM organization
               ORDER BY organization_name ASC`;
  const result = await pool.query(sql);
  return result.rows;
};
