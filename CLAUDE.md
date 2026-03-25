# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Project Overview

**VibeHealth** is a bilingual (EN/FR) PWA combining:
- **Frontend**: Angular 21 (standalone components, signals, OnPush change detection)
- **Backend**: Hono + Bun runtime + Prisma ORM + PostgreSQL
- **Purpose**: Personal health companion with medical ID, vitals tracking, wellness features, offline-first critical flows

**Current Phase**: Phase 1 — Health Tracking (in progress) covering vitals, hydration, activity, nutrition, and goals.

---

## Essential Commands

### Core Development
```bash
# Full stack (from root)
npm run dev              # Both backend + frontend concurrently
npm run dev:backend      # Backend only (from backend/)
npm run dev:frontend     # Frontend only (from frontend/)
```

### Testing & Quality
```bash
# Backend quality gates
cd backend
bun run lint             # ESLint
bun run typecheck        # TypeScript strict check
bun test                 # Unit tests
bun run build            # Production build

# Frontend quality gates
cd frontend
npm run lint             # Angular ESLint
npm run test             # Karma + Jasmine (runs in watch mode by default)
npm run test -- --watch=false --browsers=ChromeHeadless  # Single run for CI
npm run build            # Production build
```

### Database Management
```bash
cd backend
bun run db:generate      # Generate Prisma client after schema changes
bun run db:push          # Push schema to database
bun run db:migrate       # Create and run migrations
bun run db:studio        # Launch Prisma Studio (UI for database)
bun run db:seed          # Populate reference data (activities, meals)
```

### Full Stack Setup
```bash
# One-command setup for local development (auto-creates DB, generates client, seeds data)
cd backend
bun run dev:stack

# Docker alternative (from root)
npm run docker:up        # Start PostgreSQL + Redis (if configured)
npm run docker:logs      # View logs
npm run docker:down      # Stop containers
```

---

## Architecture Patterns

### Frontend (Angular 21)
- **Component Style**: Standalone only, no NgModules
- **State Management**: Signals (`signal()`, `computed()`) with `.asReadonly()` for public APIs
- **Control Flow**: New native syntax (`@if`, `@for`, `@switch`), never `*ngIf`, `*ngFor`
- **Dependency Injection**: `inject()` function, never constructor injection
- **Change Detection**: Always `changeDetection: ChangeDetectionStrategy.OnPush`
- **Component Design**: `input()` / `output()` functions (not decorators)
- **Key Services** (core/):
  - `auth.service.ts` — login, logout, session state
  - `profile.service.ts` — user profile, medical info
  - `metrics.service.ts` — vitals, goals, activities, meals data layer
  - `goals.service.ts` — goal CRUD and progress tracking
  - `rewards.service.ts` — carrot counting and achievement stats
  - `theme.service.ts` — light/dark mode + "Soft Pop" design tokens
- **Routes** (app/app.routes.ts): Lazy-loaded feature modules tied to authentication guards

### Backend (Hono + Bun)
- **API Structure**: All routes under `/api/v1/*`, health check preserved at `/health`
- **Route Organization** (src/routes/):
  - `auth.routes.ts` — signup, login, logout, password reset
  - `profile.routes.ts` — get/update user profile
  - `medical-id.routes.ts` — get/set Medical ID
  - `metrics.routes.ts` — all vitals, hydration, activities, meals, goals CRUD
  - `reference-data.routes.ts` — activity catalog, meal templates (cached, database-provided)
- **Middleware** (src/middleware/):
  - `auth.middleware.ts` — JWT verification, required auth guard
- **Database Layer**: Prisma with strong typing via schemas and generated types
- **Testing**: Bun's native test runner with mock helpers for auth and Prisma

### Database (Prisma Schema)
- Core models: `User`, `Profile`, `MedicalId`
- Metrics models: `VitalLog`, `HydrationLog`, `ActivityLog`, `MealLog`, `Goal`, `GoalProgress`
- Reference data: `ActivityCatalog`, `MealTemplate`
- Consistent `@@map()` for table names, scalars for JSON fields where needed

### i18n (ngx-translate)
- Translation files: `frontend/src/assets/i18n/{en,fr}.json`
- **Key convention**: Flat dot-notation keys (e.g., `"onboarding.step1.title"`)
- **Critical rule**: Both `en.json` and `fr.json` must have identical keys (user-facing strings)
- Usage: `{{ 'key' | translate:params }}`

---

## Key File Locations

| Purpose | Location |
|---------|----------|
| API routes | `backend/src/routes/*.routes.ts` |
| Core services | `frontend/src/app/core/` |
| Feature pages | `frontend/src/app/features/` |
| Reusable components | `frontend/src/app/shared/components/` |
| Database schema | `backend/prisma/schema.prisma` |
| Translations | `frontend/src/assets/i18n/{en,fr}.json` |
| Global styles | `frontend/src/styles.css` (Tailwind + design tokens) |
| Animations | `frontend/src/app/shared/animations/` |

---

## Critical Conventions

### Must Follow
1. **Standalone components only** — no NgModules anywhere
2. **OnPush change detection** — set in all `@Component` decorators
3. **Readonly signals** — expose `.asReadonly()` from services for public state
4. **API versioning** — all new endpoints under `/api/v1/`
5. **i18n completeness** — add strings to BOTH `en.json` AND `fr.json`
6. **Type safety** — strict TSConfig, no `any` without justification
7. **Testing** — backend and frontend have quality gates that block merges

### Design System ("Soft Pop")
- Colors: Warm gradients (coral → peach), soft shadows, organic shapes
- Buttons: Pill-shaped with emoji accents, hover lift effects
- Inputs: Floating labels, soft focus rings, autocomplete dropdowns
- Cards: Rounded corners (1.5rem+), gradient borders, soft shadows
- Animations: motion.dev for page transitions, ng-animated-icons for interactive icons, spiraling loaders for async states
- No harsh `backdrop-filter: blur` (performance on mobile)

---

## Before Merging Code

Check these quality gates:

### Backend
```bash
cd backend
bun run lint              # Must pass
bun run typecheck         # Must pass
bun test                  # All tests pass
bun run build             # Production build succeeds
```

### Frontend
```bash
cd frontend
npm run lint              # Must pass
npm run test -- --watch=false --browsers=ChromeHeadless  # All tests pass
npm run build             # Production build succeeds
```

### Both
- Verify both `en.json` and `fr.json` are in sync (same keys)
- WCAG AA accessibility compliance
- Service Worker works for offline critical flows (Medical ID, First Aid, Journal)

---

## External References

For deeper context on technologies used:

- **Existing Copilot Instructions**: `.github/copilot-instructions.md` — comprehensive skill file with phase planning
- **Angular 21 Docs**: `.github/.angular/llms-full.txt` (embedded reference)
- **Hono Docs**: `.github/.hono/llms-full.txt` (embedded reference)
- **Anime.js v4**: `.github/.gsap/CLAUDE.md` (NOTE: v4 syntax differs from v3)
- **Roadmap**: `roadmap.md` — feature phases and upcoming work

---

## Common Development Tasks

### Adding a New Feature Page
1. Create component under `frontend/src/app/features/feature-name/`
2. Add route to `app.routes.ts` (lazy-load with `loadComponent`)
3. Add navigation link in `sidebar.component.ts` or bottom nav
4. Add feature service to `core/` for data layer
5. Add translations to both `en.json` and `fr.json`
6. Run `npm run build` to ensure no type errors

### Adding a New API Endpoint
1. Create/extend route handler in `backend/src/routes/`
2. Add Zod validation schema for request/response
3. Add Prisma model if new data entity
4. Run `bun run db:generate` and `bun run db:push` if schema changed
5. Add test file in `backend/src/tests/unit/`
6. Verify `bun run typecheck && bun test && bun run build`

### Adding a New Data Input Form
1. Follow the pattern from vitals-logger, activity-logger, nutrition-logger
2. Use Angular forms (`FormBuilder`, `FormControl`) for validation
3. Wire to metrics service for API calls
4. Show toast notification on success/error
5. Update goal progress if applicable
6. Add i18n strings (both locales)

### Working with Signals
- Use `signal(initialValue)` for mutable state
- Use `computed(() => ...)` for derived state
- Always expose public API via `.asReadonly()`
- Never call `.set()` outside the service that owns the signal

### Testing
- **Backend**: Use `bun test` with mock Prisma/Auth helpers in `src/tests/`
- **Frontend**: Use Jasmine/Karma, test component signals and service methods
- Run tests locally before pushing: `bun test && npm run test -- --watch=false`

---

## Notes for Future Instances

1. **Understand the full picture first** — read `.github/copilot-instructions.md` for detailed phase planning
2. **Check the roadmap** — `roadmap.md` describes phases 2–5
3. **Reference data is database-backed** — activity catalog and meal templates come from the DB, not hardcoded
4. **Offline-first mindset** — Medical ID, First Aid, and Journal must work without internet
5. **Carrot reward system** — tied to health logging activities; check `rewards.service.ts` for the logic

---

**Last updated**: March 2026
**Git branch**: Working on `mathieu` branch for Phase 1 features
