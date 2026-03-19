---
description: "Implement one Phase 2 Medical Intelligence feature (medicines, vaccines/checks, guides, pollen)"
name: "VibeHealth Phase 2 Builder"
argument-hint: "Phase 2 feature to implement (e.g., '2.1 Medicine Tracker')"
agent: "agent"
---
Implement one **Phase 2 — Medical Intelligence** feature from [roadmap.md](../../roadmap.md).

> **Note**: First Aid Guide and Helpline moved to Phase 0 (§0.8). Phase 2 covers §2.1–2.4 only.

## Phase 2 scope (roadmap §2.1–2.4)
- **2.1** Medicine Tracker & Reminders — meds CRUD, reminders (web push + device push + email), side effects from **free/open APIs** (OpenFDA, ANSM), personal notes, interaction warnings, refill reminders
- **2.2** Health Checks & Vaccines — personalized screenings/vaccines by age+sex+conditions, appointment logging
- **2.3** Guides & Articles — condition library, content from **free/open medical databases**, bookmarking, markdown articles
- **2.4** Pollen Tracking — location-based levels from **free open API**, forecasts, allergen-specific alerts, push notifications

## Execution requirements
1. Define data contracts (Zod schemas) and external adapter boundaries — all third-party APIs behind adapter interfaces so providers can be swapped.
2. Implement resilient integrations (timeouts, retry, fallback/mock data, caching where needed).
3. Preserve privacy/security constraints for health data (no PII in logs, encrypt sensitive fields).
4. Add all new user-facing strings to FR and EN translation files.
5. Add tests (unit + integration-level where practical).
6. Report assumptions and mock/stub strategy for external APIs not yet available.

If frontend flows/screens are part of scope, invoke `/Roadmap Frontend Design` first.
