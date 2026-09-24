import { body, validationResult } from 'express-validator';
import {
  getAllCategories,
  getCategoryDetails,
  getProjectsByCategory,
  createCategory,
  updateCategory,
  updateCategoryAssignments,
} from '../models/categories.js';
import { getProjectDetails, getCategoriesByProject } from '../models/projects.js';

// Server-side rules. The client-side form asks for the name and a maximum of
// 100 characters, but not for the minimum of 3, so the minimum is what proves
// the server is checking on its own.
const categoryValidation = [
  body('categoryName')
    .trim()
    .notEmpty()
    .withMessage('The category name is required.')
    .isLength({ min: 3 })
    .withMessage('The category name must be at least 3 characters long.')
    .isLength({ max: 100 })
    .withMessage('The category name must be 100 characters or fewer.'),
  body('description')
    .trim()
    .isLength({ max: 500 })
    .withMessage('The description must be 500 characters or fewer.'),
];

const showCategoriesPage = async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.render('categories', { title: 'Service Project Categories', categories });
  } catch (error) {
    next(error);
  }
};

const showCategoryDetailsPage = async (req, res, next) => {
  try {
    const category = await getCategoryDetails(req.params.id);

    if (!category) {
      return res.status(404).render('404', { title: 'Page Not Found' });
    }

    const projects = await getProjectsByCategory(req.params.id);
    res.render('category', {
      title: category.category_name,
      category,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

const showNewCategoryForm = (req, res) => {
  // whatever the user typed before a failed validation comes back here
  const formData = req.session.formData || {};
  delete req.session.formData;

  res.render('new-category', { title: 'Add a New Category', formData });
};

const processNewCategoryForm = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash('error', error.msg));
      req.session.formData = req.body;
      return res.redirect('/new-category');
    }

    const { categoryName, description } = req.body;
    const categoryId = await createCategory(categoryName, description);

    req.flash('success', `Category "${categoryName}" was added.`);
    res.redirect(`/category/${categoryId}`);
  } catch (error) {
    next(error);
  }
};

const showEditCategoryForm = async (req, res, next) => {
  try {
    const category = await getCategoryDetails(req.params.id);

    if (!category) {
      return res.status(404).render('404', { title: 'Page Not Found' });
    }

    // a rejected submission wins over the stored row, so the user does not
    // lose what they had just typed
    const formData = req.session.formData || {};
    delete req.session.formData;

    res.render('edit-category', {
      title: `Edit ${category.category_name}`,
      category,
      formData,
    });
  } catch (error) {
    next(error);
  }
};

const processEditCategoryForm = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash('error', error.msg));
      req.session.formData = req.body;
      return res.redirect(`/edit-category/${req.params.id}`);
    }

    const { categoryName, description } = req.body;
    await updateCategory(req.params.id, categoryName, description);

    req.flash('success', `Category "${categoryName}" was updated.`);
    res.redirect(`/category/${req.params.id}`);
  } catch (error) {
    next(error);
  }
};

const showAssignCategoriesForm = async (req, res, next) => {
  try {
    const project = await getProjectDetails(req.params.projectId);

    if (!project) {
      return res.status(404).render('404', { title: 'Page Not Found' });
    }

    const categories = await getAllCategories();
    const assigned = await getCategoriesByProject(req.params.projectId);

    // only the ids are needed, to decide which boxes start checked
    const assignedIds = assigned.map((category) => category.category_id);

    res.render('assign-categories', {
      title: `Categories for ${project.title}`,
      project,
      categories,
      assignedIds,
    });
  } catch (error) {
    next(error);
  }
};

const processAssignCategoriesForm = async (req, res, next) => {
  try {
    // one checked box arrives as a string, several arrive as an array, and
    // none at all arrives as undefined
    const { categoryIds } = req.body;
    const selected = categoryIds ? [].concat(categoryIds) : [];

    await updateCategoryAssignments(req.params.projectId, selected);

    req.flash('success', 'The categories for this project were updated.');
    res.redirect(`/project/${req.params.projectId}`);
  } catch (error) {
    next(error);
  }
};

export {
  categoryValidation,
  showCategoriesPage,
  showCategoryDetailsPage,
  showNewCategoryForm,
  processNewCategoryForm,
  showEditCategoryForm,
  processEditCategoryForm,
  showAssignCategoriesForm,
  processAssignCategoriesForm,
};
