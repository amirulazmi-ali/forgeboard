# Forgeboard Production Dashboard

A local-first production line dashboard for engineer UPH targets and operator hourly output entry.

## Run

```bash
npm install
npm run dev
```

The dashboard stores line configuration and hourly entries in the browser's local storage.

## Run with Ubuntu container

Build and start the production container:

```bash
docker compose up --build
```

Open http://localhost:4173. The image is based on `ubuntu:24.04`, installs Node 22 for Vite compatibility, and serves the production build on port `4173`.

For a secondary LCD or TV, open http://localhost:4173/?kiosk=1. This is a read-only, large-format display. The `TV display` button on the overview opens the same mode and requests browser fullscreen.

To build and run without Compose:

```bash
docker build -t production-dashboard .
docker run --rm -p 4173:4173 production-dashboard
```
