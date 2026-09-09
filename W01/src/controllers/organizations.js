import {
  getAllOrganizations,
  getOrganizationDetails,
  getProjectsByOrganization,
} from '../models/organizations.js';

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

export { showOrganizationsPage, showOrganizationDetailsPage };
