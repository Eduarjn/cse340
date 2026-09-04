import pool from '../database.js';

export const getAllProjects = async () => {
  const sql = `SELECT p.project_id, p.project_name, p.description, p.schedule,
                      o.organization_name
               FROM project p
               JOIN organization o ON o.organization_id = p.organization_id
               ORDER BY p.project_name ASC`;
  const result = await pool.query(sql);
  return result.rows;
};
