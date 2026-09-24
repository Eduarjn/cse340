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

// Inserts a new category and hands back the new id, so the controller can
// redirect straight to the page of what was just created.
const createCategory = async (categoryName, description) => {
  const sql = `INSERT INTO category (category_name, description)
               VALUES ($1, $2)
               RETURNING category_id`;
  const result = await pool.query(sql, [categoryName, description]);
  return result.rows[0].category_id;
};

const updateCategory = async (id, categoryName, description) => {
  const sql = `UPDATE category
               SET category_name = $2, description = $3
               WHERE category_id = $1`;
  await pool.query(sql, [id, categoryName, description]);
};

// One row of the join table: this project is filed under this category.
const assignCategoryToProject = async (projectId, categoryId) => {
  const sql = `INSERT INTO project_category (project_id, category_id)
               VALUES ($1, $2)`;
  await pool.query(sql, [projectId, categoryId]);
};

// The form always posts the complete set of checked boxes, so the old rows are
// cleared first and the new set is written in full. That keeps a box the user
// unchecked from leaving a stale assignment behind.
const updateCategoryAssignments = async (projectId, categoryIds) => {
  await pool.query('DELETE FROM project_category WHERE project_id = $1', [projectId]);

  for (const categoryId of categoryIds) {
    await assignCategoryToProject(projectId, categoryId);
  }
};

export {
  getAllCategories,
  getCategoryDetails,
  getProjectsByCategory,
  createCategory,
  updateCategory,
  assignCategoryToProject,
  updateCategoryAssignments,
};
