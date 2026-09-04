# W02 - Database Retrieval

ServiceConnect, now reading organizations, projects and categories from Postgres.

## Database

The schema and seed data live in [`src/setup.sql`](./src/setup.sql):

| Table | Purpose |
|---|---|
| `organization` | Nonprofits hosting projects |
| `project` | Service projects, each with one host organization |
| `category` | Service project categories |
| `project_category` | Junction table - a project has many categories, a category has many projects |

Load it into your database:

```bash
psql "$DATABASE_URL" -f src/setup.sql
```

## Running locally

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL
npm start
```

Then open http://localhost:3000

## Routes

| Route | Model function | View |
|---|---|---|
| `/` | - | `index.ejs` |
| `/organizations` | `getAllOrganizations()` | `organizations.ejs` |
| `/projects` | `getAllProjects()` | `projects.ejs` |
| `/categories` | `getAllCategories()` | `categories.ejs` |
| anything else | - | `404.ejs` |

## Deploy on Render

- Root Directory: `W02`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment variable: `DATABASE_URL` (the Internal Database URL of the Render Postgres instance)
