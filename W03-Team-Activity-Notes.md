# W03 Team Activity — Displaying Service Projects

Student: Eduarjose Fajardo
Project: ServiceConnect (Node.js + Express + PostgreSQL + EJS)

## What was added

| Layer | File | Change |
|---|---|---|
| Model | `W01/src/models/projects.js` | `getUpcomingProjects(numberOfProjects)`, `getProjectDetails(id)` |
| Model | `W01/src/models/organizations.js` | `getOrganizationDetails(id)`, `getProjectsByOrganization(id)` |
| Controller | `W01/src/controllers/projects.js` | `NUMBER_OF_UPCOMING_PROJECTS = 5`, updated `showProjectsPage`, new `showProjectDetailsPage` |
| Controller | `W01/src/controllers/organizations.js` | `showOrganizationsPage`, `showOrganizationDetailsPage` |
| Routes | `W01/src/routes.js` | `/project/:id` and `/organization/:id` added |
| View | `W01/src/views/project.ejs` | new project details page |
| View | `W01/src/views/projects.ejs` | now lists the next five projects, each tile a link |
| View | `W01/src/views/organization.ejs` | new organization details page |

The views moved from `W01/views/` to `W01/src/views/`, and `server.js` now mounts
`src/routes.js` instead of declaring routes itself. Three extra rows were added to
`src/setup.sql` (seven projects total) so the five-item limit is visible.

## Group discussion answers

### Why do each of these queries need to have a JOIN in them?

Both queries return `organization_name`, and that column does not exist in the
`project` table. The `project` table only stores `organization_id`, which is a
number. The JOIN follows that foreign key into the `organization` table and
brings back the readable name, so the page can show "Green Valley Alliance"
instead of "3".

```sql
SELECT p.project_id, p.project_name AS title, p.description,
       p.date, p.location,
       p.organization_id, o.organization_name
FROM project p
JOIN organization o ON o.organization_id = p.organization_id
WHERE p.date >= CURRENT_DATE
ORDER BY p.date ASC
LIMIT $1
```

### What is the benefit of using a placeholder instead of putting the value directly into the query string?

The placeholder (`$1`) keeps the value separate from the SQL text. The driver
sends the query and the value to Postgres as two different things, so the value
is always treated as data and can never be read as SQL commands. If we built the
string by concatenation, a value like `1; DROP TABLE project;` would become part
of the command — that is SQL injection. The placeholder also handles quoting and
type conversion for us, and it lets Postgres reuse the query plan.

### What is the benefit of using a route parameter for the ID instead of a query parameter?

`/project/5` describes a resource; `/projects?id=5` describes a filter on a list.
The route parameter gives one clean, permanent address per project, which is
better for bookmarks, for sharing links, and for search engines. It also makes
the route declaration explicit — `router.get('/project/:id', ...)` says the id is
required, while a query parameter is always optional and has to be validated by
hand.

### Why is it not necessary to make a change in the view to limit the number of projects to five?

Because the limiting happens before the view ever runs. The controller asks the
model for five rows, the model applies `LIMIT $1` in SQL, and the view receives
an array that already has five items. The view's only job is to loop over
whatever array it is given. This is the point of MVC: if we later want ten
projects, we change the constant in the controller and no view or model code has
to change.

### When the EJS page renders, what will each line look like in the HTML output?

This template line:

```html
<h2><a href="/project/<%= project.project_id %>"><%= project.title %></a></h2>
```

becomes plain HTML in the response:

```html
<h2><a href="/project/1">River Cleanup Day</a></h2>
```

No EJS tag survives. EJS runs entirely on the server, so the browser only
receives finished HTML.

### Why use `<%= %>` rather than `<%- %>` for these values, even though they come from a database we control?

`<%=` escapes HTML characters before printing; `<%-` prints the raw value. Even
with a database we control today, escaping is the safe default:

- Data sources change. Tomorrow an organization might edit its own description
  through a form, and then the value is user input.
- A project name with a legitimate `&` or `<` character would break the page
  layout if printed raw.
- Escaping costs nothing and removes a whole class of XSS bugs.

`<%-` is only for HTML we wrote ourselves, such as `<%- include('partials/header') %>`.

## Testing performed

- All eight EJS views render without errors against sample data, and the
  generated links point at `/project/:id` and `/organization/:id` correctly.
- The model SQL was executed against an in-memory Postgres: with seven projects
  seeded, `getUpcomingProjects(5)` returned exactly five rows ordered by date
  ascending, `getProjectDetails(1)` returned one row with the organization name
  joined in, and `getProjectsByOrganization(1)` returned the two projects of that
  organization.

Still to do locally by the student:

```bash
cd W01 && npm install && npm run db:setup && npm run dev
```

Then visit `http://127.0.0.1:3000/projects`, click a project, click the
organization link, and confirm the whole path works. After that, deploy to
Render and repeat the same checks on the live URL.
