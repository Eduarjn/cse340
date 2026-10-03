import { addVolunteer, removeVolunteer } from '../models/volunteers.js';
import { getProjectDetails } from '../models/projects.js';

// Both handlers are reached only through requireLogin, so req.session.user is
// guaranteed to exist by the time they run.

const processAddVolunteer = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await getProjectDetails(projectId);

    // Signing up for a project that does not exist is a missing page, not a
    // server error.
    if (!project) {
      return res.status(404).render('404', { title: 'Page Not Found' });
    }

    await addVolunteer(req.session.user.user_id, projectId);

    req.flash('success', `You are now volunteering for "${project.title}".`);
    res.redirect(`/project/${projectId}`);
  } catch (error) {
    next(error);
  }
};

const processRemoveVolunteer = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await getProjectDetails(projectId);

    if (!project) {
      return res.status(404).render('404', { title: 'Page Not Found' });
    }

    await removeVolunteer(req.session.user.user_id, projectId);

    req.flash('success', `You are no longer volunteering for "${project.title}".`);

    // The same handler serves the project page and the dashboard, so it
    // returns the user to whichever one they pressed the button on.
    const returnTo = req.body.returnTo === 'dashboard' ? '/dashboard' : `/project/${projectId}`;
    res.redirect(returnTo);
  } catch (error) {
    next(error);
  }
};

export { processAddVolunteer, processRemoveVolunteer };
