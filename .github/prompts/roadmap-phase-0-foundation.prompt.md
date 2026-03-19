---
description: "Implement one Phase 0 Foundation item (scaffold, auth, onboarding, mascot, Medical ID, design system, i18n, first aid/helpline)"
name: "VibeHealth Phase 0 Builder"
argument-hint: "Phase 0 feature to implement (e.g., '0.3 Onboarding Wizard')"
agent: "agent"
---
Implement one **Phase 0 — Foundation** feature from [roadmap.md](../../roadmap.md).

## Phase 0 scope (roadmap §0.1–0.8)
- **0.1** Project scaffold — Bun + Hono API, Prisma + PostgreSQL, Angular 21 **PWA**, Docker Compose, CI, **Service Worker**
- **0.2** Authentication & Accounts — BetterAuth, roles (user / caregiver / admin)
- **0.3** Onboarding / Profiling Wizard — multi-step, notification preferences (web push, device push, email)
- **0.4** Bunny Mascot System — states (idle, happy, sad, encouraging), carrot rewards
- **0.5** Medical ID — emergency card, QR code, **offline-ready** via Service Worker
- **0.6** Design System & Shared UI — tokens, reusable components, dark mode, animate.js
- **0.7** Internationalization (i18n) — ngx-translate, FR + EN from day one, locale-aware formatting
- **0.8** First Aid Guide & Helpline — **offline-first** (cached at install), crisis hotlines, bunny comfort

## Execution requirements
1. Read the relevant section of `roadmap.md` and restate acceptance criteria.
2. Locate impacted files and architecture boundaries.
3. Implement with clean types (Zod schemas ↔ Prisma models), validation, and error handling.
4. Add every user-facing string to both `fr.json` and `en.json` translation files.
5. Add/adjust tests.
6. Verify with lint → typecheck → tests → build.
7. Return concise delivery summary and next logical slice.

If the chosen item contains frontend design work, use `/Roadmap Frontend Design` first.
