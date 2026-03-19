---
description: "Implement one Phase 5 Advanced/P2 feature (practitioner map, health platform sync, hardening)"
name: "VibeHealth Phase 5 Builder"
argument-hint: "Phase 5 feature to implement (e.g., '5.1 Practitioner Map')"
agent: "agent"
---
Implement one **Phase 5 — Advanced & P2** feature from [roadmap.md](../../roadmap.md).

## Phase 5 scope (roadmap §5.1–5.3)
- **5.1** Practitioner Map *(P2)* — interactive map, data from **free/open APIs** (OpenStreetMap + Overpass, government health directories), search/filter, directions, favorites
- **5.2** Health Platform Sync *(P2)* — Google Fit + Samsung Health read/write; **Apple HealthKit out of scope** (PWA-only, no native iOS); conflict resolution, per-type sync toggles
- **5.3** Final Polish & Hardening — WCAG 2.1 AA audit, performance optimization, security audit, GDPR compliance (deletion, consent, privacy dashboard), additional locale packs

## Execution requirements
1. Confirm scope as P2/advanced and define non-functional requirements.
2. Implement adapters/integration layers with clear boundaries — all external APIs behind interfaces.
3. Use **free/open** data sources only (no paid APIs).
4. Add performance and accessibility checks where relevant.
5. Add all new user-facing strings to FR and EN translation files.
6. Add tests and verification steps for integration behavior.
7. Summarize readiness, risks, and remaining tasks.

If map/dashboard UI design is needed, run `/Roadmap Frontend Design` first.
