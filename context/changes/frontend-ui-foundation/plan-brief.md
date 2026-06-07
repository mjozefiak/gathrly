# Frontend UI Foundation — Plan Brief

> Full plan: `context/changes/frontend-ui-foundation/plan.md`

## What & Why

Roadmap item **F-02**: turn the bare Nx/Angular scaffold into a real visual foundation — remove boilerplate, install **Spartan UI on Tailwind v4**, and establish a **CSS-custom-property design-token system** in a clean-modern-minimal style. This is the cross-cutting layer every screen consumes; getting the token architecture right now (so it's runtime-overridable) is what lets **S-04** customize per-event colors/fonts later without a costly re-theme — the product's "Shopify for events" differentiator.

## Starting Point

`apps/web` is the untouched Nx scaffold: `NxWelcome` boilerplate, empty routes, empty styles, no UI library — but SSR + hydration is already wired (`provideClientHydration`). Angular 21.2, Nx 22.7.2, npm, SCSS, component prefix `app`.

## Desired End State

`npx nx serve web` shows a polished, token-styled marketing landing at `/` inside a header (brand + "Log in" placeholder) and footer shell; a temporary `/_foundation` route renders all tokens + base components for visual QA; every pixel is driven by semantic CSS-variable tokens that can be overridden at runtime; SSR build, lint, type-check, and tests pass.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| UI library | Spartan UI (Brain + Helm) + Tailwind | Copy-in components we own + CSS-variable theming fit the visual-ownership product and runtime override | Plan |
| Styling layer | Tailwind CSS v4 + tokens | Fast to compose custom pages; utilities read the token variables | Plan |
| Token delivery | CSS custom properties | Only approach that supports S-04's per-event runtime override + <500ms live preview | Plan |
| Style direction | Clean modern minimal | Reads as credible, stays out of the way so per-event customization stands out | Plan |
| Dark mode | Light-only, dark-ready structure | Not a PRD requirement; structure tokens so dark can be added later without refactor | Plan |
| Fonts | Self-hosted base + curated set | No SSR FOUC/CLS, privacy-friendly; curated list keeps public pages readable | Plan |
| Shell scope | Tokens + base components + minimal shell | Proves the foundation composes; gives S-01 a real starting point | Plan |
| Verification | Temporary `/_foundation` showcase | Makes the invisible foundation visually checkable now | Plan |
| A11y | Document + structure fg/bg pairs, enforce in S-04 | Foundation can't enforce contrast on colors that don't exist yet | Plan |
| Token coverage | + radius, shadow/elevation, breakpoints | Spartan/components consume them; NFR needs shared breakpoints | Plan |
| Landing page | Marketing hero + value prop + login CTA | Credible front door that showcases the design system | Plan (scope expansion) |
| Nav shell | Brand + "Log in" link + simple footer | Reusable chrome with no dependency on auth state | Plan (scope expansion) |

## Scope

**In scope:** boilerplate removal; Spartan + Tailwind v4 init; full token system (color fg/bg pairs, typography + self-hosted font, spacing, radius, shadow, breakpoints); 4–5 base components; `/_foundation` showcase; header + footer shell; marketing landing at `/`; token + contract docs.

**Out of scope:** auth/login screens (S-01), event forms/public page (S-02), customization UI/runtime-override code (S-04), auth-conditional header, API wiring, dark theme delivery, motion tokens, event-page templates.

## Architecture / Approach

Bottom-up so each layer is verifiable before the next: **plumbing → tokens → components + showcase → shell + landing + docs**. Spartan's CLI generators do setup; our authored work is the token system, visual direction, shell/landing markup, and the S-04 contract docs. Tokens are CSS variables on a theme scope; S-04 later overrides them on a per-event scope element.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Boilerplate removal & Spartan/Tailwind init | Clean app, Spartan + Tailwind v4 wired, SSR still green | Spartan ↔ Angular 21 / Nx 22.7 version compatibility |
| 2. Design token system & visual theme | CSS-variable tokens, self-hosted font, S-04 contract docs | Token naming/override scope must anticipate S-04 |
| 3. Base components & showcase route | 4–5 Spartan components + `/_foundation` visual QA page | SSR render safety of components/showcase |
| 4. App shell, landing page & docs | Header/footer, marketing `/`, finalized docs | Scope expansion (landing/nav) beyond roadmap |

**Prerequisites:** none (parallel with F-01 data baseline). Network access for npm + Spartan CLI.
**Estimated effort:** ~3–4 after-hours sessions across 4 phases.

## Open Risks & Assumptions

- **Spartan compatibility with Angular 21 / Nx 22.7 is unverified** — Phase 1 gates on `@spartan-ng/cli:info`/`init` succeeding; fallback is Tailwind v4 + Angular CDK headless without Helm.
- Scope was deliberately expanded beyond the roadmap's "no product screens" to include a landing page + nav shell; landing copy is first-draft and may be refined.
- The "Log in" link/`/login` placeholder and the `/_foundation` route are temporary handoffs to S-01.

## Success Criteria (Summary)

- Boilerplate gone; `/` and `/_foundation` render polished, token-styled, SSR-clean on mobile + desktop.
- Changing a token value at runtime recolors/retypes the UI without recompiling (proves the S-04 override path).
- Build, lint, type-check, tests, and Spartan healthcheck all pass.
