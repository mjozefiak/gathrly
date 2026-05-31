---
project: "Gathrly"
version: 1
status: draft
created: 2026-05-31
updated: 2026-05-31
prd_version: 1
main_goal: market-feedback
top_blocker: none
---

# Roadmap: Gathrly

> Derived from `context/foundation/prd.md` (v1) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Vision recap

Independent tech/community organizers need a fast way to publish a credible event page and collect signups — without designing the page manually or wrestling a full event platform. Gathrly turns minimal event inputs and an uploaded image into a shareable meetup page optimized for signup validation. Speed, taste, and ownership beat feature depth at the MVP stage.

## North star

**S-03: Attendee signs up and organizer sees signups** — the smallest end-to-end flow that proves the core product hypothesis (that organizers can validate real interest through a simple publish-and-signup loop). This is the validation milestone — the point at which the product delivers its primary Success Criterion — placed as early as prerequisites allow because everything else only matters if this works.

## At a glance

| ID   | Change ID                 | Outcome (user can ...)                                                              | Prerequisites | PRD refs                              | Status   |
| ---- | ------------------------- | ----------------------------------------------------------------------------------- | ------------- | ------------------------------------- | -------- |
| F-01 | data-persistence-baseline | (foundation) DB provisioned, ORM configured, migration workflow ready               | —             | Access Control, FR-001–FR-016         | ready    |
| S-01 | organizer-auth            | register via admin invite, log in as organizer; admin can log in and invite          | F-01          | FR-001, FR-009, FR-010, FR-011, US-02 | proposed |
| S-02 | event-publish-flow        | create an event, publish it, and share a polished public page                       | S-01          | FR-002, FR-003, FR-005, US-01         | proposed |
| S-03 | attendee-signup-loop      | sign up on a public page; organizer sees signup count and list                      | S-02          | FR-006, FR-007, FR-008, US-01         | proposed |
| S-04 | event-customization       | select template, customize colors and fonts with live preview; page renders styled  | S-02          | FR-004, FR-014, FR-015, FR-016, US-01 | proposed |
| S-05 | admin-account-management  | view organizer accounts list and deactivate accounts                                | S-01          | FR-012, FR-013, US-03                 | proposed |

## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives in the dependency graph below; this table is the proposed reading order across parallel tracks.

| Stream | Theme              | Chain                                | Note                                                                 |
| ------ | ------------------ | ------------------------------------ | -------------------------------------------------------------------- |
| A      | Core validation    | `F-01` → `S-01` → `S-02` → `S-03`  | North star path — reaches the signup validation milestone first.     |
| B      | Visual ownership   | `S-04`                               | Joins Stream A at `S-02`. The product differentiator; parallel with S-03. |
| C      | Admin operations   | `S-05`                               | Joins Stream A at `S-01`. Parallel with S-02 onward.                 |

## Baseline

What's already in place in the codebase as of 2026-05-31 (auto-researched + user-confirmed).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** partial — Angular 21 app scaffolded in `apps/web`, routing configured but empty, no components/pages beyond placeholder, no UI libraries
- **Backend / API:** partial — Nest API scaffolded in `apps/api`, default controller with root GET + `/health`, no business logic
- **Data:** absent — no ORM, no schema, no migrations, no DB config
- **Auth:** absent — no auth provider, no guards, no session/token handling
- **Deploy / infra:** partial — GitHub Actions workflow for Railway deploy (api + web services), no Docker, no IaC
- **Observability:** absent — only NestJS built-in Logger, no dedicated logging/error tracking/metrics

## Foundations

### F-01: Data persistence baseline

- **Outcome:** (foundation) PostgreSQL provisioned on Railway, ORM installed and configured, migration workflow operational — no application schemas yet.
- **Change ID:** data-persistence-baseline
- **PRD refs:** Access Control, FR-001–FR-016 (all require persistent storage)
- **Unlocks:** S-01 (user table), S-02 (event table), S-03 (signup table), S-04 (customization data), S-05 (organizer accounts)
- **Prerequisites:** —
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Sequenced first because every vertical slice needs persistence; the ORM choice affects all downstream schemas. Low risk — standard setup on an already-configured Railway target.
- **Status:** ready

## Slices

### S-01: Organizer registers and logs in

- **Outcome:** organizer can register via admin invite (admin sends invite email, organizer sets password via invite link) and log in; admin can log in to the admin panel; authenticated routes are protected by guards
- **Change ID:** organizer-auth
- **PRD refs:** FR-001, FR-009, FR-010, FR-011, US-02
- **Prerequisites:** F-01
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Sequenced right after F-01 because every organizer-facing slice needs auth. Auth provider choice (managed vs local) and email-sending mechanism for invites are `/10x-plan` decisions, not roadmap ones.
- **Status:** proposed

### S-02: Organizer creates, publishes event with polished public page

- **Outcome:** organizer can create an event (title, description, image, date, location/link, attendee limit), publish it, and receive a public link; the public page uses a polished default template readable on mobile and desktop
- **Change ID:** event-publish-flow
- **PRD refs:** FR-002, FR-003, FR-005, US-01
- **Prerequisites:** S-01
- **Parallel with:** S-05
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Image upload and default template polish carry the most implementation uncertainty. The public page needs to render well on mobile and desktop — this is where the frontend investment begins. Customization (template selection, colors, fonts) is deferred to S-04 to reach the north star faster.
- **Status:** proposed

### S-03: Attendee signs up and organizer views signups

- **Outcome:** attendee can sign up on a public event page with name and email (with explicit consent that the organizer will receive their details); organizer can view signup count and the signup list for their own events
- **Change ID:** attendee-signup-loop
- **PRD refs:** FR-006, FR-007, FR-008, US-01
- **Prerequisites:** S-02
- **Parallel with:** S-04
- **Blockers:** —
- **Unknowns:** —
- **Risk:** This is the north star — the point at which the product delivers its primary Success Criterion. Consent UX (FR-006) and data-privacy scoping (NFR: "attendee data visible only to the owning organizer") need careful implementation. Sequenced last on the critical path because it requires a published event page to sign up on.
- **Status:** proposed

### S-04: Event page customization

- **Outcome:** organizer can select a template (1–2 available), customize primary colors and font for their event page with real-time preview; public event page renders using the organizer's chosen template, colors, and fonts
- **Change ID:** event-customization
- **PRD refs:** FR-004, FR-014, FR-015, FR-016, US-01
- **Prerequisites:** S-02
- **Parallel with:** S-03
- **Blockers:** —
- **Unknowns:** —
- **Risk:** The "Shopify for events" differentiator — without customization the product is a generic event page creator. Real-time preview (NFR: updates within 500ms) and ensuring pages remain readable across arbitrary color/font combinations on mobile and desktop require the deepest frontend investment. Parallel with S-03 because customization and signups are independent concerns on the same published page.
- **Status:** proposed

### S-05: Admin manages organizer accounts

- **Outcome:** admin can view a list of all organizer accounts with status (active/inactive) and deactivate an organizer account; deactivated organizers cannot log in
- **Change ID:** admin-account-management
- **PRD refs:** FR-012, FR-013, US-03
- **Prerequisites:** S-01
- **Parallel with:** S-02, S-03, S-04
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Low-risk CRUD screens on existing auth data. Does not block the north star path. Sequenced after S-01 (needs auth + organizer accounts to exist) but parallel with everything else.
- **Status:** proposed

## Backlog Handoff

| Roadmap ID | Change ID                 | Suggested issue title                                        | Ready for `/10x-plan` | Notes                                      |
| ---------- | ------------------------- | ------------------------------------------------------------ | --------------------- | ------------------------------------------ |
| F-01       | data-persistence-baseline | Set up PostgreSQL + ORM + migrations on Railway              | yes                   | Run `/10x-plan data-persistence-baseline`  |
| S-01       | organizer-auth            | Organizer registration (invite flow) and login               | no                    | Depends on F-01                            |
| S-02       | event-publish-flow        | Event creation, publishing, and polished public page         | no                    | Depends on S-01                            |
| S-03       | attendee-signup-loop      | Attendee signup form + organizer signup list                 | no                    | Depends on S-02; north star                |
| S-04       | event-customization       | Template selection + color/font customization with preview   | no                    | Depends on S-02; parallel with S-03        |
| S-05       | admin-account-management  | Admin organizer list + account deactivation                  | no                    | Depends on S-01; parallel with S-02+       |

## Open Roadmap Questions

None. The PRD has zero open questions and the framing interview surfaced no cross-cutting unknowns.

## Parked

- **Paid tickets / payment handling** — Why parked: PRD §Non-Goals; MVP validates interest, not revenue.
- **Marketplace / event discovery / social features** — Why parked: PRD §Non-Goals; distribution via organizer-shared links.
- **Mobile app** — Why parked: PRD §Non-Goals; web app first.
- **Chat / networking / CRM / email automation** — Why parked: PRD §Non-Goals; attendee collection stays simple.
- **Full layout customization / drag & drop blocks** — Why parked: PRD §Non-Goals; customization limited to template, colors, fonts.
- **Large-conference tooling / check-in / team roles** — Why parked: PRD §Non-Goals; small meetups first.
- **Image-derived color styling** — Why parked: PRD §Non-Goals; colors chosen explicitly by organizer.
- **Visit tracking / conversion metrics** — Why parked: PRD §Non-Goals; signup count is the validation signal.
- **Attendee accounts / profiles** — Why parked: PRD §Non-Goals; attendees sign up without logging in.
- **Complex external integrations** — Why parked: PRD §Non-Goals; core flow stays self-contained.
- **Multi-admin roles** — Why parked: PRD §Non-Goals; single super-admin only.
- **Organizer self-registration** — Why parked: PRD §Non-Goals; organizers onboarded exclusively via admin invite.

## Done

(Empty on first generation. `/10x-archive` appends entries here when a change is archived.)
