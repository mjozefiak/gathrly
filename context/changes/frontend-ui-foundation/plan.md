# Frontend UI Foundation Implementation Plan

## Overview

Turn the bare Nx/Angular scaffold in `apps/web` into a coherent visual foundation for Gathrly: remove the generated boilerplate, install and configure **Spartan UI (Brain + Helm) on Tailwind CSS v4**, and establish a **CSS-custom-property design-token system** (color, typography, spacing, radius, shadow/elevation, breakpoints) in a clean-modern-minimal direction. Prove the foundation with a small set of base components, a temporary token/component showcase, a minimal app shell (header + footer), and a real marketing landing page at `/`.

This is roadmap item **F-02** (Stream A). It unlocks S-01 (auth screens), S-02 (event forms + public page), and especially **S-04 (event-customization)**, which overrides per-event colors and fonts at runtime — the reason the token layer must be CSS variables, not compile-time SCSS.

## Current State Analysis

The Angular app is the untouched Nx scaffold:

- [apps/web/src/app/app.ts](apps/web/src/app/app.ts) imports `NxWelcome`; [apps/web/src/app/app.html](apps/web/src/app/app.html) renders `<app-nx-welcome>` above `<router-outlet>`.
- [apps/web/src/app/nx-welcome.ts](apps/web/src/app/nx-welcome.ts) is a large generated component (boilerplate to delete).
- [apps/web/src/app/app.routes.ts](apps/web/src/app/app.routes.ts) is an empty `Route[]`.
- [apps/web/src/styles.scss](apps/web/src/styles.scss) and [apps/web/src/app/app.scss](apps/web/src/app/app.scss) are empty placeholders.
- [apps/web/src/app/app.config.ts](apps/web/src/app/app.config.ts) wires **SSR hydration** (`provideClientHydration(withEventReplay())`) — SSR is live via `server.ts` / `main.server.ts`.

Stack facts that constrain this work:

- **Angular 21.2**, **Nx 22.7.2**, **npm**, component prefix `app`, SCSS as `inlineStyleLanguage`.
- Production budget caps `anyComponentStyle` at **4kb warn / 8kb error** ([apps/web/project.json](apps/web/project.json)) — relevant if any single component stylesheet grows large.
- No UI library installed; only `@angular/forms` beyond Angular core.
- Tests run via `@angular/build:unit-test` (Vitest) through Nx targets.

### Key Discoveries:

- **Spartan is CSS-variable-themed by design.** `@spartan-ng/cli:init` installs Brain from npm, copies Helm components into the repo (we own them), and wires a Tailwind preset (`hlm-tailwind-preset.css`) whose theme is driven by CSS custom properties. This means our "tokens as CSS custom properties" decision *is* Spartan's native model — we extend its theme rather than fight it. (Source: `spartan` skill, `customization.md`.)
- **Spartan ships `--radius` and semantic color tokens already** (shadcn lineage: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--card`, `--border`, etc.). Our color/radius tokens layer onto these; we add typography, spacing alignment, shadow/elevation, and breakpoint tokens.
- **The S-04 override contract is the load-bearing design choice.** S-04 must override per-event colors/fonts at runtime with <500ms live preview (PRD NFR). Because the theme is CSS variables, S-04 overrides them on a scoped element (e.g. the event-page root) — no recompile. F-02 must (a) keep color tokens as semantic foreground/background *pairs* so contrast is enforceable later, and (b) document this override scope as a named contract so S-04 plugs in cleanly.
- **SSR is non-negotiable.** Self-hosted fonts (chosen) avoid the FOUC/CLS and third-party-request problems web-font CDNs cause under SSR. Spartan/Brain sits on Angular CDK, which is SSR-compatible, but the showcase/landing render paths must be confirmed server-side.
- **Tailwind v4 + Spartan preset is the supported path**; the Spartan preset is a CSS import in the global stylesheet (`tailwindCssFile`), not a JS config. Tailwind's reset can collide with other resets — with a clean scaffold this is low-risk, but confirm no double-reset.

## Desired End State

Running `npx nx serve web` serves an app where:

- No `nx-welcome` / generated boilerplate remains anywhere.
- `/` renders a polished, token-styled marketing landing page (hero + value prop + a "Log in" CTA placeholder) inside a header (brand → `/`, "Log in" placeholder link) + simple footer shell.
- `/_foundation` renders a temporary showcase of the design tokens (color swatches with fg/bg pairs, type scale, spacing, radius, shadow) and the installed base components, used for visual QA.
- All UI is styled through semantic CSS-custom-property tokens; changing a token value at `:root` (or a scoped element) recolors/retypes the UI without recompiling — verified by hand in the showcase.
- The production SSR build, lint, type-check, and unit tests all pass.

Verify via the automated checks in each phase plus a manual pass over `/` and `/_foundation` on mobile + desktop widths.

## What We're NOT Doing

- **No auth/login screens** (S-01) — the "Log in" link is a placeholder route that 404s or points to a stub until S-01.
- **No event creation forms or public event page** (S-02).
- **No customization UI, color/font pickers, or runtime override implementation** (S-04) — we only *structure and document* the override contract and contrast pairing; we do not build the picker or the enforcement code.
- **No auth-conditional header rendering** — the shell is static; S-01 swaps the placeholder link for the real flow.
- **No API wiring, data fetching, or backend changes.**
- **No dark theme delivery** — token structure is dark-ready (semantic vars on a theme scope) but only the light theme ships.
- **No motion/transition token set** — deferred until the first animation needs it.
- **No first event-page template** — that is S-02/S-04 territory and needs event data.

## Implementation Approach

Work bottom-up so each layer is verifiable before the next consumes it: **plumbing → tokens → components+showcase → shell+landing+docs**. Spartan's generators (`init`, `ui`, `ui-theme`, `info`, `healthcheck`) do the heavy lifting; our authored work is the token system, the visual direction, the shell/landing markup, and the contract documentation. Every phase ends green on build/lint/type-check/test and pauses for a manual visual gate before the next.

## Critical Implementation Details

- **Spartan + Angular 21 / Nx 22.7 compatibility is unverified.** Before relying on it, run `npx nx g @spartan-ng/cli:info --json` and confirm it resolves against the installed Angular/CDK/Tailwind versions; if `init` errors on the version, that is a Phase 1 blocker to surface immediately (fallback: pin a compatible Spartan version or, last resort, Tailwind v4 + Angular CDK headless without Helm). Do not proceed past Phase 1 until `info`/`init` succeed.
- **SSR render safety.** Confirm the showcase and landing render under SSR (`npx nx build web` + `npm run start:web`, or serve and view source) — no `window`/`document` access at module load, no hydration mismatch warnings in the console. Self-hosted fonts must be declared with `font-display: swap` and preloaded to avoid CLS.
- **Token override scope is a named contract for S-04.** Author color tokens as semantic fg/bg pairs and document a single override scope (the element S-04 will set per-event CSS variables on). This is the interface S-04 depends on — name it once, in the foundation docs, and don't let it drift.
- **Component-style budget.** Keep per-component SCSS minimal (utilities/tokens do the work); a single component stylesheet over 4kb fails the production build.

## Phase 1: Boilerplate removal & Spartan/Tailwind init

### Overview

Remove the generated scaffold and install + configure Spartan UI on Tailwind v4, leaving a clean app that still builds and serves with SSR intact.

### Changes Required:

#### 1. Remove generated boilerplate

**Files**: [apps/web/src/app/nx-welcome.ts](apps/web/src/app/nx-welcome.ts) (delete), [apps/web/src/app/app.ts](apps/web/src/app/app.ts), [apps/web/src/app/app.html](apps/web/src/app/app.html), [apps/web/src/app/app.scss](apps/web/src/app/app.scss), [apps/web/src/app/app.routes.ts](apps/web/src/app/app.routes.ts)

**Intent**: Delete `nx-welcome.ts`, remove its import/usage from `App`, reduce `app.html` to just `<router-outlet>` (shell comes in Phase 4), and leave `app.routes.ts` ready to receive routes.

**Contract**: `App` no longer imports `NxWelcome`; `app.html` contains only the router outlet; `appRoutes` remains a valid (possibly still-empty at this phase) `Route[]`. Keep `app.spec.ts` passing (update it if it asserts on the welcome content).

#### 2. Initialize Spartan + Tailwind v4

**Files**: workspace dependencies, `apps/web` Tailwind/global stylesheet wiring (Spartan controls exact paths), `components.json` (created on first component add)

**Intent**: Run Spartan's setup so Tailwind v4 and the Helm theme preset are wired into the web app.

**Contract**: Run `npx nx g @spartan-ng/cli:info --json` first (read-only) to capture `workspaceType`, `componentsPath`, `tailwindCssFile`, and versions; then `npx nx g @spartan-ng/cli:init`. After init, the global stylesheet imports the Spartan/Tailwind preset and Tailwind utilities resolve in templates. Record the resolved `componentsPath` (where Helm files land) for later phases.

> **Dependency note**: `package.json` currently has neither `@angular/cdk` nor `tailwindcss`. `:init` (and `:ui` in Phase 3) is expected to add both (`@angular/cdk` underpins Brain). Confirm they land in `package.json` after init. If the fallback path (Tailwind v4 + Angular CDK headless without Helm) is taken, add `@angular/cdk` and `tailwindcss` manually.

### Success Criteria:

#### Automated Verification:

- Type checking passes: `npx nx run web:build --configuration=development` (or `npx tsc -p apps/web/tsconfig.app.json --noEmit`)
- Lint passes: `npx nx lint web`
- Unit tests pass: `npx nx test web`
- Production SSR build succeeds: `npx nx build web`
- No reference to `nx-welcome` remains: `grep -ri "nx-welcome\|NxWelcome" apps/web/src` returns nothing
- `npx nx g @spartan-ng/cli:info --json` resolves without version errors

#### Manual Verification:

- `npx nx serve web` starts and `/` renders an empty (un-styled) page with no console errors and no boilerplate
- A throwaway Tailwind utility class (e.g. `text-primary`) applied to a test element renders, confirming the preset is wired
- Page still hydrates under SSR (no hydration mismatch warnings in the browser console)

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Design token system & visual theme

### Overview

Define the semantic, runtime-overridable design-token system and set the clean-modern-minimal visual direction, including the self-hosted base font. Document the S-04 override contract and the WCAG-AA contrast pairing contract.

### Changes Required:

#### 1. Token definitions (CSS custom properties)

**File**: the Spartan/Tailwind global stylesheet resolved in Phase 1 (`tailwindCssFile`) and/or a dedicated `apps/web/src/styles/tokens.css` imported by it

**Intent**: Establish the full token set as CSS custom properties, extending Spartan's shadcn-style variables rather than duplicating them.

**Contract**: Define/confirm token groups as CSS variables on a single theme scope:
- **Color** — semantic foreground/background *pairs* (`--background`/`--foreground`, `--primary`/`--primary-foreground`, `--muted`/`--muted-foreground`, `--card`, `--border`, `--ring`, plus a single accent) tuned to the clean-minimal palette (neutral base + one accent).
- **Typography** — font-family variables (base + heading) bound to the self-hosted font, plus a type scale (sizes, line-heights, weights).
- **Spacing** — confirm/name the spacing scale aligned with Tailwind's.
- **Radius** — `--radius` scale (Spartan consumes this).
- **Shadow/elevation** — an elevation scale (e.g. sm/md/lg) for cards, popovers, dialogs.
- **Breakpoints** — a named, documented breakpoint scale aligned with Tailwind defaults (used by the NFR mobile/desktop guarantee).

Use the Spartan `ui-theme` generator (`npx nx g @spartan-ng/cli:ui-theme`) as the starting point for color variables where helpful, then tune values. Light theme only; keep variables on a theme scope so a dark scope can be added later without refactor.

#### 2. Self-hosted base font

**Files**: font asset files under `apps/web/public` (served as static assets per [apps/web/project.json](apps/web/project.json) assets glob), `@font-face` declarations in the global stylesheet, optional `<link rel="preload">` in [apps/web/src/index.html](apps/web/src/index.html)

**Intent**: Self-host one base font family (with the weights the type scale needs) so SSR has no font flash and no third-party request.

**Contract**: `@font-face` rules with `font-display: swap`; the font files live in `public/` and load from a same-origin path; `--font-sans` (and `--font-heading` if distinct) reference the family. Document this as the base of the future S-04 curated font allow-list. Keep total font payload modest.

#### 3. Token & contract documentation (stub)

**File**: `docs/reference/design-tokens.md` (new) — fleshed out in Phase 4; create the skeleton here

**Intent**: Record the token catalog, the **runtime override scope** S-04 will target, and the **WCAG-AA fg/bg pairing** requirement so contrast can be enforced in S-04.

**Contract**: A markdown reference listing each token group, the semantic color pairs, and a named "per-event override scope" contract. This is the load-bearing handoff to S-04.

### Success Criteria:

#### Automated Verification:

- Production SSR build succeeds: `npx nx build web`
- Lint passes: `npx nx lint web`
- No component stylesheet exceeds the 4kb budget (build emits no `anyComponentStyle` budget warning)
- Font assets are emitted into the build output: `find dist/apps/web/browser -iname '*.woff2'` lists the font files (production hashing places them under `browser/media/`)

#### Manual Verification:

- Setting a color token value at `:root` in devtools visibly recolors a test element (confirms runtime override works) — the proof S-04 depends on
- The self-hosted font renders with no visible FOUC on a hard reload (throttled network)
- Type scale, spacing, radius, and shadow values read coherently as "clean modern minimal" on a sample element
- `docs/reference/design-tokens.md` accurately describes the shipped tokens and names the S-04 override scope

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Base components & showcase route

### Overview

Add a small set of Spartan base components and build a temporary `/_foundation` showcase that renders the tokens and components for visual QA — making the otherwise-invisible foundation verifiable by eye.

### Changes Required:

#### 1. Add base Spartan components

**Files**: Helm component files copied into the resolved `componentsPath`; Brain deps added to `package.json`; `components.json`

**Intent**: Install the handful of components the app shell, landing page, and future slices will need first.

**Contract**: Add via `npx nx g @spartan-ng/cli:ui --name=<component>` for: **button**, **card**, **input** (+ **label**/**field** for form structure), and **typography** (and **separator**/**badge** if useful for the showcase). Do not re-add anything `info` reports as installed. Compose using the exported `*Imports` consts and semantic color classes (`bg-primary text-primary-foreground`), per Spartan styling rules — no raw color values.

#### 2. Temporary foundation showcase route

**Files**: a new standalone component (e.g. `apps/web/src/app/foundation-showcase/`), a route entry in [apps/web/src/app/app.routes.ts](apps/web/src/app/app.routes.ts)

**Intent**: Render tokens (color swatches showing fg/bg pairs, type scale, spacing, radius, shadow) and each installed component in its variants, on one lazily-loaded page.

**Contract**: Route `/_foundation` lazy-loads the showcase standalone component. Clearly marked temporary (comment + the underscore-prefixed path). Renders server-side without errors. No product navigation links to it.

### Success Criteria:

#### Automated Verification:

- Production SSR build succeeds: `npx nx build web`
- Lint passes: `npx nx lint web`
- Unit tests pass: `npx nx test web` (type-checking is covered by the production build above)
- Spartan healthcheck reports no issues: `npx nx g @spartan-ng/cli:healthcheck`

#### Manual Verification:

- `/_foundation` renders all token groups and components with correct clean-minimal styling on desktop and mobile widths
- Component variants (e.g. button variant/size) render correctly and are keyboard-focusable with a visible focus ring
- Overriding a token in devtools updates both the swatches and the live components consistently
- Showcase renders correctly under SSR (view-source shows server-rendered markup, no hydration warnings)

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 4: App shell, landing page & foundation docs

### Overview

Build the minimal app shell (header + footer + root layout), the marketing landing page at `/`, and finalize the foundation documentation. This is the scope explicitly pulled in beyond the roadmap's "no product screens".

### Changes Required:

#### 1. App shell (header + footer + layout)

**Files**: header/footer standalone components (e.g. `apps/web/src/app/shell/`), [apps/web/src/app/app.html](apps/web/src/app/app.html), [apps/web/src/app/app.ts](apps/web/src/app/app.ts)

**Intent**: A static, reusable chrome: header with brand (logo/wordmark linking to `/`) and a single "Log in" link; a simple footer (brand + copyright). No auth-conditional rendering.

**Contract**: `app.html` becomes `header → <main><router-outlet></main> → footer`. The "Log in" link points to a placeholder route (e.g. `/login`) that S-01 will own; until then it routes to a stub or is a clearly-marked placeholder. Header/footer use tokens + Spartan components; responsive per the breakpoint tokens.

#### 2. Marketing landing page at `/`

**Files**: a new standalone landing component (e.g. `apps/web/src/app/home/`), route entry in [apps/web/src/app/app.routes.ts](apps/web/src/app/app.routes.ts)

**Intent**: A polished, token-styled landing: hero (headline conveying "Shopify for events" / create a credible event page fast), a short value-prop section, and a primary CTA pointing to the login placeholder.

**Contract**: Route `/` lazy-loads (or directly renders) the landing component inside the shell. Static first-draft copy. Readable and well-composed on mobile and desktop. Uses only semantic tokens/components — no raw colors. SSR-rendered.

#### 3. Foundation documentation

**Files**: `docs/reference/design-tokens.md` (finalize from Phase 2 stub), `docs/reference/contract-surfaces.md` (new — the load-bearing names registry referenced by AGENTS.md/CLAUDE.md)

**Intent**: Document the token system, the S-04 runtime-override scope contract, the WCAG-AA pairing contract, and register the foundation's load-bearing names (token names, override scope, shell selectors) so future slices reuse rather than reinvent.

**Contract**: `design-tokens.md` is the complete token reference + S-04 contract; `contract-surfaces.md` registers the stable names this foundation introduces. Both accurate to the shipped code.

### Success Criteria:

#### Automated Verification:

- Production SSR build succeeds: `npx nx build web`
- Lint passes: `npx nx lint web`
- Unit tests pass: `npx nx test web`
- Spartan healthcheck reports no issues: `npx nx g @spartan-ng/cli:healthcheck`
- `docs/reference/design-tokens.md` and `docs/reference/contract-surfaces.md` exist

#### Manual Verification:

- `/` renders the full landing inside header/footer, polished and readable on mobile + desktop
- The brand link returns to `/`; the "Log in" CTA/link navigates to the placeholder without errors
- No hydration warnings; landing is server-rendered (view-source)
- The temporary `/_foundation` route is still present (for QA) and documented as removable in S-01
- Documentation matches the shipped tokens, override scope, and shell contracts

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful. This is the final phase.

---

## Testing Strategy

### Unit Tests:

- Keep `app.spec.ts` passing after boilerplate removal (update assertions that referenced the welcome component).
- Smoke-render tests for the landing and showcase standalone components (component creates without error) — Vitest via `npx nx test web`.

### Integration Tests:

- SSR render check: `npx nx build web` then `npm run start:web`, load `/` and `/_foundation`, confirm server-rendered HTML and clean hydration. (Manual, but scriptable later.)

### Manual Testing Steps:

1. `npx nx serve web`; visit `/` — confirm landing renders inside shell, polished, no console errors.
2. Resize to mobile width — confirm landing, header, footer remain readable (NFR).
3. Visit `/_foundation` — confirm all token groups and components render with clean-minimal styling and visible focus rings.
4. In devtools, change a color token at `:root` — confirm components and swatches recolor live (S-04 override proof).
5. Hard-reload with network throttling — confirm no font FOUC and no hydration mismatch warnings.
6. Click brand (→ `/`) and "Log in" (→ placeholder) — confirm navigation.

## Performance Considerations

- Self-hosted fonts with `font-display: swap` + preload avoid SSR CLS/FOUC; keep weights minimal.
- Lazy-load the showcase (and landing if beneficial) to keep the initial bundle within the 500kb warn / 1mb error initial budget.
- Per-component SCSS must stay under the 4kb component-style budget — rely on tokens/utilities.

## Migration Notes

- The "Log in" link and `/login` placeholder are handed to S-01, which replaces them with the real auth flow and may make the header auth-conditional.
- The `/_foundation` showcase is a temporary QA artifact; S-01 (or the first slice that touches routing) should remove it once real screens exist. It is documented as removable in `design-tokens.md`.
- The per-event **override scope** and **fg/bg contrast pairing** documented here are the contract S-04 builds its color/font customization and live preview against.

## References

- Roadmap item: `context/foundation/roadmap.md` (F-02)
- PRD: `context/foundation/prd.md` (FR-004, FR-014–FR-016, US-01; NFRs on readability and <500ms preview)
- Tech stack: `context/foundation/tech-stack.md` (Nx Angular + Nest, npm)
- Spartan setup/customization: `.claude/skills/spartan/` (`cli.md`, `customization.md`, `rules/styling.md`)
- Current scaffold: [apps/web/src/app/app.ts](apps/web/src/app/app.ts), [apps/web/project.json](apps/web/project.json)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Boilerplate removal & Spartan/Tailwind init

#### Automated

- [ ] 1.1 Type checking passes (web build dev / tsc noEmit)
- [ ] 1.2 Lint passes: `npx nx lint web`
- [ ] 1.3 Unit tests pass: `npx nx test web`
- [ ] 1.4 Production SSR build succeeds: `npx nx build web`
- [ ] 1.5 No `nx-welcome`/`NxWelcome` references remain in `apps/web/src`
- [ ] 1.6 `@spartan-ng/cli:info --json` resolves without version errors

#### Manual

- [ ] 1.7 `serve web` renders empty page, no console errors, no boilerplate
- [ ] 1.8 Tailwind/preset utility class renders (preset wired)
- [ ] 1.9 Page hydrates under SSR with no mismatch warnings

### Phase 2: Design token system & visual theme

#### Automated

- [ ] 2.1 Production SSR build succeeds: `npx nx build web`
- [ ] 2.2 Lint passes: `npx nx lint web`
- [ ] 2.3 No component stylesheet exceeds the 4kb budget
- [ ] 2.4 Font assets emitted into build output (`find dist/apps/web/browser -iname '*.woff2'`)

#### Manual

- [ ] 2.5 Changing a color token at `:root` recolors a test element (runtime override proof)
- [ ] 2.6 Self-hosted font renders with no FOUC on throttled hard reload
- [ ] 2.7 Type/spacing/radius/shadow read as clean-modern-minimal
- [ ] 2.8 `docs/reference/design-tokens.md` describes tokens + names S-04 override scope

### Phase 3: Base components & showcase route

#### Automated

- [ ] 3.1 Production SSR build succeeds: `npx nx build web`
- [ ] 3.2 Lint passes: `npx nx lint web`
- [ ] 3.3 Unit tests pass: `npx nx test web` (build in 3.1 covers type-checking)
- [ ] 3.4 Spartan healthcheck reports no issues

#### Manual

- [ ] 3.5 `/_foundation` renders all token groups + components, clean-minimal, mobile + desktop
- [ ] 3.6 Component variants render and are keyboard-focusable with visible focus ring
- [ ] 3.7 Token override in devtools updates swatches + live components consistently
- [ ] 3.8 Showcase renders under SSR with no hydration warnings

### Phase 4: App shell, landing page & foundation docs

#### Automated

- [ ] 4.1 Production SSR build succeeds: `npx nx build web`
- [ ] 4.2 Lint passes: `npx nx lint web`
- [ ] 4.3 Unit tests pass: `npx nx test web`
- [ ] 4.4 Spartan healthcheck reports no issues
- [ ] 4.5 `design-tokens.md` and `contract-surfaces.md` exist

#### Manual

- [ ] 4.6 `/` renders full landing inside header/footer, polished, mobile + desktop
- [ ] 4.7 Brand link → `/`; "Log in" → placeholder, no errors
- [ ] 4.8 No hydration warnings; landing server-rendered
- [ ] 4.9 `/_foundation` still present and documented as removable in S-01
- [ ] 4.10 Docs match shipped tokens, override scope, and shell contracts
