# 🏃 Track & Move Team Roadmap (Metrics)

> **Focus**: High-frequency quantitative logging, mathematical aggregations (charts / trends), and user goal tracking.

## Technical Boundaries
- **API Namespace**: `/api/v1/metrics/*` (managed in `backend/src/routes/metrics.routes.ts`)
- **Database Scope**: Focus entirely on tracking models (`VITAL_LOG`, `ACTIVITY_LOG`, `MEAL_LOG`, `HYDRATION_LOG`, `GOAL`)
- **Frontend Scope**: `frontend/src/app/features/metrics/*`

---
## TODOs
- [x] fix lint

## Milestone 1: Hydration & Vitals Foundation
- [ ] Add `VITAL_LOG` and `HYDRATION_LOG` to `schema.prisma`.
- [ ] Create Hono CRUD routes for logging vitals (heart rate, sleep, BP, steps) and water intake.
- [ ] Build Frontend Quick-log buttons for Hydration (with animated progress bar, per-glass buttons, and logic to award +1/+5 🥕 per drink).
- [ ] Implement Vitals Dashboard components: time-of-day greeting (with user's first name), stats grid (streak/level/carrots), level XP progress bar, and recent carrot activity feed.
- [ ] Add Quick-action grid to dashboard (Medical ID, First Aid, Journal, Profile) with gradient icon tiles.

## Milestone 2: Activity & Nutrition
- [ ] Add `ACTIVITY_LOG` and `MEAL_LOG` to `schema.prisma`.
- [ ] Create Hono CRUD routes for activities and meals (with macros: protein/carbs/fat).
- [ ] Build Frontend interfaces for Manual Activity Logging and Food Diary.
- [ ] Implement Barcode scanner placeholder for packaged foods to speed up logging.
- [ ] Create reusable components for Charting (e.g., 7-day trend graphs for steps & calories).

## Milestone 3: SMART Goals & Analysis
- [ ] Add `GOAL` to `schema.prisma`.
- [ ] Build the Goal creation wizard on the Frontend.
- [ ] Write Backend services to compute progress against weekly/monthly goals (e.g. "Did user hit 10k steps 5 days this week?").
- [ ] Implement Milestone celebrations (integrating with the Bunny Mascot system to react enthusiastically).

## Milestone 4: Workouts & Hardware Sync
- [ ] Add `WORKOUT_PLAN` / Exercise logic to Backend.
- [ ] Build the Workouts Tab matching profile to exercise suggestions and providing rep counters/rest timers.
- [ ] Integrate Health Platform Sync (Google Fit / Samsung Health web APIs) to automatically pull/push metrics continuously.
