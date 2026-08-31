import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const renderHome = (req, res) => {
  res.render('index', { title: 'ServiceConnect | Home' });
};

const renderOrganizations = (req, res) => {
  res.render('organizations', { title: 'Partner Organizations' });
};

const renderProjects = (req, res) => {
  res.render('projects', { title: 'Service Projects' });
};

const renderCategories = (req, res) => {
  res.render('categories', { title: 'Service Project Categories' });
};

const renderNotFound = (req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
};

app.get('/', renderHome);
app.get('/organizations', renderOrganizations);
app.get('/projects', renderProjects);
app.get('/categories', renderCategories);
app.use(renderNotFound);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
