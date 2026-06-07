---
change_id: data-persistence-baseline
title: Data persistence baseline — provision PostgreSQL, configure ORM, ready migration workflow
status: implementing
created: 2026-06-07
updated: 2026-06-07
archived_at: null
---

## Notes

Roadmap item F-01 (Stream A — Core validation foundation). Source: `context/foundation/roadmap.md`.

Outcome: PostgreSQL provisioned on Railway, ORM installed and configured, migration workflow operational — **no application schemas yet**. Unlocks S-01 (user table) through S-05.

ORM choice is a `/10x-plan` decision and affects all downstream schemas. Standard setup on the already-configured Railway target.
