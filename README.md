# Classroom Availability Finder

Individual college project for a Cloud Computing & DevOps assessment — **Phase 1: backend foundation**.

A minimal Node.js + Express + EJS web app that lists classrooms and lets you track their
availability per time slot. Data is kept in an in-memory store (resets on restart).

## Features (Phase 1)

| Endpoint                            | Purpose                                                           |
| ----------------------------------- | ----------------------------------------------------------------- |
| `GET /`                             | Homepage: classroom list, add-classroom form, availability update |
| `POST /classrooms`                  | Add a classroom (validated)                                       |
| `POST /classrooms/:id/availability` | Change a classroom's availability status                          |
| `GET /api/classrooms`               | All classrooms as JSON                                            |
| `GET /health`                       | `{"status":"ok"}` health check                                    |

Availability statuses: `available`, `occupied`, `maintenance`.
The page footer shows the first 7 characters of `RENDER_GIT_COMMIT` (falls back to `GIT_SHA`, then `local`).

## Requirements

- Node.js 22 or newer (uses the built-in `node:test` runner)

## Setup

```bash
npm install
```

## Run the server

```bash
npm start
```

Then open http://localhost:3000. Use `PORT=8080 npm start` (or `$env:PORT=8080` on Windows PowerShell) to change the port.

For auto-reload during development:

```bash
npm run dev
```

## Run tests

```bash
npm test
```

## Lint

```bash
npm run lint
```

## Project structure

```
server.js                  # Entry point — starts the HTTP server
src/
  app.js                   # Express app factory (views, parsers, routes)
  config.js                # commitId(): RENDER_GIT_COMMIT -> GIT_SHA -> "local"
  store/classrooms.js      # In-memory data store + sample seed data
  validation/classroom.js  # Add-classroom input validation
  routes/pages.js          # HTML pages + form handlers
  routes/api.js            # JSON API
  views/                   # EJS templates (pages + partials)
test/app.test.js           # node:test integration tests
```

## Later phases

Docker, GitHub Actions CI, and Render deployment will be added on top of this foundation.
Automatic deplpyment test
