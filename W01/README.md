# W01 - Initial Site Creation

ServiceConnect, a small Express + EJS site for the CSE 340 course.

## Running locally

```bash
npm install
npm start
```

Then open http://localhost:3000

## Routes

| Route | View |
|---|---|
| `/` | `index.ejs` |
| `/organizations` | `organizations.ejs` |
| `/projects` | `projects.ejs` |
| `/categories` | `categories.ejs` |
| anything else | `404.ejs` |

Each route passes a `title` to the view, and the header partial puts it in the
`<title>` tag.

## Deploy on Render

- Root Directory: `W01`
- Build Command: `npm install`
- Start Command: `npm start`

The server reads `process.env.PORT`, so Render sets the port on its own.
