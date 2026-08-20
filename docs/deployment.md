# ForgeBoard Deployment

## Local development

Run the SQLite API and Vite in separate terminals from the project directory:

```bash
npm install
npm run migrate
npm run server
npm run dev
```

Vite proxies `/api` requests to `http://localhost:3001`. Open the Vite URL shown in the terminal.

## Production

The Docker image builds the frontend and runs the Node server on port `4173`. The server serves both the built SPA and the SQLite API.

```bash
docker compose up --build
```

The database is created at `data/forgeboard.sqlite` inside the container. For production, mount a persistent volume for the database directory and back it up regularly.

The application state API is available at `/api/state`, and the health check is available at `/api/health`.
