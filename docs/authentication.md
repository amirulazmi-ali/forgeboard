# ForgeBoard Authentication and RBAC

ForgeBoard uses server-side sessions backed by SQLite. Passwords are hashed with Node's `scrypt`; the browser receives only an HttpOnly session cookie. Sessions expire after eight hours.

## Roles

| Role | Read dashboard | Modify targets | Enter output | Manage lines/settings |
|---|---:|---:|---:|---:|
| Admin | Yes | Yes | Yes | Yes |
| Engineer | Yes | Yes | No | No |
| Operator | Yes | No | Yes | No |
| Viewer | Yes | No | No | No |

The UI hides controls that the current role cannot use, but the authoritative checks are in `server/middleware/permissions.js` and are applied by the API server.

## Development accounts

The first server start seeds these accounts when the users table is empty:

- `admin` / `admin123`
- `engineer` / `engineer123`
- `operator` / `operator123`
- `viewer` / `viewer123`

Set `FORGEBOARD_ADMIN_PASSWORD`, `FORGEBOARD_ENGINEER_PASSWORD`, `FORGEBOARD_OPERATOR_PASSWORD`, and `FORGEBOARD_VIEWER_PASSWORD` before first startup to use different passwords. Change or remove these development defaults before production deployment.

## Auth endpoints

- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`

State reads require an authenticated session. State writes are checked by comparing the previous and submitted state, so a client cannot bypass role restrictions by crafting a request.
