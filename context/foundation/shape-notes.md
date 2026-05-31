---
project: "Gathrly"
context_type: greenfield
created: 2026-05-18
updated: 2026-05-18
product_type: web-app
target_scale:
  users: medium
  qps: low
  data_volume: small
timeline_budget:
  mvp_weeks: 3
  hard_deadline: null
  after_hours_only: true
checkpoint:
  current_phase: 8
  phases_completed: [1, 2, 3, 4, 5, 6, 7]
  gray_areas_resolved:
    - topic: "context type"
      decision: "greenfield"
    - topic: "pain category"
      decision: "workflow friction plus weak ownership"
    - topic: "primary persona scope"
      decision: "independent tech/community organizers and small startup/community teams running local meetups"
    - topic: "auth strategy"
      decision: "organizer login"
    - topic: "role model"
      decision: "role-separated organizer and attendee model; attendees use public signup pages without accounts"
    - topic: "MVP flow"
      decision: "organizer publishes an event page with a polished default template, shares a public link, collects name/email signups, and sees signup count plus signup list"
    - topic: "MVP timeline"
      decision: "3 weeks after-hours"
    - topic: "business logic"
      decision: "minimal event inputs and an event image become a credible public meetup page optimized for fast signup validation"
    - topic: "product type"
      decision: "web app"
    - topic: "target scale"
      decision: "dozens of users at launch"
    - topic: "deadline"
      decision: "no hard deadline; after-hours work"
  frs_drafted: 8
  quality_check_status: accepted
---

## Vision & Problem Statement

Independent tech/community organizers and small startup/community teams running local meetups need a simple way to quickly create an attractive event page and collect signups without clunky setup, generic appearance, or unnecessary forms.

Small and early-stage event organizers do not need a full event platform first. They need a fast way to make an event look real, credible, and ownable, then validate whether people actually care. Speed, taste, and ownership beat feature depth at the MVP stage.

At 100x scale, the product would likely need stronger and more customizable templates plus social discovery features, but those are not part of the MVP.

## User & Persona

Primary persona: independent tech/community organizers and small startup/community teams running local meetups.

They reach for Gathrly when they have a meetup idea and want to publish a shareable page quickly to test whether people will sign up.

## Access Control

Organizers log in to create events, manage event pages, view signup count, and view signup lists.

Attendees do not need accounts in the MVP. They access public event pages through a shareable link and submit the signup form without logging in.

## Success Criteria

### Primary

- Organizer can publish a credible event page, share the public link, collect attendee signups, and see signup count plus the signup list.

### Secondary

- Organizer can create and publish an event in under 5 minutes.

### Guardrails

- Attendee signup stays under 30 seconds.
- MVP does not include payments, an event marketplace, mobile apps, chat or networking, advanced CRM, email automation, full layout customization, large-conference handling, on-site check-in, or team roles.

## MVP Flow

1. Organizer logs in.
2. Organizer clicks "Create event".
3. Organizer enters the minimum event details: title, short description, event image, date, location or online link, and attendee limit.
4. Organizer publishes the event and receives a public link.
5. The public event page uses the uploaded image inside a polished default template with readable, safe default styling.
6. Attendee opens the public link.
7. Attendee signs up with name and email.
8. Organizer returns to the panel and sees signup count plus the signup list.

## User Stories

### US-01: Organizer publishes a meetup page and collects signups

- **Given** a logged-in organizer with a meetup idea
- **When** they create an event, enter the minimum event details, add an image, publish the event, and share the public link
- **Then** attendees can open the page, sign up with name and email, and the organizer can see signup count plus the signup list

#### Acceptance Criteria

- Organizer can publish an event page from the minimum event fields.
- Published event pages have a public link.
- Event page uses the uploaded image inside a polished default template with readable, safe default styling.
- Attendees can sign up without creating an account.
- Organizer can see signup count and signup list after publication.

## Functional Requirements

- FR-001: Organizer can log in. Priority: must-have
  > Socrates: Counter-argument considered: admin access without login creates too much risk because attendee lists contain emails. Resolution: kept; organizer login is necessary for protecting attendee data.
- FR-002: Organizer can create an event with title, short description, image, date, location or online link, and attendee limit. Priority: must-have
  > Socrates: Counter-argument considered: attendee limit is not needed for early validation. Resolution: kept; the limit is a lightweight capacity signal for meetups, not a full ticketing or conference-management feature.
- FR-003: Organizer can publish an event and receive a public link. Priority: must-have
  > Socrates: Counter-argument considered: no counter-argument; it stands as written. Resolution: kept; public publishing and a shareable link are core to validating demand.
- FR-004: Public event page uses the uploaded event image inside a polished default template with readable, safe default styling. Priority: must-have
  > Socrates: Counter-arguments considered: automatic image-derived styling is visual polish rather than validation, can harm readability, and creates hidden implementation risk. Resolution: revised; image-derived color styling is moved out of MVP and the MVP keeps a polished default template that uses the event image safely.
- FR-005: Attendee can open a public event page. Priority: must-have
  > Socrates: Counter-argument considered: no counter-argument; it stands as written. Resolution: kept; the public event page is required for sharing and demand validation.
- FR-006: Attendee can sign up with name and email, with clear consent that the organizer will receive their signup details. Priority: must-have
  > Socrates: Counter-arguments considered: signup without confirmation can create fake demand, and collecting personal data raises trust and privacy work. Resolution: revised; MVP keeps name and email signup with explicit consent, while email confirmation remains outside MVP unless later required.
- FR-007: Organizer can view the number of signups for an event. Priority: must-have
  > Socrates: Counter-arguments considered: signup count is enough for validation, visit tracking creates privacy and accuracy complexity, and analytics can distract from the core publish-and-signup promise. Resolution: revised; MVP tracks signup count, while visit count and conversion metrics move out of MVP.
- FR-008: Organizer can view the signup list for their own event, including attendee names and emails. Priority: must-have
  > Socrates: Counter-argument considered: showing personal data increases privacy risk because in-app attendee lists expose names and emails. Resolution: revised; signup lists are scoped to the organizer's own event, and privacy constraints will be captured as a product quality requirement.

## Business Logic

Gathrly turns minimal event inputs and an event image into a credible public meetup page optimized for fast signup validation, without requiring the organizer to design the page manually.

The rule consumes the event details an organizer provides: title, short description, event image, date, location or online link, and attendee limit.

The output is a public meetup page that looks credible enough to share and a signup path that lets the organizer validate whether people care.

The organizer encounters the rule when publishing the event: they provide only the minimum inputs, and Gathrly produces the shareable page rather than asking them to design it from scratch.

## Non-Functional Requirements

- Organizer can create and publish an event in under 5 minutes.
- Attendee can complete signup in under 30 seconds.
- Attendee names and emails are visible only to the organizer who owns the event.
- Public event pages remain readable on mobile and desktop.
- Published event links remain accessible after publication unless the organizer removes the event.

## Non-Goals

- No paid tickets or payment handling in MVP; the first version validates interest, not revenue collection.
- No marketplace, event discovery, or social features in MVP; distribution happens through organizer-shared public links.
- No mobile app in MVP; Gathrly starts as a web app.
- No chat, networking, advanced CRM, or email automation in MVP; attendee collection stays simple.
- No full layout customization or advanced templates in MVP; event pages use a polished default template.
- No large-conference tooling, on-site check-in, or team roles in MVP; the product serves small meetups first.
- No image-derived automatic color styling in MVP; the event image is used inside safe default styling instead.
- No visit tracking or conversion metrics in MVP; signup count is the validation signal.
- No attendee accounts or profiles in MVP; attendees sign up from public event pages without logging in.
- No complex integrations with external tools in MVP; the core flow stays self-contained.

## Quality cross-check

- Access Control: present.
- Business Logic: present.
- Project artifacts: present.
- Timeline-cost acknowledgment: present; MVP is scoped to 3 weeks after-hours.
- Non-Goals: present.
- Preserved behavior: n/a for greenfield.
