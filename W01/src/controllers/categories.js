import {
  getAllCategories,
  getCategoryDetails,
  getProjectsByCategory,
} from '../models/categories.js';

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

export { showCategoriesPage, showCategoryDetailsPage };
