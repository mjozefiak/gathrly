---
change_id: frontend-ui-foundation
title: Frontend UI foundation — remove boilerplate, install Spartan UI + Tailwind, establish design tokens
status: plan_reviewed
created: 2026-06-07
updated: 2026-06-07
archived_at: null
---

## Notes

Roadmap item F-02 (Stream A — Core validation foundation). Source: `context/foundation/roadmap.md`.

Outcome: Angular scaffold boilerplate removed, UI component library (Spartan UI + Tailwind v4) installed and configured, base design tokens (color, typography, spacing, radius, shadow, breakpoints) established as runtime-overridable CSS custom properties, plus a clean-modern-minimal visual direction.

Scope expanded during planning (beyond roadmap's "no product screens"): includes a real marketing landing page at `/` and a nav/header + footer shell. Still excludes auth screens, event forms/pages, customization UI, and API wiring.

Key constraint: design tokens must be runtime-overridable (CSS custom properties) because S-04 (event-customization) overrides per-event colors/fonts with <500ms live preview, and public pages must stay readable on mobile/desktop (WCAG-AA) regardless of customization.
