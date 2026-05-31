---
project: Gathrly
researched_at: 2026-05-23T00:00:00+02:00
recommended_platform: Railway
runner_up: Render
context_type: mvp
tech_stack:
  language: TypeScript
  framework: Angular 21 SSR + NestJS 11 in Nx 22
  runtime: Node.js 20+
---

## Recommendation

**Deploy on Railway.**

Railway is the best MVP fit for Gathrly because the app is a TypeScript Nx monorepo with Angular SSR, a NestJS API, request/response traffic, single-region tolerance, and a preference for a same-provider database. Railway supports JavaScript monorepos, CLI deploys with `railway up`, managed PostgreSQL templates, JSON-oriented deployment inspection, and a current Railway MCP server with OpenAI Codex support.

The recommendation optimizes for the constraints gathered during research: no persistent connections required, cost and DX roughly equal, only light AWS familiarity, single-region MVP usage, and co-located database preferred.

## Platform Comparison

| Platform | CLI-first | Managed/Serverless | Agent-readable docs | Stable deploy API | MCP / Integration | Total | Notes |
|---|---|---|---|---|---|---|---|
| Railway | Pass | Pass | Pass | Pass | Pass | 5/5 | Best fit for Nx Node services plus same-provider Postgres. CLI docs show `railway up`, deployment listing with JSON output, logs, and service/environment targeting. Railway MCP supports Codex. |
| Render | Pass | Pass | Partial | Pass | Partial | 3.5/5 | Strong conventional Node + Postgres host. Render CLI and API cover many operations, and rollback has an API endpoint, but the platform is less agent-native than Railway for this workflow. |
| Fly.io | Pass | Partial | Pass | Pass | Partial | 3.5/5 | Excellent CLI and persistent-process support. More container and machine-oriented than needed for this MVP, and managed Postgres lives outside the app lifecycle. |
| Vercel | Pass | Pass | Pass | Pass | Partial | 3.5/5 | Strong CLI and deployment ergonomics, but Vercel Postgres is no longer native for new projects; new projects use Marketplace integrations, which conflicts with the co-location preference. |
| Cloudflare Workers + Pages | Pass | Pass | Pass | Pass | Pass | 3/5 | Excellent agent-readable docs, pricing, and edge platform. Not shortlisted because a NestJS + Angular SSR Node app would require more adaptation than a Node PaaS for this MVP. |
| Netlify | Pass | Pass | Partial | Pass | Pass | 3/5 | Good deploy previews and database tooling, but weaker fit for a full NestJS API in an Nx monorepo. |
| AWS Elastic Beanstalk + RDS / Lightsail | Pass | Partial | Pass | Pass | Partial | 3/5 | Viable due to some AWS familiarity, but more IAM, service-selection, logging, and database wiring overhead than the MVP needs. Lightsail managed databases start at a higher baseline than Railway Hobby. |

Sources checked:

- Railway monorepo deployment docs: https://docs.railway.com/deployments/monorepo
- Railway CLI deploy docs: https://docs.railway.com/cli/deploying
- Railway deployment management docs: https://docs.railway.com/cli/deployment
- Railway pricing docs: https://docs.railway.com/pricing
- Railway MCP docs: https://docs.railway.com/cli/mcp
- Railway May 19, 2026 incident report: https://blog.railway.com/p/incident-report-may-19-2026-gcp-account-outage
- Render CLI docs: https://render.com/docs/cli
- Render rollback docs: https://render.com/docs/rollbacks
- Fly.io CLI docs: https://fly.io/docs/flyctl/
- Fly.io pricing docs: https://fly.io/docs/about/pricing/
- Vercel CLI docs: https://vercel.com/docs/cli
- Vercel Postgres docs: https://vercel.com/docs/postgres
- Cloudflare Workers pricing/docs index: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Workers deployments docs: https://developers.cloudflare.com/workers/configuration/versions-and-deployments/
- Netlify deploy overview: https://docs.netlify.com/deploy/deploy-overview/
- Netlify database CLI docs: https://docs.netlify.com/build/data-and-storage/netlify-database/cli/
- AWS Amplify SSR docs: https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html
- AWS Lightsail pricing FAQ: https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-frequently-asked-questions-faq-billing-and-account-management.html

### Shortlisted Platforms

#### 1. Railway (Recommended)

Railway won because it aligns with the actual deployment shape: a full-stack TypeScript monorepo, separate web/API services, and a same-provider PostgreSQL database. Its CLI is current and scriptable, its docs are straightforward to parse, it has first-class MCP support for Codex, and its $5 Hobby plan is appropriate for a low-QPS MVP.

#### 2. Render

Render is the best conservative runner-up for a Node web service plus managed Postgres. It has a mature PaaS feel and clear rollback semantics, but it is less optimized for agent-driven setup than Railway and will likely require more explicit service configuration.

#### 3. Fly.io

Fly.io is strong when the app needs persistent processes, global app placement, or container-level control. Gathrly does not need those yet, so Fly's additional machine, Docker, region, and database lifecycle decisions are unnecessary MVP complexity.

## Anti-Bias Cross-Check: Railway

### Devil's Advocate - Weaknesses

1. Railway had a major platform-wide outage on May 19-20, 2026 after Google Cloud suspended Railway's production account; at peak impact all Railway workloads across all regions were unreachable.
2. Railway's rollback path is documented most clearly in the dashboard flow. The CLI/API is strong for deploys, logs, and deployment inspection, but production rollback should still be treated as a human-approved operation.
3. Nx monorepo deployment is not magic. The web service, API service, build commands, start commands, and environment variables must be explicit or the wrong process can be deployed successfully.
4. Railway's low baseline price is not a hard monthly cap. The Hobby subscription counts toward resource usage, then CPU, memory, storage, and egress are metered.
5. Platform rollback does not roll back database schema changes. A bad migration can outlive a successful app rollback.

### Pre-Mortem - How This Could Fail

Six months from now, the Railway decision fails because the MVP was treated like a one-click deploy instead of a two-service monorepo. The Angular SSR server and Nest API share unclear environment variables, preview environments point at the wrong database, and a schema migration ships without a reversible path. A platform incident or deploy backlog hits during an event launch, and because runtime, database, logs, and deployment controls all live in Railway, the team has no practiced fallback. The product itself is small, but signup data is sensitive enough that a misconfigured preview or migration becomes painful. The real failure is not Railway alone; it is choosing Railway for speed, then skipping the small deployment discipline Railway still requires.

### Unknown Unknowns

- Railway PR or cloned environments need explicit database isolation rules before preview deploys handle real attendee data.
- Railway rollback may restore application image and variables, but it will not automatically reverse database migrations.
- Railway's May 2026 outage shows that even multi-provider underlying infrastructure can still share a control-plane dependency.
- Nx 22 plus Angular 21 SSR output requires service start commands to point at the built server output, not only the browser static assets.
- If image uploads are stored locally in the app container, they may disappear or behave inconsistently; object storage should be selected before image upload becomes real product functionality.

## Operational Story

- **Preview deploys**: Use Railway GitHub integration or `railway up` against a non-production Railway environment. For PR previews, create isolated Railway environments and do not bind preview services to the production Postgres database.
- **Secrets**: Store runtime secrets in Railway service/environment variables. Use `RAILWAY_API_TOKEN` only in local shell or CI secret storage. Do not commit `.env` files or Railway tokens.
- **Rollback**: Treat rollback as human-approved. Use Railway deployment history in the dashboard for immediate rollback, or use Railway's deployment/API tooling only after confirming the target deployment and migration state. Database migrations require a separate forward-fix or reversible migration plan.
- **Approval**: An agent may deploy to preview/staging, read logs, and inspect deployments. A human approves production deploys, production rollback, primary secret rotation, database deletion, and destructive migration execution.
- **Logs**: Use `railway logs` for current service logs and `railway deployment list --json` to inspect deployment state. Use Railway dashboard logs when a deploy fails before the CLI has enough context.

## Risk Register

| Risk | Source | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| Railway platform/control-plane outage affects all Gathrly services | Research finding / Devil's advocate | M | H | Keep DNS, database exports/backups, and deploy notes documented; accept this MVP risk instead of overbuilding multi-cloud HA. |
| Preview environment accidentally points at production database | Unknown unknowns | M | H | Create separate Railway environments and separate Postgres instances or credentials for preview/staging before enabling PR previews. |
| Nx monorepo deploy starts the wrong process | Devil's advocate | M | M | Define explicit Railway services for web and API with exact build/start commands and verify each service health endpoint after deploy. |
| Bad database migration survives app rollback | Pre-mortem | M | H | Require migration review, backups before migration, and reversible/forward-fix migration scripts before production deploy. |
| Usage-based billing exceeds expectations | Devil's advocate | M | M | Set Railway spending alerts/limits, check usage after each public event, and keep image/object storage out of the app container. |
| Agent performs a risky production operation through CLI or MCP | Unknown unknowns | L | H | Scope tokens to the project, keep destructive production actions human-only, and avoid granting billing/account-wide permissions. |
| Local uploads are lost or inconsistent | Unknown unknowns | M | M | Use object storage for event images before release; do not rely on container-local filesystem persistence. |

## Getting Started

1. Add explicit npm scripts at the workspace root for Railway, for example `build:web`, `start:web`, `build:api`, and `start:api`, each wrapping the existing Nx targets.
2. Create a Railway project with three resources: `web`, `api`, and PostgreSQL. Use Railway's shared monorepo support and configure separate build/start commands for each service.
3. Deploy the API service first with `railway up` from the repository root, targeting the API service and production environment after linking the project.
4. Deploy the Angular SSR web service separately, targeting the web service. Confirm the start command uses the server output from `dist/apps/web/server`, not only `dist/apps/web/browser`.
5. Configure secrets in Railway variables, then verify `railway logs` and `railway deployment list --json` before sending real attendee traffic.

## Out of Scope

The following were not evaluated in this research:

- Docker image configuration
- CI/CD pipeline setup
- Production-scale architecture (multi-region, HA, DR)
