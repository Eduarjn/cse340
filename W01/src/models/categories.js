import pool from '../database.js';

const getAllCategories = async () => {
  const sql = `SELECT category_id, category_name, description
               FROM category
               ORDER BY category_name ASC`;
  const result = await pool.query(sql);
  return result.rows;
};

export { getAllCategories };
