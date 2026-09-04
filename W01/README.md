# W01 + W02 - ServiceConnect

Express + EJS site for CSE 340. W01 created the pages; W02 moved every page
onto Postgres.

## Database

Schema and seed data: [`src/setup.sql`](./src/setup.sql)

| Table | Purpose |
|---|---|
| `organization` | Nonprofits hosting projects |
| `project` | Service projects, each with one host organization |
| `category` | Service project categories |
| `project_category` | Junction table - a project has many categories, a category has many projects |

Load it:

```bash
npm run db:setup
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

Any database error renders `500.ejs` instead of crashing the process.

## Deploy on Render

- Root Directory: `W01`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment variable: `DATABASE_URL` (the Internal Database URL of the Render Postgres instance)

The server reads `process.env.PORT`, so Render sets the port on its own.
