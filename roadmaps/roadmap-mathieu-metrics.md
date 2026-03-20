# 🏃 Track & Move Team Roadmap (Metrics)

> **Focus**: High-frequency quantitative logging, mathematical aggregations (charts / trends), and user goal tracking.

## Technical Boundaries
- **API Namespace**: `/api/v1/metrics/*` (managed in `backend/src/routes/metrics.routes.ts`)
- **Database Scope**: Focus entirely on tracking models (`VITAL_LOG`, `ACTIVITY_LOG`, `MEAL_LOG`, `HYDRATION_LOG`, `GOAL`)
- **Frontend Scope**: `frontend/src/app/features/metrics/*`

---
fix lint:
2026-03-20T15:20:00.1674473Z ##[group]Run npm run lint
2026-03-20T15:20:00.1674923Z [36;1mnpm run lint[0m
2026-03-20T15:20:00.1740482Z shell: /usr/bin/bash -e {0}
2026-03-20T15:20:00.1740914Z ##[endgroup]
2026-03-20T15:20:00.3161608Z 
2026-03-20T15:20:00.3162238Z > frontend@0.0.0 lint
2026-03-20T15:20:00.3162664Z > ng lint
2026-03-20T15:20:00.3162837Z 
2026-03-20T15:20:00.9644126Z 
2026-03-20T15:20:00.9644842Z Linting "frontend"...
2026-03-20T15:20:03.2070051Z [1m[31mLint errors found in the listed files.
2026-03-20T15:20:03.2070892Z [39m[22m
2026-03-20T15:20:03.2071161Z 
2026-03-20T15:20:03.2071924Z /home/runner/work/VibeHealth/VibeHealth/frontend/src/app/core/medical-id/medical-id.service.ts
2026-03-20T15:20:03.2109494Z ##[error]  89:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
2026-03-20T15:20:03.2117648Z 
2026-03-20T15:20:03.2118384Z /home/runner/work/VibeHealth/VibeHealth/frontend/src/app/core/rewards/rewards.service.ts
2026-03-20T15:20:03.2119870Z ##[error]  157:32  error  'reason' is defined but never used  @typescript-eslint/no-unused-vars
2026-03-20T15:20:03.2120864Z 
2026-03-20T15:20:03.2121312Z /home/runner/work/VibeHealth/VibeHealth/frontend/src/app/features/onboarding/onboarding.component.ts
2026-03-20T15:20:03.2122600Z ##[error]   16:3   error  'COMMON_CONDITIONS' is defined but never used             @typescript-eslint/no-unused-vars
2026-03-20T15:20:03.2124059Z ##[error]   17:3   error  'COMMON_ALLERGIES' is defined but never used              @typescript-eslint/no-unused-vars
2026-03-20T15:20:03.2125652Z ##[error]  150:23  error  A label component must be associated with a form element  @angular-eslint/template/label-has-associated-control
2026-03-20T15:20:03.2127238Z ##[error]  168:23  error  A label component must be associated with a form element  @angular-eslint/template/label-has-associated-control
2026-03-20T15:20:03.2129411Z ##[error]  186:23  error  A label component must be associated with a form element  @angular-eslint/template/label-has-associated-control
2026-03-20T15:20:03.2131432Z ##[error]  241:23  error  A label component must be associated with a form element  @angular-eslint/template/label-has-associated-control
2026-03-20T15:20:03.2133052Z ##[error]  269:23  error  A label component must be associated with a form element  @angular-eslint/template/label-has-associated-control
2026-03-20T15:20:03.2134621Z ##[error]  331:23  error  A label component must be associated with a form element  @angular-eslint/template/label-has-associated-control
2026-03-20T15:20:03.2136204Z ##[error]  343:23  error  A label component must be associated with a form element  @angular-eslint/template/label-has-associated-control
2026-03-20T15:20:03.2137741Z ##[error]  355:23  error  A label component must be associated with a form element  @angular-eslint/template/label-has-associated-control
2026-03-20T15:20:03.2139729Z ##[error]  401:23  error  A label component must be associated with a form element  @angular-eslint/template/label-has-associated-control
2026-03-20T15:20:03.2141427Z ##[error]  421:23  error  A label component must be associated with a form element  @angular-eslint/template/label-has-associated-control
2026-03-20T15:20:03.2142355Z 
2026-03-20T15:20:03.2142783Z ✖ 14 problems (14 errors, 0 warnings)
2026-03-20T15:20:03.2142985Z 
2026-03-20T15:20:03.2552929Z ##[error]Process completed with exit code 1.


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
