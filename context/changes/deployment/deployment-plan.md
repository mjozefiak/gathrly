# Railway Integration and Merge-to-Production Deployment Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to carry this out task-by-task. Track progress with the checkboxes below.

**Goal:** Deploy Gathrly to Railway and automatically ship a new version after merges to the protected default branch, with explicit CLI usage, production-only rollout, and guarded support steps for external integrations.

**Architecture:** Use one Railway project with separate `web` and `api` services plus a Railway PostgreSQL baseline. Use the Railway CLI for local linking, validation, and log inspection; use GitHub Actions for auto-deploy on merge to the protected branch. Keep production-only for this first pass and add preview/staging later only if needed.

**Tech Stack:** Angular 21 SSR, NestJS 11, Nx 22, Node.js 20+, Railway CLI, GitHub Actions, Railway PostgreSQL.

---

### Phase 0: Prerequisites (done by human before agent starts)

> These steps must be completed manually before handing off to an agent. The agent assumes all items here are already done.

- [x] Install Railway CLI locally
- [x] Authenticate locally: `railway login` then verify with `railway whoami`
- [x] Create the Railway project in the dashboard and add three resources: `web`, `api`, and PostgreSQL
- [x] Link the local repo to the Railway project: `railway link`
- [x] Confirm the link with `railway status`
- [x] Add root npm scripts in [`package.json`](../../../package.json) for stable Railway commands:
  - `build:web` -> `npx nx build web`
  - `start:web` -> `node dist/apps/web/server/server.mjs`
  - `build:api` -> `npx nx build api`
  - `start:api` -> `node dist/apps/api/main.js`
- [x] Store a scoped `RAILWAY_TOKEN` (project/environment scope only) in GitHub Secrets for CI use
- [x] Leave [`apps/web/proxy.conf.json`](../../../apps/web/proxy.conf.json) as development-only — do not touch it

### Phase 1: Add production health endpoints
- [x] Add a simple health endpoint to [`apps/web/src/server.ts`](../../../apps/web/src/server.ts) before the SSR catch-all, such as `GET /health` returning `200`.
- [x] Add a simple health endpoint to [`apps/api/src/app/app.controller.ts`](../../../apps/api/src/app/app.controller.ts), exposed as `GET /api/health`, returning a tiny JSON payload. Use `@Get(‘health’)` on the existing root `@Controller()` — `main.ts` already sets `globalPrefix = ‘api’`, so the route resolves to `/api/health` automatically. Do not write `@Get(‘/api/health’)`.
- [x] Keep both servers bound to Railway’s injected `PORT`; do not hard-code a production port override.
- [x] Keep the API response and the web health endpoint free of external integration dependencies so deploy verification stays deterministic.

### Phase 2: Wire Railway services and database
- [ ] Confirm Phase 0 is complete: `railway status` must show the linked project with `web`, `api`, and PostgreSQL resources.
- [ ] Configure the `web` service from the repo root with the build/start commands above and a healthcheck path of `/health`.
- [ ] Configure the `api` service from the repo root with the build/start commands above and a healthcheck path of `/api/health`.
- [ ] Provision PostgreSQL in the same Railway project using the Railway dashboard (Add Service → Database → PostgreSQL).
- [ ] Wire the database to the `api` service by adding a Railway variable reference in the `api` service environment: set `DATABASE_URL` to `${{Postgres.DATABASE_URL}}` — Railway resolves this reference automatically at runtime so the connection string is never stored as plaintext in the plan or in source.
- [ ] Confirm the variable is injected by running `railway variables --service api --environment production` after linking; `DATABASE_URL` must appear.
- [ ] Do not wire `DATABASE_URL` to the `web` service — the Angular SSR server does not connect to the database directly.
- [ ] Keep the API private initially unless a real external consumer needs a public ingress point.
- [ ] Keep `NODE_ENV=production` set in Railway for both app services.
- [ ] Do not enable preview/PR environments in this first pass.

### Phase 3: Deploy commands and when to run them
- [ ] Use the following Railway CLI sequence for the first local validation pass, from the repo root:
```bash
railway up --service api --environment production
railway logs --latest --service api --environment production --build
railway deployment list --service api --environment production --json
railway up --service web --environment production
railway logs --latest --service web --environment production --build
railway logs --latest --service web --environment production
railway deployment list --service web --environment production --json
```
- [ ] Use `railway up` in attached mode for the first manual deploy so build and deploy logs stay visible in the terminal.
- [ ] Use `railway logs --latest` after deploys to confirm runtime startup, not just build success.
- [ ] Use `railway deployment list --json` after each service deploy so the latest deployment ID and status are easy to inspect in automation.
- [ ] Use `railway redeploy` only for recovery cases such as environment-variable-only changes or a clean rebuild of the same code.
- [ ] Do not use `railway deploy` for app code in this plan; reserve it for Railway templates such as PostgreSQL if you choose to create templates by CLI later.

### Phase 4: Add CI for auto-deploy after merge to `master`
- [x] Add a GitHub Actions workflow at `.github/workflows/railway-deploy.yml`.
- [x] Trigger the workflow on push to the protected default branch (`master`).
- [x] Make the workflow deploy in order:
  - API first
  - Web second
- [x] In the workflow, install the Railway CLI, then run:
```bash
railway up --ci --service api --environment production
railway up --ci --service web --environment production
railway deployment list --service api --environment production --json
railway deployment list --service web --environment production --json
```
- [x] Use `--ci` in GitHub Actions so the job streams build logs and exits cleanly for automation.
- [x] Add concurrency protection so a newer merge cancels an older in-flight deploy job instead of racing it.
- [x] Keep deployment failure behavior strict: if either service fails to build or deploy, the workflow must fail the merge deployment.

### Phase 5: External integrations and edge-case support
- [ ] Document that `apps/web/proxy.conf.json` is only for local development and must not be relied on in production.
- [ ] If a browser-facing integration is added later, introduce an explicit runtime base URL and origin allowlist instead of using the dev proxy.
- [ ] If OAuth, email, webhook, or storage integrations are added later, register per-environment callback URLs and secrets in Railway variables before enabling the integration.
- [ ] If uploads or generated media become a product feature, move them to object storage; do not rely on container-local filesystem persistence.
- [ ] If Railway healthchecks fail because the app listens on the wrong host or port, fix the bind target first; only increase timeout settings after confirming the app is reachable.
- [ ] If the local Angular web build reports `listen EPERM: operation not permitted ::1`, treat that as a local sandbox artifact and validate the same build in a normal shell or in Railway logs before changing app code.

### Phase 6: Rollback and production support
- [ ] Rehearse a rollback once the first production deploy is stable, using Railway deployment history.
- [ ] Keep database rollback separate from app rollback; do not assume Railway rollback reverses schema or data changes.
- [ ] Before the first production deploy that runs migrations, take a manual database backup using Railway's dashboard or `pg_dump` via the Railway proxy (`railway connect Postgres`); treat this as a required gate, not optional.
- [ ] Keep destructive production actions human-only: primary secret rotation, database deletion, and any migration that cannot be safely reversed.
- [ ] Scope Railway variables and tokens to the project/environment only; do not widen permissions unnecessarily.

---

### Assumptions
- Production-only for this first pass.
- The GitHub Actions trigger follows the protected default branch (`master`).
- The API stays private unless a real external consumer needs it.
- PostgreSQL is provisioned now as the same-provider baseline, but the current app code does not yet depend on it.
- Railway service settings remain the source of truth for the deploy, with root npm scripts added mainly to keep commands stable and repeatable.

### References
- Railway CLI install/auth/deploy docs: official Railway CLI pages
- Railway deployment and logs docs: official Railway CLI pages
- Railway GitHub Actions / CI integration docs: official Railway deployment docs
