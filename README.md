# Forgeboard Production Dashboard

A production line dashboard for engineer UPH targets and operator hourly output entry, backed by SQLite.

## Run

```bash
npm install
npm run migrate
npm run server
```

In a second terminal:

```bash
npm run dev
```

The browser communicates with the SQLite API through `/api/state`. Production lines, hourly output, and application wording are stored in `data/forgeboard.sqlite`, not browser local storage. See [docs/database.md](docs/database.md) for the schema and migration workflow.

Authentication and role permissions are documented in [docs/authentication.md](docs/authentication.md). Development accounts are seeded on the first server start; configure role passwords with environment variables before production use.

## Run with Ubuntu container

Build and start the production container:

```bash
docker compose up --build
```

Open http://localhost:4173. The image uses the official Node 22 Bookworm slim image and serves the production build and SQLite API on port `4173`.

For a secondary LCD or TV, open http://localhost:4173/?kiosk=1. This is a read-only, large-format display. The `TV display` button on the overview opens the same mode and requests browser fullscreen.

To build and run without Compose:

```bash
docker build -t production-dashboard .
docker run --rm -p 4173:4173 production-dashboard
```
