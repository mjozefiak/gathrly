# Deployment Reference

Production runs on Railway. Each service (`api`, `web`) is deployed by the
`Railway Deploy` GitHub Action (`.github/workflows/railway-deploy.yml`) on push
to `master` via `railway up --ci --service <name> --environment production`.

## Data persistence baseline (F-01) — one-time Railway setup

The repo encodes the build/predeploy/start commands for the `api` service in
[`apps/api/railway.json`](../../apps/api/railway.json). The following steps
**cannot** live in the repo and must be done once in the Railway dashboard/CLI.

### 1. Provision Postgres and inject `DATABASE_URL`

1. In the Railway project, add a **PostgreSQL** database service.
2. On the **`api`** service, set the environment variables:
   - `DATABASE_URL` → reference the Postgres service's connection string
     (Railway variable reference, e.g. `${{Postgres.DATABASE_URL}}`). It **must**
     point at the production Postgres — never a preview/CI database.
   - `DATABASE_SSL` → `true` if the Railway Postgres connection requires TLS
     (managed Postgres typically does). The app reads this and enables
     `ssl: { rejectUnauthorized: false }` accordingly.
   - `PORT` is provided by Railway automatically.

### 2. Point the `api` service at its config-as-code file

Railway config-as-code is **per service**. A root `railway.json` would also apply
to `web`, so the `api` service must be pointed explicitly at its own file:

- `api` service → **Settings → Config as code** → path: `apps/api/railway.json`.

This is the one step that cannot be encoded in the repo.

### 3. Confirm migrations run as predeploy (not in CI, not in start)

`apps/api/railway.json` declares:

- `build.buildCommand`: `npm run build:api && npm run build:migrations`
  (compiles the app bundle **and** the standalone migration JS).
- `deploy.preDeployCommand`: `npm run migration:run:prod` — runs the TypeORM CLI
  against the compiled `dist/apps/api/database/data-source.js` **before** the new
  release starts. A failed migration blocks the release and never runs on an
  ordinary restart.
- `deploy.startCommand`: `npm run start:api`.

CI (`railway-deploy.yml`) must **never** receive the production `DATABASE_URL`;
migrations only ever run through the predeploy command on Railway.

### Verification after a deploy

- **Build log** shows `npm run build:migrations` (i.e. `tsc`) succeeding. `tsc` is
  a devDependency, so confirm the build step did **not** install with
  `NODE_ENV=production` (which would drop devDeps). Confirm from the log — do not
  assume.
- **Deploy log** (`railway logs`) shows the predeploy `migration:run:prod`
  executing; the `health_check` table exists in the Railway Postgres.
- `GET /api/health` returns `200 { "status": "ok", "db": "ok" }`.
- `railway deployment list --service api --environment production --json` shows
  the deploy succeeded.

## Rollback note

App rollback does **not** revert schema. A bad migration requires a forward-fix
or an explicit, human-approved `npm run migration:revert:prod`. `synchronize`
stays `false` permanently — schema only ever changes through reviewed migration
files. See [`context/foundation/infrastructure.md`](../../context/foundation/infrastructure.md).
