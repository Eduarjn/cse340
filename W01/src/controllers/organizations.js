import { body, validationResult } from 'express-validator';
import {
  getAllOrganizations,
  getOrganizationDetails,
  getProjectsByOrganization,
  createOrganization,
  updateOrganization,
} from '../models/organizations.js';

// The client-side form asks for the fields and their maximum lengths, but not
// for the minimum, so the minimum is what proves the server checks on its own.
const organizationValidation = [
  body('organizationName')
    .trim()
    .notEmpty()
    .withMessage('The organization name is required.')
    .isLength({ min: 3 })
    .withMessage('The organization name must be at least 3 characters long.')
    .isLength({ max: 100 })
    .withMessage('The organization name must be 100 characters or fewer.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('The description is required.')
    .isLength({ max: 500 })
    .withMessage('The description must be 500 characters or fewer.'),
  body('contactEmail')
    .trim()
    .notEmpty()
    .withMessage('The contact email is required.')
    .isEmail()
    .withMessage('The contact email must be a valid email address.')
    .normalizeEmail(),
];

const showOrganizationsPage = async (req, res, next) => {
  try {
    const organizations = await getAllOrganizations();
    res.render('organizations', { title: 'Partner Organizations', organizations });
  } catch (error) {
    next(error);
  }
};

const showOrganizationDetailsPage = async (req, res, next) => {
  try {
    const organization = await getOrganizationDetails(req.params.id);

    if (!organization) {
      return res.status(404).render('404', { title: 'Page Not Found' });
    }

    const projects = await getProjectsByOrganization(req.params.id);
    res.render('organization', {
      title: organization.organization_name,
      organization,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

const showNewOrganizationForm = (req, res) => {
  const formData = req.session.formData || {};
  delete req.session.formData;

  res.render('new-organization', { title: 'Add a New Organization', formData });
};

const processNewOrganizationForm = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash('error', error.msg));
      req.session.formData = req.body;
      return res.redirect('/new-organization');
    }

    const { organizationName, description, contactEmail, imageUrl } = req.body;
    const organizationId = await createOrganization(
      organizationName,
      description,
      contactEmail,
      imageUrl || null,
    );

    req.flash('success', `Organization "${organizationName}" was added.`);
    res.redirect(`/organization/${organizationId}`);
  } catch (error) {
    next(error);
  }
};

const showEditOrganizationForm = async (req, res, next) => {
  try {
    const organization = await getOrganizationDetails(req.params.id);

    if (!organization) {
      return res.status(404).render('404', { title: 'Page Not Found' });
    }

    const formData = req.session.formData || {};
    delete req.session.formData;

    res.render('edit-organization', {
      title: `Edit ${organization.organization_name}`,
      organization,
      formData,
    });
  } catch (error) {
    next(error);
  }
};

const processEditOrganizationForm = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash('error', error.msg));
      req.session.formData = req.body;
      return res.redirect(`/edit-organization/${req.params.id}`);
    }

    const { organizationName, description, contactEmail, imageUrl } = req.body;
    await updateOrganization(
      req.params.id,
      organizationName,
      description,
      contactEmail,
      imageUrl || null,
    );

    req.flash('success', `Organization "${organizationName}" was updated.`);
    res.redirect(`/organization/${req.params.id}`);
  } catch (error) {
    next(error);
  }
};

export {
  organizationValidation,
  showOrganizationsPage,
  showOrganizationDetailsPage,
  showNewOrganizationForm,
  processNewOrganizationForm,
  showEditOrganizationForm,
  processEditOrganizationForm,
};
