---
bootstrapped_at: 2026-05-20T06:33:30Z
starter_id: nx-angular-nest
starter_name: "Nx Monorepo (Angular + Nest)"
project_name: gathrly
language_family: js
package_manager: npm
cwd_strategy: subdir-then-move
bootstrapper_confidence: best-effort
phase_3_status: ok
audit_command: "npm audit --json"
---

## Hand-off

```yaml
starter_id: nx-angular-nest
package_manager: npm
project_name: gathrly
hints:
  language_family: js
  team_size: solo
  deployment_target: self-host
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: best-effort
  path_taken: custom
  quality_override: false
  self_check_answers:
    typed: true
    from_official_starter: true
    conventions: true
    docs_current: true
    can_judge_agent: true
  has_auth: true
  has_payments: false
  has_realtime: false
  has_ai: false
  has_background_jobs: false
```

## Why this stack

Nx Monorepo (Angular + Nest) remains the selected custom path because Gathrly needs a typed full-stack web app: organizer login, event publishing, attendee signup handling, organizer-only attendee data, and image upload/storage all imply backend business logic behind the Angular UI. The starter creates one TypeScript Nx workspace with an Angular web app, Nest API app, shared conventions, generated project structure, and a single task graph. It is marked best-effort because the scaffold is multi-step: Angular uses Nx's current Vitest-on-esbuild path, while the Nest API receives Vitest configuration without generated controller/service specs. Deployment defaults to self-host for the first bootstrap pass, with GitHub Actions and auto-deploy on merge.

## Pre-scaffold verification

| Signal | Value | Severity | Notes |
| --- | --- | --- | --- |
| npm package | create-nx-workspace v22.7.2 published 2026-05-19T21:30:46.961Z | fresh | resolved from cmd_template |
| GitHub repo | not run | n/a | card docs_url is https://nx.dev, not a GitHub repository URL |

## Scaffold log

**Resolved invocation**: `npx create-nx-workspace bootstrap-scaffold --preset angular-monorepo --appName web --style scss --routing --ssr true --bundler esbuild --e2eTestRunner none --interactive=false --packageManager npm --nxCloud skip --skipGit && cd bootstrap-scaffold && npx nx add @nx/nest --interactive=false && npx nx g @nx/nest:app apps/api --frontendProject web --unitTestRunner none --e2eTestRunner none && npx nx add @nx/vitest --interactive=false && npx nx g @nx/vitest:configuration --project api --testEnvironment node`

**Strategy**: scaffold into a temp directory then move files up
**Temporary directory override**: `bootstrap-scaffold` (letter-starting name required by Nx)
**Exit code**: 0
**Files moved**: 58,503
**Conflicts (.scaffold siblings)**: `.vscode/extensions.json.scaffold`, `.vscode/launch.json.scaffold`
**.gitignore handling**: moved silently
**bootstrap-scaffold cleanup**: deleted

Moved roots:

| Path | Files |
| --- | ---: |
| `.editorconfig` | 1 |
| `.gitignore` | 1 |
| `.nx` | 14 |
| `.prettierignore` | 1 |
| `.prettierrc` | 1 |
| `README.md` | 1 |
| `apps` | 32 |
| `eslint.config.mjs` | 1 |
| `node_modules` | 58,446 |
| `nx.json` | 1 |
| `package-lock.json` | 1 |
| `package.json` | 1 |
| `tsconfig.base.json` | 1 |
| `vitest.workspace.ts` | 1 |

## Post-scaffold audit

**Tool**: `npm audit --json`
**Summary**: 0 CRITICAL, 0 HIGH, 26 MODERATE, 0 LOW
**Direct vs transitive**: 13 direct MODERATE of total 26 MODERATE; 0 direct CRITICAL and 0 direct HIGH
**Exit code**: 1 (npm audit exits non-zero when vulnerabilities are present)

#### CRITICAL findings

None.

#### HIGH findings

None.

#### MODERATE findings

| Package | Direct | Cause | Fix available |
| --- | --- | --- | --- |
| `@angular-devkit/build-angular` | yes | `webpack-dev-server` | no |
| `@module-federation/cli` | no | `@module-federation/dts-plugin` | no |
| `@module-federation/dts-plugin` | no | `ws` | no |
| `@module-federation/enhanced` | no | module-federation dependency chain | no |
| `@module-federation/manifest` | no | `@module-federation/dts-plugin` | no |
| `@module-federation/node` | no | `@module-federation/enhanced` | yes |
| `@module-federation/rspack` | no | module-federation dependency chain | yes |
| `@nx/angular` | yes | Nx and Angular build dependency chain | no |
| `@nx/eslint` | yes | `@nx/jest`, `@nx/js` | downgrade to 22.6.5 marked semver-major |
| `@nx/eslint-plugin` | yes | `@nx/js` | downgrade to 22.6.5 marked semver-major |
| `@nx/jest` | no | `@nx/js` | yes |
| `@nx/js` | yes | `@nx/workspace` | downgrade path via `@nx/vitest` 22.6.5 marked semver-major |
| `@nx/module-federation` | no | module-federation and Nx dependency chain | no |
| `@nx/nest` | yes | `@nx/eslint`, `@nx/js`, `@nx/node` | downgrade to 22.6.5 marked semver-major |
| `@nx/node` | yes | `@nx/eslint`, `@nx/jest`, `@nx/js` | downgrade to 22.6.5 marked semver-major |
| `@nx/rspack` | no | module-federation and Nx dependency chain | no |
| `@nx/vite` | yes | `@nx/js`, `@nx/vitest` | downgrade to 22.6.5 marked semver-major |
| `@nx/vitest` | yes | `@nx/eslint`, `@nx/js` | downgrade to 22.6.5 marked semver-major |
| `@nx/web` | yes | Nx frontend tooling dependency chain | downgrade to 22.6.5 marked semver-major |
| `@nx/webpack` | yes | `@nx/js` | downgrade to 22.6.5 marked semver-major |
| `@nx/workspace` | yes | `nx` | downgrade path via `@nx/vitest` 22.6.5 marked semver-major |
| `brace-expansion` | no | GHSA-jxxr-4gwj-5jf2 | downgrade path via `@nx/vitest` 22.6.5 marked semver-major |
| `nx` | yes | `brace-expansion`, `yaml` | downgrade path via `@nx/vitest` 22.6.5 marked semver-major |
| `webpack-dev-server` | no | GHSA-79cf-xcqc-c78w | no |
| `ws` | no | GHSA-58qx-3vcg-4xpx | no |
| `yaml` | no | GHSA-48c2-rrv3-qjmp | yes |

#### LOW / INFO findings

None.

## Hints recorded but not acted on

| Hint | Value |
| --- | --- |
| bootstrapper_confidence | best-effort |
| quality_override | false |
| path_taken | custom |
| self_check_answers | typed: true; from_official_starter: true; conventions: true; docs_current: true; can_judge_agent: true |
| team_size | solo |
| deployment_target | self-host |
| ci_provider | github-actions |
| ci_default_flow | auto-deploy-on-merge |
| has_auth | true |
| has_payments | false |
| has_realtime | false |
| has_ai | false |
| has_background_jobs | false |

## Next steps

Next: a future skill will set up agent context (CLAUDE.md, AGENTS.md). For now, your project is scaffolded and verified.

Useful manual steps in the meantime:
- `git init` if you have not already, to start your own repo history.
- Review `.vscode/extensions.json.scaffold` and `.vscode/launch.json.scaffold` against the existing `.vscode` files.
- Address audit findings per project risk tolerance. The critical and high counts are zero; the moderate findings are mostly Nx and Angular tooling transitive chains.
- Extra local sanity checks run after this log was written: `npx nx show projects` listed `api` and `web`; `npx tsc -p apps/web/tsconfig.app.json --noEmit` passed; `npx nx run web:test --skip-nx-cache --outputStyle=stream` passed. `npx nx run-many -t build` built `api` but `web:build:production` exited with status 1 after emitting only Angular SSR build progress and no actionable diagnostic, even under Node 22.17.1.
