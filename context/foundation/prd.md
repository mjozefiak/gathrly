---
project: "Gathrly"
version: 1
status: draft
created: 2026-05-18
context_type: greenfield
product_type: web-app
target_scale:
  users: medium
  qps: low
  data_volume: small
timeline_budget:
  mvp_weeks: 6
  hard_deadline: null
  after_hours_only: true
---

## Vision & Problem Statement

Independent tech/community organizers and small startup/community teams running local meetups need a simple way to quickly create an attractive, personalized event page and collect signups without clunky setup, generic appearance, or unnecessary forms.

Small and early-stage event organizers do not need a full event platform first. They need a fast way to make an event look real, credible, and ownable, then validate whether people actually care. Speed, taste, and ownership beat feature depth at the MVP stage. Gathrly is "Shopify for events" — it gives organizers real control over how their event page looks without requiring design skills. The differentiator is not just speed of creation but visual ownership: the page feels like theirs, not like a generic template everyone uses.

## User & Persona

Primary persona: independent tech/community organizers and small startup/community teams running local meetups.

They reach for Gathrly when they have a meetup idea and want to publish a shareable, visually distinct page quickly to test whether people will sign up.

## Success Criteria

### Primary

- Organizer can publish a visually customized event page, share the public link, collect attendee signups, and see signup count plus the signup list.

### Secondary

- Organizer can create and publish an event in under 5 minutes.
- Event pages created by different organizers look visually distinct from each other.

### Guardrails

- Attendee signup stays under 30 seconds.
- MVP does not include payments, an event marketplace, mobile apps, chat or networking, advanced CRM, email automation, full page builder (drag & drop blocks), large-conference handling, on-site check-in, or multi-admin roles.

## User Stories

### US-01: Organizer publishes a customized meetup page and collects signups

- **Given** a logged-in organizer with a meetup idea
- **When** they create an event, enter the minimum event details, select a template, customize colors and fonts, publish the event, and share the public link
- **Then** attendees can open the visually customized page, sign up with name and email, and the organizer can see signup count plus the signup list

#### Acceptance Criteria

- Organizer can publish an event page from the minimum event fields.
- Organizer can select from available templates before publishing.
- Organizer can customize colors and fonts with real-time preview.
- Published event pages have a public link.
- Event page renders with the organizer's chosen template, colors, and fonts.
- Attendees can sign up without creating an account.
- Organizer can see signup count and signup list after publication.

### US-02: Admin onboards a new organizer

- **Given** a logged-in admin
- **When** they send an invite to a new organizer's email address
- **Then** the organizer receives an invite email, sets their password, and can log in to create events

#### Acceptance Criteria

- Admin can send an invite by entering an organizer's email.
- Organizer receives an email with a link to set their password.
- After setting a password, the organizer can log in.
- Admin can see the new organizer in the accounts list.

### US-03: Admin manages organizer accounts

- **Given** a logged-in admin viewing the organizer accounts list
- **When** they deactivate an organizer account
- **Then** that organizer can no longer log in or manage events

#### Acceptance Criteria

- Admin can view a list of all organizer accounts with status (active/inactive).
- Admin can deactivate an organizer account.
- Deactivated organizers cannot log in.

## Functional Requirements

### Authentication & Accounts

- FR-001: Organizer can log in using credentials set via the invite flow. Priority: must-have
  > Socrates: Counter-argument considered: admin access without login creates too much risk because attendee lists contain emails. Resolution: kept; organizer login is necessary for protecting attendee data.
- FR-009: Admin can log in to the admin panel. Priority: must-have
  > Socrates: Counter-argument considered: no counter-argument; admin access control is required to protect organizer management. Resolution: kept.
- FR-010: Admin can send an invite email to a new organizer. Priority: must-have
  > Socrates: Counter-argument considered: invite flow is overengineering; admin could create accounts with passwords manually. Resolution: kept; invite flow is better UX — organizer sets their own password, more secure and more comfortable.
- FR-011: Organizer can set their password via the invite link. Priority: must-have
  > Socrates: Counter-argument considered: part of invite flow — see FR-010. Resolution: kept as separate FR for clarity of implementation scope.

### Admin Panel

- FR-012: Admin can view the list of organizer accounts (active/inactive). Priority: must-have
  > Socrates: Counter-argument considered: with 5 organizers this is overkill. Resolution: kept; admin panel is low-cost (2 CRUD screens) and provides operational comfort without touching the database manually.
- FR-013: Admin can deactivate an organizer account. Priority: must-have
  > Socrates: Counter-argument considered: at small scale, deletion via DB is fine. Resolution: kept; deactivation is a safety mechanism — better than irreversible deletion, and trivial to implement alongside FR-012.

### Event Creation

- FR-002: Organizer can create an event with title, short description, image, date, location or online link, and attendee limit. Priority: must-have
  > Socrates: Counter-argument considered: attendee limit is not needed for early validation. Resolution: kept; the limit is a lightweight capacity signal for meetups, not a full ticketing or conference-management feature.
- FR-003: Organizer can publish an event and receive a public link. Priority: must-have
  > Socrates: Counter-argument considered: no counter-argument; it stands as written. Resolution: kept; public publishing and a shareable link are core to validating demand.

### Customization

- FR-014: Organizer can select a template for their event page (1-2 templates available in MVP). Priority: must-have
  > Socrates: Counter-argument considered: on day 1 just choosing a template without color/font editing might suffice. Resolution: kept but separated from color/font editing; template selection alone gives structural variety, customization gives visual ownership.
- FR-015: Organizer can customize the primary colors of their event page. Priority: must-have
  > Socrates: Counter-argument considered: template color variants (3-4 presets per template) could replace free color picking. Resolution: kept; editable colors are the heart of "Shopify for events" — without them it's just a skin chooser, not customization.
- FR-016: Organizer can customize the font of their event page. Priority: must-have
  > Socrates: Counter-argument considered: same as FR-015. Resolution: kept; fonts alongside colors give enough visual differentiation to make each page feel unique.
- FR-004: Public event page renders using the organizer's chosen template, colors, and fonts. Priority: must-have
  > Socrates: Counter-argument considered: original version used only a polished default template. Resolution: revised; now renders with organizer's customization choices. Real-time preview in the editor replaces a separate preview step (FR-017 absorbed).

### Public Event Page & Signups

- FR-005: Attendee can open a public event page. Priority: must-have
  > Socrates: Counter-argument considered: no counter-argument; it stands as written. Resolution: kept; the public event page is required for sharing and demand validation.
- FR-006: Attendee can sign up with name and email, with clear consent that the organizer will receive their signup details. Priority: must-have
  > Socrates: Counter-arguments considered: signup without confirmation can create fake demand, and collecting personal data raises trust and privacy work. Resolution: revised; MVP keeps name and email signup with explicit consent, while email confirmation remains outside MVP unless later required.
- FR-007: Organizer can view the number of signups for an event. Priority: must-have
  > Socrates: Counter-arguments considered: signup count is enough for validation, visit tracking creates privacy and accuracy complexity, and analytics can distract from the core publish-and-signup promise. Resolution: revised; MVP tracks signup count, while visit count and conversion metrics move out of MVP.
- FR-008: Organizer can view the signup list for their own event, including attendee names and emails. Priority: must-have
  > Socrates: Counter-argument considered: showing personal data increases privacy risk because in-app attendee lists expose names and emails. Resolution: revised; signup lists are scoped to the organizer's own event, and privacy constraints will be captured as a product quality requirement.

## Non-Functional Requirements

- Organizer can create and publish an event in under 5 minutes.
- Attendee can complete signup in under 30 seconds.
- Attendee names and emails are visible only to the organizer who owns the event.
- Public event pages remain readable on mobile and desktop regardless of color/font customization.
- Published event links remain accessible after publication unless the organizer removes the event.
- Real-time preview updates within 500 ms of a customization change.
- Admin panel is accessible only to the super-admin account.

## Business Logic

Gathrly turns a template choice plus color and font customization into a unique event page without requiring design skills, enabling organizers to validate demand with a page that feels like theirs rather than a generic listing.

The rule consumes the event details an organizer provides (title, short description, event image, date, location or online link, attendee limit) plus their style choices (template, colors, font).

The output is a public event page that looks visually distinct, credible enough to share, and a signup path that lets the organizer validate whether people care.

The organizer encounters the rule in the creation flow: they provide minimal inputs, choose a template, adjust colors and fonts with real-time preview, and Gathrly produces the shareable page. No design skills required — the templates constrain layout decisions while customization gives visual ownership.

## Access Control

Three roles in the MVP:

- **Admin (super-admin)**: Single admin (the founder). Logs into the admin panel. Can send invites to new organizers, view the list of organizer accounts, and deactivate accounts.
- **Organizer**: Receives an invite email, sets their own password, logs in. Creates events, customizes event pages, manages signups.
- **Attendee**: No account needed. Accesses public event pages through a shareable link and submits the signup form without logging in.

## Non-Goals

- No paid tickets or payment handling in MVP; the first version validates interest, not revenue collection.
- No marketplace, event discovery, or social features in MVP; distribution happens through organizer-shared public links.
- No mobile app in MVP; Gathrly starts as a web app.
- No chat, networking, advanced CRM, or email automation in MVP; attendee collection stays simple.
- No full page builder (drag & drop blocks) in MVP; customization is limited to template selection, colors, and fonts.
- No large-conference tooling, on-site check-in, or team roles in MVP; the product serves small meetups first.
- No image-derived automatic color styling in MVP; colors are chosen explicitly by the organizer.
- No visit tracking or conversion metrics in MVP; signup count is the validation signal.
- No attendee accounts or profiles in MVP; attendees sign up from public event pages without logging in.
- No complex integrations with external tools in MVP; the core flow stays self-contained.
- No multi-admin roles in MVP; single super-admin only.
- No organizer self-registration in MVP; organizers are onboarded exclusively via admin invite.

## Open Questions

No open questions.
