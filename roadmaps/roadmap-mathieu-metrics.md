# 🏃 Track & Move Team Roadmap (Metrics)

> **Focus**: High-frequency quantitative logging, mathematical aggregations (charts / trends), and user goal tracking.

## Technical Boundaries
- **API Namespace**: `/api/v1/metrics/*` (managed in `backend/src/routes/metrics.routes.ts`)
- **Database Scope**: Focus entirely on tracking models (`VITAL_LOG`, `ACTIVITY_LOG`, `MEAL_LOG`, `HYDRATION_LOG`, `GOAL`)
- **Frontend Scope**: `frontend/src/app/features/metrics/*`

---
## TODOs
- [x] fix lint

---

## Milestone 1: Hydration & Vitals Foundation ✅

- [x] Add `VITAL_LOG` and `HYDRATION_LOG` to `schema.prisma`.
  > `VitalLog` (heart rate, BP, sleep, steps, weight, temp, O2) and `HydrationLog` (ml/oz, source, loggedAt) added with composite indexes.

- [x] Create Hono CRUD routes for logging vitals (heart rate, sleep, BP, steps) and water intake.
  > Full CRUD in `backend/src/routes/metrics.routes.ts`: POST/GET/DELETE `/vitals`, `/vitals/today`, `/hydration`, `/hydration/today`, `/hydration/quick` (preset glass/bottle/large).

- [x] Build Frontend Quick-log buttons for Hydration (with animated progress bar, per-glass buttons, and logic to award +1/+5 🥕 per drink).
  > `HydrationTrackerComponent` (`features/metrics/hydration-tracker.component.ts`): SVG progress ring, per-glass preset buttons with pulse animation, +1 🥕 per drink, +5 bonus on daily goal completion via `RewardsService`.

- [x] Implement Vitals Dashboard components: time-of-day greeting (with user's first name), stats grid (streak/level/carrots), level XP progress bar, and recent carrot activity feed.
  > - `StatsGridComponent` (`shared/components/stats-grid`): greeting + emoji, 3-stat grid (streak/level/carrots), animated XP progress bar.
  > - `CarrotFeedComponent` (`shared/components/carrot-feed`): recent rewards list with category icons and relative timestamps.
  > - `VitalsLoggerComponent` (`features/metrics/vitals-logger.component.ts`): 4×2 type-selector grid, numeric input with unit badge, +2 🥕 on log.
  > - `VitalsDashboardComponent` (`features/metrics/vitals-dashboard.component.ts`): full `/vitals` page assembling all four components + 7-day TrendChart for steps and sleep.

- [x] Add Quick-action grid to dashboard (Medical ID, First Aid, Journal, Profile) with gradient icon tiles.
  > Dashboard `quickActions` updated to: **Medical ID** (red gradient), **First Aid** (orange gradient), **My Goals** (purple gradient), **Profile** (green gradient). Each tile uses `linear-gradient` background with matching colored drop-shadow. Routes wired: `/medical-id`, `/first-aid`, `/goals`, `/onboarding`.

---

## Milestone 2: Activity & Nutrition ✅

- [x] Add `ACTIVITY_LOG` and `MEAL_LOG` to `schema.prisma`.
  > `ActivityLog` (type, name, duration, calories, distance, intensity, heartRateAvg) and `MealLog` (mealType, macros, barcode, imageUrl) with composite indexes.

- [x] Create Hono CRUD routes for activities and meals (with macros: protein/carbs/fat).
  > Full CRUD in `metrics.routes.ts`: POST/GET/DELETE `/activities`, `/activities/today`, `/activities/week`; POST/GET/DELETE `/meals`, `/meals/today`, `/meals/week`. Week summaries include daily breakdown.

- [x] Build Frontend interfaces for Manual Activity Logging and Food Diary.
  > - `ActivityLoggerComponent` (`features/metrics/activity-logger.component.ts`): quick-log preset grid, full form with type/duration/intensity selector and calorie estimator.
  > - `ActivityPageComponent` (`features/metrics/activity-page.component.ts`): `/activity` page with today summary strip, type breakdown sidebar, and weekly minutes/calories TrendCharts.
  > - `NutritionLoggerComponent` (`features/metrics/nutrition-logger.component.ts`): meal-type selector, macro inputs, barcode scanner placeholder.
  > - `NutritionPageComponent` (`features/metrics/nutrition-page.component.ts`): `/nutrition` page with calorie progress bar, macro rings (protein/carbs/fat), meal-type breakdown, and weekly TrendCharts.

- [x] Implement Barcode scanner placeholder for packaged foods to speed up logging.
  > `BarcodeScannerComponent` (`shared/components/barcode-scanner`): "Coming Soon" UI with camera-frame styling; `ScannedFood` interface ready for real scanner integration. Emits `foodScanned` output consumed by `NutritionLoggerComponent`.

- [x] Create reusable components for Charting (e.g., 7-day trend graphs for steps & calories).
  > `TrendChartComponent` (`shared/components/trend-chart/trend-chart.component.ts`): animated bar chart with y-axis ticks, optional target line, above/below-target colour coding (green vs amber), Motion.dev bar-grow animation, dark-mode aware.

---

## Milestone 3: SMART Goals & Analysis ✅

- [x] Add `GOAL` to `schema.prisma`.
  > `Goal` model (type, title, targetValue, targetUnit, frequency DAILY/WEEKLY/MONTHLY, startDate, endDate, isActive) and `GoalProgress` (upsert per goalId+date) with indexes.

- [x] Build the Goal creation wizard on the Frontend.
  > `GoalWizardComponent` (`features/metrics/goal-wizard.component.ts`): 3-step wizard (pick type → configure target/frequency/end-date → confirm). Step 3 shows summary card with +5 🥕 badge; on save transitions to bunny mascot celebration with confetti ring, carrot pop-in, and saved-pill. Accessible (role=dialog, aria-modal, aria-labelledby).
  > `GoalsPageComponent` (`features/metrics/goals-page.component.ts`): `/goals` page listing active goals with progress bars, inline quick-log form per goal, delete (soft), and archived section. Awards +2 🥕 for logging progress, +10 🥕 on completion.
  > `GoalsService` (`core/metrics/goals.service.ts`): signal-based service with `goals`, `activeGoals`, `completedGoals` computed signals; full CRUD + `logProgress`.

- [x] Write Backend services to compute progress against weekly/monthly goals (e.g. "Did user hit 10k steps 5 days this week?").
  > Goal routes in `metrics.routes.ts`: GET `/goals` (list with progress), POST `/goals` (create), GET `/goals/:id` (with computed `currentValue`, `progressPercentage`, `isCompleted`), PATCH `/goals/:id`, DELETE `/goals/:id` (soft-delete → `isActive: false`), POST `/goals/:id/progress` (upsert per day), GET `/goals/:id/progress`.

- [x] Implement Milestone celebrations (integrating with the Bunny Mascot system to react enthusiastically).
  > Goal wizard Step 3 post-save: 🐰 emoji bounces with spinning confetti ring, carrot-earned pill animates in with `popIn` keyframe. `RewardsService.awardCarrots(5, 'New goal: … 🎯', 'milestone')` fires immediately. Goal completion in `GoalsPageComponent` awards +10 🥕 with milestone category ("Goal achieved: … 🎉").

---

## Milestone 4: Workouts & Hardware Sync

- [x] Add `WORKOUT_PLAN` / Exercise logic to Backend.
  > Added workout data models to Prisma (`WorkoutPlan`, `WorkoutPlanExercise`, `ExerciseCatalog`) with enums for exercise category and difficulty. Added authenticated `/api/v1/metrics/workout-plans`, `/workouts/suggestions`, and `/workout-logs` endpoints with profile-aware suggestion logic and rep/rest payloads.
- [x] Build the Workouts Tab matching profile to exercise suggestions and providing rep counters/rest timers.
  > Added frontend `/workouts` page (`workouts-page.component.ts`) with profile-matched suggestions, workout plan creation, per-exercise rep counter inputs, and live per-exercise rest countdown timers after each logged set.
- [x] Integrate Health Platform Sync (Google Fit / Samsung Health web APIs) to automatically pull/push metrics continuously.
  > Added metrics sync contracts and UI for Google Fit / Samsung Health: `/sync/connections`, `/sync/connect`, `/sync/:provider/auto`, and `/sync/:provider/pull`, plus sync controls in the Workouts tab. Current implementation is clearly marked placeholder mode (safe contract + state persistence) pending provider OAuth/webhook pipeline.

---

## Routing Summary

| Path | Component |
|------|-----------|
| `/vitals` | `VitalsDashboardComponent` |
| `/activity` | `ActivityPageComponent` |
| `/nutrition` | `NutritionPageComponent` |
| `/goals` | `GoalsPageComponent` |
| `/dashboard` | `DashboardComponent` (overview) |

## New Files Created

### Backend
- `backend/src/routes/metrics.routes.ts` — Goals CRUD + progress routes appended (lines ~755–1000)

### Frontend — Core
- `frontend/src/app/core/metrics/goals.service.ts` — Signal-based GoalsService with CRUD + `GOAL_TYPE_INFO` / `GOAL_FREQ_INFO` metadata

### Frontend — Features
- `frontend/src/app/features/metrics/vitals-logger.component.ts` — Quick vital logging card
- `frontend/src/app/features/metrics/vitals-dashboard.component.ts` — `/vitals` full page
- `frontend/src/app/features/metrics/activity-page.component.ts` — `/activity` full page
- `frontend/src/app/features/metrics/nutrition-page.component.ts` — `/nutrition` full page
- `frontend/src/app/features/metrics/goal-wizard.component.ts` — 3-step goal creation wizard
- `frontend/src/app/features/metrics/goals-page.component.ts` — `/goals` full page

### Frontend — i18n
- `en.json` / `fr.json` — Added `ACTIVITY`, `NUTRITION`, `GOALS` (+ `GOALS.WIZARD`) sections; added `DASHBOARD.QUICK_MEDICAL_ID/FIRST_AID/GOALS/PROFILE` tile labels
