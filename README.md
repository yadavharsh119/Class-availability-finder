# Classroom Availability Finder

A Cloud Computing & DevOps project that allows users to find classrooms by building, room number, and availability status, and manage classroom availability across time slots.

## Features

- **Classroom Management:** Add classrooms with room number, building, capacity, and time slot.
- **Availability Tracking:** Update classroom status to `available`, `occupied`, or `maintenance`.
- **Search and Filtering:** Search by room number or building and filter by availability.
- **Dashboard:** View classroom totals and availability statistics.
- **Health Check:** Monitor application health through `/health`.
- **Running Commit ID:** Display the deployed Git commit ID in the footer.

## Tech Stack

- Node.js 22
- Express.js
- EJS
- HTML and CSS
- Docker
- GitHub Actions
- Render

## Architecture

The application uses a Node.js and Express backend with EJS templates for server-rendered pages.

Classroom data is stored in an in-memory data store and resets when the server restarts.

## API Endpoints

| Method | Endpoint                       | Purpose                          |
| ------ | ------------------------------ | -------------------------------- |
| GET    | `/`                            | Render the classroom dashboard   |
| POST   | `/classrooms`                  | Add a classroom                  |
| POST   | `/classrooms/:id/availability` | Update classroom availability    |
| GET    | `/api/classrooms`              | Return classroom data as JSON    |
| GET    | `/health`                      | Return application health status |

## CI/CD Pipeline

GitHub Actions automates quality checks for the project.

The workflow is defined in `.github/workflows/ci-cd.yml`.

The pipeline includes:

1. Install dependencies using `npm ci`.
2. Run ESLint.
3. Execute automated tests.
4. Build the Docker image.
5. Start the container and perform a health check.

The workflow runs on pushes to `main` and pull requests targeting `main`.

## Deployment

The application is deployed on Render.

The footer displays the first seven characters of the deployed commit ID using `RENDER_GIT_COMMIT`, with `GIT_SHA` and `local` as fallbacks.

## Requirements

- Node.js 22 or newer
- npm
- Docker (for container testing)

## Setup

```bash
git clone <YOUR_REPOSITORY_URL>
cd "Classroom availability finder"
npm install
```

## Run Locally

```bash
npm start
```

Open `http://localhost:3000`.

For development with automatic reload:

```bash
npm run dev
```

## Testing

Run the automated tests:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

## Project Structure

```text
.
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── src/
│   ├── app.js
│   ├── config.js
│   ├── store/
│   ├── validation/
│   ├── routes/
│   └── views/
├── test/
│   └── app.test.js
├── server.js
├── Dockerfile
├── package.json
└── README.md
```

## Limitations

- Classroom data is stored in memory and resets when the server restarts.
- The application is intended as an academic project and is not designed for production-scale use.
