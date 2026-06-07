# Data Persistence Baseline Implementation Plan

## Overview

Provision a managed PostgreSQL database on Railway and wire it into the NestJS API via **TypeORM** with **`@nestjs/config`** for validated environment configuration, then establish a reversible **migration workflow** that works both locally (docker-compose Postgres) and on Railway (predeploy command). This is roadmap item **F-01** — a foundation that unlocks every downstream slice (S-01 user table → S-05). It deliberately introduces **no application schema**; the only migration that ships is a throwaway `health_check` table that proves the generate → run → revert loop end-to-end.

## Current State Analysis

- **API**: NestJS 11 at [apps/api/src/app/app.module.ts](apps/api/src/app/app.module.ts) with `imports: []`. [main.ts](apps/api/src/main.ts) sets a global `api` prefix and reads `process.env.PORT` raw. [app.controller.ts](apps/api/src/app/app.controller.ts) exposes a static `GET /api/health → {status:'ok'}`.
- **Build pipeline**: The API builds via **webpack with `generatePackageJson: true`** ([apps/api/webpack.config.js](apps/api/webpack.config.js)) plus Nx `prune-lockfile` / `copy-workspace-modules` ([apps/api/project.json](apps/api/project.json)). Only **statically imported** runtime deps land in `dist/apps/api`. Decorators are enabled (`experimentalDecorators` + `emitDecoratorMetadata`) in [apps/api/tsconfig.app.json](apps/api/tsconfig.app.json), so decorator-based ORM entities fit with no compiler changes.
- **Config**: The runtime packages are **already in `package.json`** (`@nestjs/config` ^4.0.4, `@nestjs/typeorm` ^11.0.1, `typeorm` ^0.3.30, `pg` ^8.21.0, `joi` ^17.13.3, plus `ts-node` ^10.9.2 in devDeps) — but **none of them are wired**: no `ConfigModule`/`TypeOrmModule` registration, no `DATABASE_URL` reading, no `data-source.ts`, no schema, no migrations exist.
- **Deploy**: [.github/workflows/railway-deploy.yml](.github/workflows/railway-deploy.yml) runs `railway up --ci --service api/web` on push to `master` (Node 22). Start command is `node dist/apps/api/main.js` ([root package.json](package.json) `start:api`). **Nothing runs migrations today.**
- **Infra constraints** ([context/foundation/infrastructure.md](context/foundation/infrastructure.md)): Railway managed Postgres; migrations must be reversible/forward-fixable and human-approved; app rollback does **not** roll back schema; CI/preview must **never** point at the prod DB.
- `.env` is **not** in [.gitignore](.gitignore) (only `dist`, `node_modules` are). Local Node is v24; CI/prod is Node 22 — both support `node --env-file`.

## Desired End State

- `docker compose up` starts a local Postgres; `npm run migration:run` applies all migrations against it and `npm run migration:revert` cleanly reverts the last one.
- The API boots only when `DATABASE_URL` is present and valid (Joi validation fails fast otherwise), opens a TypeORM connection, and `GET /api/health` returns `{ status, db }` where `db` reflects a live `SELECT 1`.
- A single committed migration (`HealthCheck`, creating a `health_check` table) exists under `apps/api/src/database/migrations/`.
- On push to `master`, Railway builds the api service (including compiled migrations), runs `migration:run:prod` as a **predeploy command** before the new release starts, and the production `/api/health` reports `db: ok`.
- `synchronize` is **never** enabled; schema changes only ever happen through reviewed migration files.

### Key Discoveries:

- Webpack `generatePackageJson` ([apps/api/webpack.config.js:18](apps/api/webpack.config.js#L18)) means TypeORM/pg must be in root **`dependencies`** and statically imported to ship — and the migration CLI cannot rely on the webpack bundle (single `main.js`). Migrations therefore need a **separate tsc compile** for prod.
- Decorators already enabled ([apps/api/tsconfig.app.json:6-7](apps/api/tsconfig.app.json#L7)) — TypeORM entities (future slices) need no tsconfig change.
- Existing `/api/health` ([apps/api/src/app/app.controller.ts:13-15](apps/api/src/app/app.controller.ts#L13)) is the natural place to add a DB readiness probe.

## What We're NOT Doing

- **No application schema**: no users, events, signups, customization, or organizer tables. Those belong to S-01–S-05.
- No seed data beyond the throwaway `health_check` table.
- No object storage / image upload provisioning (flagged in infra doc; belongs to S-02).
- No PR/preview-environment database isolation setup (infra doc unknown-unknown; out of scope for the baseline — documented as a forward risk).
- No CI changes that would expose the prod `DATABASE_URL` to GitHub Actions.
- No connection pooling tuning, read replicas, or HA.

## Implementation Approach

TypeORM is wired through a single framework-free `data-source.ts` that exports both the options object (consumed by `TypeOrmModule.forRootAsync` inside Nest) and a `DataSource` instance (consumed by the TypeORM CLI). Keeping it Nest-free means the migration CLI never imports the framework. Local migration authoring uses `ts-node` against the `.ts` source; production runs **compiled** migration JS (via a dedicated `tsc` build) so the Railway image needs neither ts-node nor TypeScript. Migrations execute on Railway as a **predeploy command** declared in a committed `railway.json` for the api service, so a failed migration blocks the release and never runs on ordinary restarts.

## Critical Implementation Details

- **Why compiled-JS migrations in prod**: the api ships through webpack `generatePackageJson` (single bundled `main.js`); the TypeORM CLI needs the data-source + migration classes as standalone modules. Authoring locally via `ts-node` is fine, but prod must not depend on devDeps (`ts-node`/`typescript` are pruned under `NODE_ENV=production`). A small `tsc` build (`build:migrations`) emits `dist/apps/api/database/{data-source.js,migrations/*.js}`, and the predeploy command runs the TypeORM CLI against that compiled `data-source.js`. `typeorm` + `pg` live in root `dependencies`, so they are present in the pruned prod install.
- **`data-source.ts` must stay framework-free**: it reads `process.env.DATABASE_URL` directly and imports only from `typeorm`. No `@nestjs/*` imports, no path aliases — otherwise the standalone `tsc` compile and CLI invocation break.
- **`synchronize: false` and `migrationsRun: false`** are load-bearing: schema only ever changes via reviewed migration files, and migrations run via the predeploy command (not on app bootstrap), per the infra doc's reversibility/human-approval requirement.
- **Railway config-as-code is per-service**: a root `railway.json` would also apply to the `web` service. The api service must be pointed at `apps/api/railway.json` (one-time dashboard "Config as code" path setting). This is the one step that cannot be fully encoded in the repo and is captured as a manual setup + verification step.
- **Forward note for S-01+**: when real entities are added, they must be (a) imported by `data-source.ts` so the CLI can diff/generate, and (b) included in the `build:migrations` tsc compile so the prod migration run can load them. Empty now, but the next slice's planner needs this.

## Phase 1: Local Postgres, validated config, and ORM connection

### Overview

Stand up a reproducible local Postgres, introduce validated environment config, and connect the Nest API to the database through TypeORM. After this phase the app refuses to boot without a valid `DATABASE_URL` and successfully opens a DB connection.

### Changes Required:

#### 1. Local database & environment scaffolding

**File**: `docker-compose.yml` (new, repo root)

**Intent**: Provide a one-command local Postgres for development and migration authoring.

**Contract**: A `postgres:16` service exposing `5432`, with `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` set to local dev values and a named volume for persistence.

**File**: `.env.example` (new, repo root) and `.gitignore` (modify)

**Intent**: Document required env vars and stop real `.env` files from being committed (signup data is sensitive per the infra doc).

**Contract**: `.env.example` contains `DATABASE_URL=postgresql://gathrly:gathrly@localhost:5432/gathrly`, `PORT=3000`, and `DATABASE_SSL=false`. `.gitignore` gains a `.env` entry (keep `.env.example` tracked).

#### 2. Runtime dependencies

**File**: `package.json` (modify) + `package-lock.json`

**Intent**: Ensure the ORM, driver, and config libraries are runtime deps so they survive webpack `generatePackageJson` + prod prune; the CLI runner is a devDep.

**Contract**: **Verify (do not re-add/re-pin)** — `dependencies` already contains `typeorm` (^0.3.30), `@nestjs/typeorm` (^11.0.1), `pg` (^8.21.0), `@nestjs/config` (^4.0.4), `joi` (^17.13.3), and `devDependencies` already contains `ts-node` (^10.9.2). Confirm these are present and NestJS-11/TS-5.9 compatible. Only act if something is missing.

#### 3. Validated config module

**File**: `apps/api/src/app/app.module.ts` (modify)

**Intent**: Make `DATABASE_URL` a validated, globally available config value so a misconfigured deploy fails loudly at boot.

**Contract**: Register `ConfigModule.forRoot({ isGlobal: true, validationSchema })` where the Joi schema validates `DATABASE_URL` as a **required postgres URI** — `Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required()` (so a malformed URL fails fast at config validation, not later at connect time), defaults `PORT` to `3000`, and defaults `DATABASE_SSL` to `false`. Validation errors must abort startup.

#### 4. Framework-free data source

**File**: `apps/api/src/database/data-source.ts` (new)

**Intent**: Single source of truth for connection options, shared by the Nest module and the TypeORM CLI, importable standalone.

**Contract**: Exports `dataSourceOptions: DataSourceOptions` (`type: 'postgres'`, `url: process.env.DATABASE_URL`, `entities: []`, `migrations: [<glob to ./migrations/*.{ts,js}>]`, `migrationsTableName`, `synchronize: false`, `migrationsRun: false`, `ssl` derived from `DATABASE_SSL`) and `export default new DataSource(dataSourceOptions)`. Imports only from `typeorm`. No `@nestjs/*` imports.

#### 5. Wire TypeORM into the app

**File**: `apps/api/src/app/app.module.ts` (modify)

**Intent**: Open the DB connection at app startup using the shared options.

**Contract**: `TypeOrmModule.forRootAsync` resolving to `dataSourceOptions` (reusing the exported object — do not duplicate connection config). No entities registered yet.

#### 6. Config-validation unit test + vitest no-test guard

**File**: `apps/api/src/app/config.spec.ts` (new) and `apps/api/vitest.config.mts` (modify)

**Intent**: Give `npx nx test api` a real test to run in Phase 1 — the project currently has **zero** spec files, so `nx test api` exits 1 with "No test files found". Also asserts the fail-fast config behavior the end state promises.

**Contract**: A unit test that exercises the Joi `validationSchema` directly (no full Nest bootstrap) and asserts it **rejects** a missing `DATABASE_URL` and **accepts** a valid one. Add `passWithNoTests: true` to `vitest.config.mts` `test` options as a safety net so an empty suite never hard-fails the gate.

### Success Criteria:

#### Automated Verification:

- API build passes: `npx nx build api`
- Lint passes: `npx eslint apps/api/src`
- API unit tests pass: `npx nx test api` (config-validation spec runs)
- App fails fast with a clear error when `DATABASE_URL` is unset (run `node --env-file=/dev/null dist/apps/api/main.js` or equivalent and confirm a validation error).

#### Manual Verification:

- `docker compose up -d` starts Postgres and it accepts connections.
- With `.env` present, `npx nx serve api` boots and logs a successful TypeORM connection (no schema sync attempted).
- Stopping Postgres causes a visible connection error on boot (confirms the wiring is real, not silently mocked).

**Implementation Note**: After this phase and all automated verification passes, pause for manual confirmation that the local DB connection works before proceeding.

---

## Phase 2: Migration workflow + proof

### Overview

Add the migration tooling (local ts-node scripts + a compiled-JS prod path) and prove the full generate → run → revert loop with a throwaway `HealthCheck` migration that ships as the first migration.

### Changes Required:

#### 1. Migrations tsc build

**File**: `apps/api/tsconfig.migrations.json` (new)

**Intent**: Compile the data source + migrations to plain JS for production use, independent of the webpack bundle.

**Contract**: Extends `tsconfig.app.json`; `rootDir: src/database`, `outDir: ../../dist/apps/api/database`, `include: ["src/database/**/*.ts"]`, decorators + `emitDecoratorMetadata` inherited, `module: commonjs`.

#### 2. npm scripts for the migration workflow

**File**: `package.json` (modify)

**Intent**: Give developers and the deploy pipeline a consistent migration interface; separate local (ts-node, `.env`) from prod (compiled JS, Railway-injected env).

**Contract**: Add scripts —
- `build:migrations` → `tsc -p apps/api/tsconfig.migrations.json`
- `typeorm` → base CLI via ts-node against `apps/api/src/database/data-source.ts`, env loaded with `node --env-file=.env`
- `migration:create` → create an **empty** migration skeleton (no DB connection, no entity diff) — this is how the throwaway `HealthCheck` migration is authored, since `migration:generate` diffs entities and the data source ships `entities: []` (generate would emit "No changes found")
- `migration:generate`, `migration:run`, `migration:revert` → local (ts-node) variants. **`migration:generate` is not usable until real entities exist (S-01+)**; documented here for that future use
- `migration:run:prod`, `migration:revert:prod` → run the TypeORM CLI against compiled `dist/apps/api/database/data-source.js` (no ts-node, no `--env-file`; env comes from the environment)

**Contract** (snippet — the ts-node base wiring is the non-obvious part other scripts depend on):
```jsonc
// package.json "scripts"
"typeorm": "node --env-file=.env -r ts-node/register ./node_modules/typeorm/cli.js -d apps/api/src/database/data-source.ts",
"migration:create": "node -r ts-node/register ./node_modules/typeorm/cli.js migration:create",
//   ^ create takes a path arg, e.g.:
//   npm run migration:create -- apps/api/src/database/migrations/HealthCheck
"migration:run": "npm run typeorm -- migration:run",
"migration:revert": "npm run typeorm -- migration:revert",
"migration:run:prod": "node ./node_modules/typeorm/cli.js migration:run -d ./dist/apps/api/database/data-source.js"
// migration:generate (S-01+, once entities exist) takes a name arg, e.g.:
//   npm run typeorm -- migration:generate apps/api/src/database/migrations/<Name>
```

#### 3. Throwaway HealthCheck migration

**File**: `apps/api/src/database/migrations/<timestamp>-HealthCheck.ts` (new, created via `migration:create` then hand-authored)

**Intent**: Prove the workflow with a trivial reversible migration that also gives S-01 a non-empty migrations directory pattern to follow.

**Contract**: Scaffold the file with `npm run migration:create -- apps/api/src/database/migrations/HealthCheck`, then **hand-author** the body: `up` runs `CREATE TABLE health_check` (`id` PK, `created_at timestamptz default now()`) and `down` runs `DROP TABLE health_check`. Do **not** use `migration:generate` — with `entities: []` it produces nothing. Commit the completed file.

### Success Criteria:

#### Automated Verification:

- Migration build passes: `npm run build:migrations` (emits `dist/apps/api/database/data-source.js` and the compiled migration).
- Local migrate up applies cleanly: `npm run migration:run` (against docker-compose Postgres).
- Local revert is clean: `npm run migration:revert` then `npm run migration:run` again (idempotent up → down → up).
- Compiled prod-path run works: after `npm run build:migrations`, `DATABASE_URL=<local> npm run migration:run:prod` applies against a fresh DB.
- Lint passes: `npx eslint apps/api/src`

#### Manual Verification:

- After `migration:run`, the `health_check` table exists in the local DB (verify via `psql`/client) and the TypeORM migrations table records it.
- After `migration:revert`, both the `health_check` table and its migrations-table row are gone.

**Implementation Note**: After this phase and all automated verification passes, pause for manual confirmation that the up/down loop and the compiled prod path both work before proceeding.

---

## Phase 3: DB-aware health check + Railway deploy wiring

### Overview

Turn `/api/health` into a real readiness probe and configure Railway so deploys run migrations via a predeploy command. This phase proves the workflow on the actual production target.

### Changes Required:

#### 1. DB readiness in /health

**File**: `apps/api/src/app/app.controller.ts` + `apps/api/src/app/app.service.ts` (modify)

**Intent**: Report live DB connectivity so Railway and humans get a real post-deploy signal.

**Contract**: Inject the TypeORM `DataSource` (via `@nestjs/typeorm`), run a lightweight `SELECT 1`. On success return HTTP **200** `{ status: 'ok', db: 'ok' }`. On DB failure the endpoint must **gate**: return HTTP **503** `{ status: 'error', db: 'down' }` (e.g. throw `ServiceUnavailableException` or set the response status) so a healthcheck/load balancer pointed at `/api/health` actually fails a DB-broken release rather than treating it as healthy. The handler still responds (no unhandled error) — it just carries a non-2xx status.

#### 2. Railway config-as-code for the api service

**File**: `apps/api/railway.json` (new)

**Intent**: Declare the build command (including compiled migrations) and the predeploy migration run, in-repo and reviewable.

**Contract**: `build.buildCommand` runs `npm run build:api && npm run build:migrations`; `deploy.preDeployCommand` runs `npm run migration:run:prod`; `deploy.startCommand` runs `npm run start:api`. Schema-conformant to Railway's config-as-code format.

#### 3. Deploy setup documentation

**File**: `docs/reference/deployment.md` (new or append) — also note in [context/foundation/infrastructure.md](context/foundation/infrastructure.md) if appropriate

**Intent**: Capture the one-time Railway steps that cannot live in the repo.

**Contract**: Documents: (a) create the Railway Postgres service and set the api service's `DATABASE_URL` (and `DATABASE_SSL` as needed) to reference it; (b) point the api service's "Config as code" path at `apps/api/railway.json`; (c) confirm migrations run as predeploy, not in the start command or CI.

### Success Criteria:

#### Automated Verification:

- API build passes: `npx nx build api`
- API tests pass (including a /health test asserting the `db` field): `npx nx test api`
- Lint passes: `npx eslint apps/api/src`

#### Manual Verification:

- Locally (Postgres up), `GET /api/health` returns HTTP 200 `{ status: 'ok', db: 'ok' }`; with Postgres stopped it returns HTTP 503 `{ status: 'error', db: 'down' }`.
- Railway: `DATABASE_URL` is set on the api service and points at the Railway Postgres (not a preview/CI DB).
- Railway build log shows `npm run build:migrations` succeeding — i.e. `tsc` (a devDependency) **is available at build time** and the new `buildCommand` did not skip dependency install (`NODE_ENV=production` install would drop devDeps). Confirm from the deploy log, do not assume.
- A deploy to `master` runs the predeploy `migration:run:prod` (visible in `railway logs`); the `health_check` table exists in the Railway DB.
- Production `GET /api/health` returns `db: 'ok'`.
- `railway deployment list --service api --environment production --json` shows the deploy succeeded.

**Implementation Note**: The Railway deploy and dashboard config require human action and credentials. After automated checks pass, hand off to the human to perform the Railway setup and confirm the production verification items.

---

## Testing Strategy

### Unit Tests:

- `/api/health` returns 200 `db: 'ok'` when the DataSource query resolves and 503 `db: 'down'` when it rejects (mock the DataSource).
- Config validation: boot fails when `DATABASE_URL` is missing/invalid.

### Integration Tests:

- Against docker-compose Postgres: app boots, connects, `/api/health` reports `db: ok`.
- Migration loop: `migration:run` → table present → `migration:revert` → table absent.

### Manual Testing Steps:

1. `docker compose up -d`, copy `.env.example` → `.env`, `npm run migration:run`, hit `/api/health`.
2. Stop Postgres; confirm `/api/health` reports `db: 'down'`.
3. `npm run build:migrations` then `npm run migration:run:prod` against a fresh local DB to exercise the compiled path.
4. Deploy to `master`; inspect `railway logs` for the predeploy migration; hit production `/api/health`.

## Performance Considerations

Negligible for an MVP at low QPS. TypeORM opens a connection pool at boot; the `/health` `SELECT 1` is trivial. No tuning needed at this scale.

## Migration Notes

- Migrations are reversible (`up`/`down`) and run via the Railway predeploy command — never on ordinary restarts and never in CI (which must not reach the prod DB).
- App rollback does **not** revert schema; a bad migration requires a forward-fix or explicit `migration:revert:prod` (human-approved), per the infra doc.
- `synchronize` stays `false` permanently.

## References

- Roadmap item: `context/foundation/roadmap.md` (F-01)
- Change identity: `context/changes/data-persistence-baseline/change.md`
- Infrastructure decisions & risks: `context/foundation/infrastructure.md`
- Existing health endpoint: [apps/api/src/app/app.controller.ts:13-15](apps/api/src/app/app.controller.ts#L13)
- Webpack generatePackageJson: [apps/api/webpack.config.js:18](apps/api/webpack.config.js#L18)
- Deploy workflow: [.github/workflows/railway-deploy.yml](.github/workflows/railway-deploy.yml)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Local Postgres, validated config, and ORM connection

#### Automated

- [x] 1.1 API build passes: `npx nx build api` — cc994aa
- [x] 1.2 Lint passes: `npx eslint apps/api/src` — cc994aa
- [x] 1.3 API unit tests pass: `npx nx test api` — cc994aa
- [x] 1.4 App fails fast with a clear error when `DATABASE_URL` is unset — cc994aa

#### Manual

- [x] 1.5 `docker compose up -d` starts Postgres and it accepts connections — cc994aa
- [x] 1.6 `npx nx serve api` boots and logs a successful TypeORM connection (no schema sync) — cc994aa
- [x] 1.7 Stopping Postgres causes a visible connection error on boot — cc994aa

### Phase 2: Migration workflow + proof

#### Automated

- [x] 2.1 Migration build passes: `npm run build:migrations` — da222a1
- [x] 2.2 Local migrate up applies cleanly: `npm run migration:run` — da222a1
- [x] 2.3 Revert is clean and idempotent: `migration:revert` then `migration:run` again — da222a1
- [x] 2.4 Compiled prod-path run works: `migration:run:prod` against a fresh DB — da222a1
- [x] 2.5 Lint passes: `npx eslint apps/api/src` — da222a1

#### Manual

- [x] 2.6 `health_check` table exists after `migration:run` and is recorded in the migrations table — da222a1
- [x] 2.7 `health_check` table and its migrations-table row are gone after `migration:revert` — da222a1

### Phase 3: DB-aware health check + Railway deploy wiring

#### Automated

- [x] 3.1 API build passes: `npx nx build api` — f22544e
- [x] 3.2 API tests pass, including a /health test asserting the `db` field: `npx nx test api` — f22544e
- [x] 3.3 Lint passes: `npx eslint apps/api/src` — f22544e

#### Manual

- [x] 3.4 Local `/api/health` returns 200 `db: 'ok'` (Postgres up) and 503 `db: 'down'` (Postgres stopped) — f22544e
- [x] 3.5 Railway `DATABASE_URL` is set on the api service and points at the Railway Postgres — f22544e
- [x] 3.6 Railway build log shows `build:migrations` (tsc) succeeding — devDeps available at build, `buildCommand` didn't skip install — f22544e
- [x] 3.7 Deploy to `master` runs the predeploy `migration:run:prod` (visible in `railway logs`); `health_check` table exists in the Railway DB — f22544e
- [x] 3.8 Production `/api/health` returns `db: 'ok'` — f22544e
- [x] 3.9 `railway deployment list --service api --environment production --json` shows success — f22544e
