import { body, validationResult } from 'express-validator';
import {
  getUpcomingProjects,
  getProjectDetails,
  getCategoriesByProject,
  createProject,
  updateProject,
} from '../models/projects.js';
import { getAllOrganizations } from '../models/organizations.js';

// How many upcoming projects the list page shows. The model accepts any number,
// so changing this constant is enough to change the page.
const NUMBER_OF_UPCOMING_PROJECTS = 5;

// As with the other forms, the minimum lengths live only on the server.
const projectValidation = [
  body('projectName')
    .trim()
    .notEmpty()
    .withMessage('The project name is required.')
    .isLength({ min: 3 })
    .withMessage('The project name must be at least 3 characters long.')
    .isLength({ max: 100 })
    .withMessage('The project name must be 100 characters or fewer.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('The description is required.')
    .isLength({ max: 500 })
    .withMessage('The description must be 500 characters or fewer.'),
  body('date')
    .trim()
    .notEmpty()
    .withMessage('The date is required.')
    .isISO8601()
    .withMessage('The date must be a valid calendar date.'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('The location is required.')
    .isLength({ max: 150 })
    .withMessage('The location must be 150 characters or fewer.'),
  body('schedule')
    .trim()
    .notEmpty()
    .withMessage('The schedule is required.')
    .isLength({ max: 100 })
    .withMessage('The schedule must be 100 characters or fewer.'),
  body('organizationId')
    .trim()
    .notEmpty()
    .withMessage('Choose the organization that hosts this project.')
    .isInt()
    .withMessage('Choose the organization that hosts this project.'),
];

const showProjectsPage = async (req, res, next) => {
  try {
    const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
    res.render('projects', { title: 'Upcoming Service Projects', projects });
  } catch (error) {
    next(error);
  }
};

const showProjectDetailsPage = async (req, res, next) => {
  try {
    const project = await getProjectDetails(req.params.id);

    // An id that is not in the database is a missing page, not a server error.
    if (!project) {
      return res.status(404).render('404', { title: 'Page Not Found' });
    }

    const categories = await getCategoriesByProject(req.params.id);
    res.render('project', { title: project.title, project, categories });
  } catch (error) {
    next(error);
  }
};

const showNewProjectForm = async (req, res, next) => {
  try {
    // the host organization is chosen from a list, so the list has to be loaded
    const organizations = await getAllOrganizations();

    const formData = req.session.formData || {};
    delete req.session.formData;

    res.render('new-project', {
      title: 'Add a New Service Project',
      organizations,
      formData,
    });
  } catch (error) {
    next(error);
  }
};

const processNewProjectForm = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash('error', error.msg));
      req.session.formData = req.body;
      return res.redirect('/new-project');
    }

    const { projectName, description, date, location, schedule, organizationId } = req.body;
    const projectId = await createProject(
      projectName,
      description,
      date,
      location,
      schedule,
      organizationId,
    );

    req.flash('success', `Project "${projectName}" was added.`);
    res.redirect(`/project/${projectId}`);
  } catch (error) {
    next(error);
  }
};

const showEditProjectForm = async (req, res, next) => {
  try {
    const project = await getProjectDetails(req.params.id);

    if (!project) {
      return res.status(404).render('404', { title: 'Page Not Found' });
    }

    const organizations = await getAllOrganizations();

    const formData = req.session.formData || {};
    delete req.session.formData;

    res.render('edit-project', {
      title: `Edit ${project.title}`,
      project,
      organizations,
      formData,
    });
  } catch (error) {
    next(error);
  }
};

const processEditProjectForm = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash('error', error.msg));
      req.session.formData = req.body;
      return res.redirect(`/edit-project/${req.params.id}`);
    }

    const { projectName, description, date, location, schedule, organizationId } = req.body;
    await updateProject(
      req.params.id,
      projectName,
      description,
      date,
      location,
      schedule,
      organizationId,
    );

    req.flash('success', `Project "${projectName}" was updated.`);
    res.redirect(`/project/${req.params.id}`);
  } catch (error) {
    next(error);
  }
};

export {
  projectValidation,
  showProjectsPage,
  showProjectDetailsPage,
  showNewProjectForm,
  processNewProjectForm,
  showEditProjectForm,
  processEditProjectForm,
};
