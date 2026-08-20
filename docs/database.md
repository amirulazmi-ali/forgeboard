# ForgeBoard SQLite Database

ForgeBoard stores production data in SQLite through the Node API server. The browser no longer reads or writes `localStorage`.

## Tables

- `production_lines`: line identity, part number, target UPH, status, shift, and display color.
- `hourly_output`: one row per production line and hour (`0` through `7`), with the pieces produced.
- `application_settings`: editable UI copy stored as key/value rows.

`hourly_output.line_id` references `production_lines.id` with cascading deletes. Constraints prevent non-positive targets, negative output, and invalid hour numbers.

## Migrations

Migration files are stored in `database/migrations/` and tracked in `schema_migrations`.

```bash
npm run migrate
```

The default database path is `data/forgeboard.sqlite`. Set `DB_PATH` to use another location:

```powershell
$env:DB_PATH = "C:\data\forgeboard.sqlite"
npm run migrate
```

## API

- `GET /api/health` returns the service health status.
- `GET /api/state` returns lines, hourly output, and application settings.
- `PUT /api/state` saves the complete dashboard state in one SQLite transaction.

The repository layer is implemented in `server/repositories/forgeRepository.js`; HTTP concerns remain in `server/index.js`.
