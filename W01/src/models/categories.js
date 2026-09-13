import pool from '../database.js';

const getAllCategories = async () => {
  const sql = `SELECT category_id, category_name, description
               FROM category
               ORDER BY category_name ASC`;
  const result = await pool.query(sql);
  return result.rows;
};

// Returns a single category, or undefined when the id does not exist.
const getCategoryDetails = async (id) => {
  const sql = `SELECT category_id, category_name, description
               FROM category
               WHERE category_id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
};

// A project belongs to many categories, so the two tables are joined through
// project_category to collect every project filed under one category.
const getProjectsByCategory = async (id) => {
  const sql = `SELECT p.project_id, p.project_name AS title, p.date, p.location
               FROM project p
               JOIN project_category pc ON pc.project_id = p.project_id
               WHERE pc.category_id = $1
               ORDER BY p.date ASC`;
  const result = await pool.query(sql, [id]);
  return result.rows;
};

export { getAllCategories, getCategoryDetails, getProjectsByCategory };
