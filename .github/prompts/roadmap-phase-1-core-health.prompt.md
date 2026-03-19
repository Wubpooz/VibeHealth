---
description: "Implement one Phase 1 Core Health feature (vitals, activity, nutrition, hydration, goals)"
name: "VibeHealth Phase 1 Builder"
argument-hint: "Phase 1 feature to implement (e.g., '1.4 Hydration Tracking')"
agent: "agent"
---
Implement one **Phase 1 — Core Health Tracking** feature from [roadmap.md](../../roadmap.md).

## Phase 1 scope (roadmap §1.1–1.5)
- **1.1** Vitals Dashboard — steps, heart rate, sleep, speed/distance, BP, SpO₂, temp, weight; trend charts, 7d/30d/90d averages, threshold warnings
- **1.2** Activity Tracking — manual logging, auto-detection placeholders, active minutes, calorie burn
- **1.3** Nutrition & Calories — food diary, macros, barcode scanner placeholder, daily/weekly summaries
- **1.4** Hydration Tracking — quick-log, profile-based daily goal, reminders, water fill animation
- **1.5** Health & Workout Goals — SMART goals, progress tracking, bunny milestone celebrations, report cards

## Execution requirements
1. Translate roadmap bullets into explicit acceptance criteria.
2. Implement API (Hono routes + Zod), data model (Prisma migration), and frontend (Angular components) incrementally.
3. Add analytics/aggregation logic where required (7d/30d/90d averages, trend detection, threshold alerts).
4. Ensure all new user-facing strings are added to FR and EN translation files.
5. Add or update automated tests (unit + integration where practical).
6. Validate with lint → typecheck → tests → build.
7. Report what is complete vs. deferred.

If the selected feature has UI/UX design work, run `/Roadmap Frontend Design` before coding.
