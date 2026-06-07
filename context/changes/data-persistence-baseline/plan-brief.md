# Data Persistence Baseline — Plan Brief

> Full plan: `context/changes/data-persistence-baseline/plan.md`

## What & Why

Provision PostgreSQL on Railway and wire it into the NestJS API with TypeORM + validated config, plus a reversible migration workflow. This is roadmap item **F-01** — the foundation every vertical slice (S-01 users → S-05 admin) needs before it can store anything. It ships **no application schema** on purpose.

## Starting Point

NestJS 11 API with an empty `AppModule`, a static `/api/health`, no ORM, no config module, and no `DATABASE_URL` wiring. The API builds via webpack `generatePackageJson` and deploys to Railway via a GitHub Action on push to `master`. Nothing runs migrations today.

## Desired End State

The API boots only with a valid `DATABASE_URL`, opens a TypeORM connection, and `/api/health` reports live DB status. Developers can author/run/revert migrations against a local docker-compose Postgres; on deploy, Railway runs migrations as a predeploy command before the new release starts. A single throwaway `health_check` migration proves the loop end-to-end, locally and in production.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| ORM / data layer | TypeORM | Most native NestJS integration; decorators already enabled; large training-data footprint | Plan |
| Migration execution on deploy | Railway predeploy command | Runs once per deploy with prod creds; keeps migrations out of CI (infra rule) and off restarts | Plan |
| Local Postgres | docker-compose | Reproducible, zero-cost, isolated from prod | Plan |
| Env config | `@nestjs/config` + Joi validation | Fail fast on missing/invalid `DATABASE_URL` instead of silent runtime crashes | Plan |
| Proof of workflow | Kept `health_check` migration | Exercises generate→run→revert and proves the Railway predeploy path before S-01 | Plan |
| `/health` | DB ping (`SELECT 1`) | Real post-deploy readiness signal | Plan |
| Scope | Infra + workflow only, zero domain tables | Matches F-01 exactly; keeps the foundation reviewable | Plan |
| Prod migration mechanism | Compiled JS (tsc) via predeploy; ts-node locally | Avoids shipping ts-node/typescript to Railway; survives webpack `generatePackageJson` | Plan |

## Scope

**In scope:** Railway Postgres provisioning, TypeORM + `@nestjs/config` wiring, framework-free `data-source.ts`, local docker-compose DB, migration scripts (local ts-node + compiled prod), one throwaway `health_check` migration, DB-aware `/health`, Railway predeploy config.

**Out of scope:** Any domain tables (users/events/signups/customization), seed data, object storage, preview-DB isolation, CI changes touching prod DB, pooling/HA tuning.

## Architecture / Approach

A single Nest-free `data-source.ts` exports both connection options (for `TypeOrmModule.forRootAsync`, `synchronize: false`) and a `DataSource` (for the TypeORM CLI). Migrations are authored locally with `ts-node`; production runs **compiled** migration JS (dedicated `tsc` build) so the Railway image needs no devDeps. Migrations execute via a `preDeployCommand` declared in a committed per-service `apps/api/railway.json`.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Local DB + config + connection | docker-compose Postgres, Joi-validated config, TypeORM connected on boot | Connection config duplicated instead of shared from `data-source.ts` |
| 2. Migration workflow + proof | tsc migrations build, npm scripts, kept `HealthCheck` migration, up→down→up verified | Compiled prod path diverges from the ts-node local path |
| 3. DB `/health` + Railway deploy | DB-aware `/health`, `railway.json` predeploy, prod verification | Railway config-as-code is per-service; api must point at `apps/api/railway.json` (manual one-time step) |

**Prerequisites:** Railway project with api/web services already exists; ability to create a Railway Postgres and set `DATABASE_URL`; Docker locally.
**Estimated effort:** ~2–3 sessions across 3 phases.

## Open Risks & Assumptions

- Railway config-as-code path must be set per-service in the dashboard — the only step not fully encoded in the repo (manual + verified in Phase 3).
- Assumes Railway runs `preDeployCommand` before swapping the release; a failed migration should block the deploy.
- When real entities arrive (S-01+), they must be imported by `data-source.ts` and included in the `build:migrations` tsc compile — a handoff note, not work for this change.
- App rollback does not revert schema; bad migrations need a forward-fix or human-approved `migration:revert:prod`.

## Success Criteria (Summary)

- Local: `migration:run`/`migration:revert` work against docker-compose Postgres; `/api/health` reflects DB state.
- Prod: a `master` deploy runs migrations via predeploy and production `/api/health` returns `db: 'ok'`.
- No domain schema introduced; `synchronize` is never enabled.
