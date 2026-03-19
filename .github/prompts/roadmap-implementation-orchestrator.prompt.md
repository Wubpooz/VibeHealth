---
description: "Orchestrate implementation of one VibeHealth roadmap scope end-to-end"
name: "VibeHealth Roadmap Orchestrator"
argument-hint: "Phase + feature scope to implement (e.g., 'Phase 1 — 1.4 Hydration Tracking')"
agent: "agent"
---
Use this prompt to implement **one selected scope** from the VibeHealth roadmap with production-quality steps.

References:
- [Roadmap](../../roadmap.md) — phases, features, data model, architecture decisions
- [Project notes](../../README.md)

## Project context (always apply)
- **Stack**: Bun + Hono + Zod + Prisma + PostgreSQL (backend), Angular 21 PWA + Tailwind CSS (frontend)
- **Auth**: BetterAuth — roles: user, caregiver, admin
- **PWA-only** — no native wrappers; Service Worker for offline caching
- **i18n**: FR + EN from day one — every user-facing string goes through ngx-translate
- **Notifications**: web push + device push (FCM) + email — via unified notification service
- **External APIs**: always behind adapter interfaces (free/open providers — OpenFDA, ANSM, OpenStreetMap, etc.)
- **Offline-first**: Medical ID, First Aid guide, and Journal must work without network
- **No monetization** — all features free

## Task
1. Confirm the selected roadmap scope and restate acceptance criteria from `roadmap.md`.
2. Inspect the codebase and identify impacted layers (API routes, Prisma schema, services, frontend modules, tests, infra).
3. Produce a short implementation checklist and execute it incrementally.
4. Ensure every new user-facing string is added to both FR and EN translation files.
5. Add/update tests and validate with lint → typecheck → test → build.
6. Summarize changed files, verification results, and remaining follow-ups.

## Constraints
- Keep changes scoped to the selected roadmap item — do not drift.
- Prefer minimal, testable increments.
- If the selected scope includes UI/UX, run `/Roadmap Frontend Design` first.
- If required environment variables are introduced, add them to `.env` with safe placeholders and document them.
- Validate Zod schemas match Prisma models at the boundary.
