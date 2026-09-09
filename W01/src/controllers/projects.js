import { getUpcomingProjects, getProjectDetails } from '../models/projects.js';

// How many upcoming projects the list page shows. The model accepts any number,
// so changing this constant is enough to change the page.
const NUMBER_OF_UPCOMING_PROJECTS = 5;

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

    res.render('project', { title: project.title, project });
  } catch (error) {
    next(error);
  }
};

export { showProjectsPage, showProjectDetailsPage };
