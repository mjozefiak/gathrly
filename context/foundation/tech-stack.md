---
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
---

## Why this stack

Nx Monorepo (Angular + Nest) remains the selected custom path because Gathrly needs a typed full-stack web app: organizer login, event publishing, attendee signup handling, organizer-only attendee data, and image upload/storage all imply backend business logic behind the Angular UI. The starter creates one TypeScript Nx workspace with an Angular web app, Nest API app, shared conventions, generated project structure, and a single task graph. It is marked best-effort because the scaffold is multi-step: Angular uses Nx's current Vitest-on-esbuild path, while the Nest API receives Vitest configuration without generated controller/service specs. Deployment defaults to self-host for the first bootstrap pass, with GitHub Actions and auto-deploy on merge.
