import { body, validationResult } from 'express-validator';
import { createUser, findUserByEmail, authenticateUser, getAllUsers } from '../models/users.js';
import { getProjectsByVolunteer } from '../models/volunteers.js';

// ---------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------

const registrationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Your name is required.')
    .isLength({ max: 100 })
    .withMessage('The name must be 100 characters or fewer.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('The email is required.')
    .isEmail()
    .withMessage('The email must be a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('The password is required.')
    .isLength({ min: 6 })
    .withMessage('The password must be at least 6 characters long.'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('The email is required.')
    .isEmail()
    .withMessage('The email must be a valid email address.')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('The password is required.'),
];

// ---------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------

// Anyone who is not signed in is sent to the login page.
const requireLogin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    req.flash('error', 'You must be logged in to access that page.');
    return res.redirect('/login');
  }

  next();
};

// A factory: requireRole('admin') returns a middleware that lets only admins
// through. Being signed in is checked first, because an anonymous visitor and
// a signed in visitor without the role deserve different destinations.
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      req.flash('error', 'You must be logged in to access that page.');
      return res.redirect('/login');
    }

    if (req.session.user.role_name !== role) {
      req.flash('error', 'You do not have permission to access that page.');
      return res.redirect('/dashboard');
    }

    next();
  };
};

// ---------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------

const showUserRegistrationForm = (req, res) => {
  const formData = req.session.formData || {};
  delete req.session.formData;

  res.render('register', { title: 'Create an Account', formData });
};

const processUserRegistrationForm = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash('error', error.msg));
      req.session.formData = req.body;
      return res.redirect('/register');
    }

    const { name, email, password } = req.body;

    // The email column is unique, so catching this here gives a readable
    // message instead of a database error page.
    const existing = await findUserByEmail(email);

    if (existing) {
      req.flash('error', 'An account with that email already exists.');
      req.session.formData = { name, email };
      return res.redirect('/register');
    }

    await createUser(name, email, password);

    req.flash('success', 'Your account was created. You can sign in now.');
    res.redirect('/login');
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------
// Login and logout
// ---------------------------------------------------------------------

const showLoginForm = (req, res) => {
  const formData = req.session.formData || {};
  delete req.session.formData;

  res.render('login', { title: 'Sign In', formData });
};

const processLoginForm = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash('error', error.msg));
      req.session.formData = { email: req.body.email };
      return res.redirect('/login');
    }

    const { email, password } = req.body;
    const user = await authenticateUser(email, password);

    // One message for both failure cases, so the form never confirms whether
    // an email is registered.
    if (!user) {
      req.flash('error', 'That email and password do not match an account.');
      req.session.formData = { email };
      return res.redirect('/login');
    }

    req.session.user = user;

    req.flash('success', `Welcome back, ${user.name}.`);
    res.redirect('/dashboard');
  } catch (error) {
    next(error);
  }
};

const processLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

// ---------------------------------------------------------------------
// Pages behind a login
// ---------------------------------------------------------------------

const showDashboard = async (req, res, next) => {
  try {
    // The projects this user signed up for, so the dashboard can list them
    // and offer a way out of each one.
    const volunteeredProjects = await getProjectsByVolunteer(req.session.user.user_id);

    res.render('dashboard', {
      title: 'Dashboard',
      name: req.session.user.name,
      email: req.session.user.email,
      role: req.session.user.role_name,
      volunteeredProjects,
    });
  } catch (error) {
    next(error);
  }
};

const showUsersPage = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.render('users', { title: 'Registered Users', users });
  } catch (error) {
    next(error);
  }
};

export {
  registrationValidation,
  loginValidation,
  requireLogin,
  requireRole,
  showUserRegistrationForm,
  processUserRegistrationForm,
  showLoginForm,
  processLoginForm,
  processLogout,
  showDashboard,
  showUsersPage,
};
