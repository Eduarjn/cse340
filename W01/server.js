import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllOrganizations } from './src/models/organizations.js';
import { getAllProjects } from './src/models/projects.js';
import { getAllCategories } from './src/models/categories.js';
import { ensureDatabase } from './src/init-db.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(currentDir, 'views'));
app.use(express.static(path.join(currentDir, 'public')));

app.get('/', (req, res) => {
  res.render('index', { title: 'ServiceConnect | Home' });
});

app.get('/organizations', async (req, res, next) => {
  try {
    const organizations = await getAllOrganizations();
    res.render('organizations', { title: 'Partner Organizations', organizations });
  } catch (error) {
    next(error);
  }
});

app.get('/projects', async (req, res, next) => {
  try {
    const projects = await getAllProjects();
    res.render('projects', { title: 'Service Projects', projects });
  } catch (error) {
    next(error);
  }
});

app.get('/categories', async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.render('categories', { title: 'Service Project Categories', categories });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('500', { title: 'Server Error' });
});

// The schema lives in src/setup.sql; create it on the first boot against an
// empty database so a fresh deploy comes up with data already in place.
try {
  const created = await ensureDatabase();
  console.log(created ? 'Database created and seeded.' : 'Database already set up.');
} catch (error) {
  console.error('Could not prepare the database:', error.message);
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
