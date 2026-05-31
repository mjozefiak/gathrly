# Repository Guidelines

This is an npm-managed Nx workspace with an Angular SSR frontend in `apps/web` and a NestJS API in `apps/api`. Prefer Nx targets over direct framework CLI commands.

## Project Structure & Module Organization

- `apps/web/src` contains the Angular app, SSR entry points, global `styles.scss`, and routes/config under `apps/web/src/app`.
- `apps/web/public` holds static browser assets copied into the web build.
- `apps/api/src` contains the NestJS bootstrap in `main.ts`, app module/controller/service files under `apps/api/src/app`, and API assets under `apps/api/src/assets`.
- `dist/` and coverage output are generated artifacts; do not edit them by hand.
- Workspace config lives in `nx.json`, `tsconfig.base.json`, `eslint.config.mjs`, and `vitest.workspace.ts`.

## Build, Test, and Development Commands

- `npm install` installs dependencies from `package-lock.json`.
- `npx nx serve web` starts Angular and also runs `api:serve`.
- `npx nx build web` creates the Angular SSR production build in `dist/apps/web`.
- `npx nx build api` builds the NestJS API with the app-local Webpack config.
- `npx nx test web` runs Angular tests; `npx nx test api` runs API Vitest specs when present.
- `npx nx lint web` runs Angular and workspace ESLint rules for the web app.
- `npx nx show project <name>` lists available targets for `web` or `api`.

## Coding Style & Naming Conventions

Use TypeScript with 2-space indentation, UTF-8, final newlines, and trimmed trailing whitespace per `.editorconfig`. Angular files use SCSS; selector rules are enforced by `@apps/web/eslint.config.mjs`. Keep NestJS classes in PascalCase and colocate feature modules, controllers, services, and specs. Respect Nx module-boundary linting from `eslint.config.mjs`.

## Testing Guidelines

Tests use Vitest through Nx targets. Place tests next to the unit using `*.spec.ts` or `*.test.ts`; the API config also accepts tests under `apps/api/tests`. Run the relevant project test before handoff, and use `npx nx test <project> --coverage` when behavior needs coverage evidence.

## Security & Configuration Tips

Do not commit secrets or local environment files. Keep generated Nx, build, and coverage output out of source changes unless the task explicitly concerns generated artifacts.

## Commit & Pull Request Guidelines

This repository has no commits yet, so no commit-message convention is established. Until one is defined, use short imperative subjects, for example `Add event list route`. Pull requests should describe the change, list Nx targets run, link the issue, PRD note, or relevant file under `context/` when one exists, and include screenshots for visible UI changes.

<!-- BEGIN @przeprogramowani/10x-cli -->

## 10xDevs AI Toolkit - Module 2, Lesson 1

Move from sprint-zero setup to project orchestration with the **roadmap chain**:

```
(Module 1 foundation docs) -> /10x-roadmap -> backlog-ready roadmap items
```

`/10x-roadmap` is the lesson focus. `/10x-new` is intentionally introduced in Module 2, Lesson 2, when a selected roadmap item becomes an implementation change folder.

### Task Router - Where to start

| Skill | Use it when |
| --- | --- |
| **Roadmap (lesson focus)** | |
| `/10x-roadmap` | You have `context/foundation/prd.md` and a scaffolded project baseline, and you need a vertical-first MVP roadmap. The skill reads the PRD, inspects the code baseline, uses available foundation docs such as `tech-stack.md`, `infrastructure.md`, and `deploy-plan.md`, then writes `context/foundation/roadmap.md`. Use it BEFORE creating per-change folders or implementation plans. |
| **Re-run upstream if needed** | |
| `/10x-shape` / `/10x-prd` / `/10x-tech-stack-selector` / `/10x-bootstrapper` / `/10x-agents-md` / `/10x-infra-research` | Bundled from Module 1 so foundation contracts can be fixed before roadmap sequencing. If roadmap generation exposes a PRD gap, repair the PRD before pretending the backlog is ready. |

### How the chain hands off

- `/10x-roadmap` bridges product and implementation. It does not choose frameworks, design schemas, or write a per-change implementation plan.
- The output is `context/foundation/roadmap.md`: ordered milestones, vertical slices, bounded foundations, dependencies, unknowns, risk, and backlog handoff fields.
- Roadmap items should receive stable human-readable identifiers in backlog tools. The actual `context/changes/<change-id>/` folder is created in Lesson 2 with `/10x-new`.

### Roadmap boundaries

- Default to vertical slices: user-visible outcomes that cross UI, data, business logic, and integrations.
- Horizontal work is allowed only as a bounded enabler that names the downstream vertical milestone it unlocks.
- Avoid orphan horizontal work such as "build the whole database", "build all API endpoints", or "design the whole UI" before the first user-visible flow.
- Roadmap is not a calendar estimate. Do not invent dates, story points, or sprint velocity unless the user explicitly asks for a separate planning artifact.

### Foundation paths used by this lesson

- `context/foundation/prd.md` - input
- `context/foundation/tech-stack.md` - optional input
- `context/foundation/infrastructure.md` - optional input
- `context/deployment/deploy-plan.md` - optional input
- `context/foundation/roadmap.md` - output
- `context/foundation/lessons.md` - recurring rules and pitfalls
- `docs/reference/contract-surfaces.md` - load-bearing names registry

Skills must not write to `context/archive/`. Archived changes are immutable; if a resolved target path starts with `context/archive/`, abort with: "This change is archived. Open a new change with `/10x-new` instead."

<!-- END @przeprogramowani/10x-cli -->
