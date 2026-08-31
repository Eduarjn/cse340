import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(currentDir, 'views'));
app.use(express.static(path.join(currentDir, 'public')));

app.get('/', (req, res) => {
  res.render('index', { title: 'ServiceConnect | Home' });
});

app.get('/organizations', (req, res) => {
  res.render('organizations', { title: 'Partner Organizations' });
});

app.get('/projects', (req, res) => {
  res.render('projects', { title: 'Service Projects' });
});

app.get('/categories', (req, res) => {
  res.render('categories', { title: 'Service Project Categories' });
});

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
