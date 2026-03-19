# Copilot Instructions for VibeHealth

## Build, test, and lint commands

Use scripts from each package rather than ad-hoc commands.

### Root (runs backend + frontend workflows)

```bash
npm run dev
npm run build
npm test
```

### Backend (`backend/`, Bun + TypeScript)

```bash
cd backend
bun install
bun run lint
bun run typecheck
bun test
bun run build
```

Single test execution:

```bash
cd backend
bun test src/path/to/file.test.ts
bun test -t "test name"
```

Database/dev support:

```bash
cd backend
bun run db:generate
bun run db:push
bun run db:migrate
bun run db:studio
```

### Frontend (`frontend/`, Angular 21)

```bash
cd frontend
npm ci
npm run start
npm run lint
npm run test -- --watch=false --browsers=ChromeHeadless
npm run build
```

Single test execution:

```bash
cd frontend
npm run test -- --include src/app/app.component.spec.ts --watch=false --browsers=ChromeHeadless
```

Notes:
- Frontend lint is available as `npm run lint` (`ng lint`).
- CI still invokes lint with `npm run lint --if-present`.

## High-level architecture

VibeHealth is a monorepo with:
- `backend/`: Bun runtime, Hono API, Prisma ORM, PostgreSQL.
- `frontend/`: Angular 21 standalone PWA with Service Worker and ngx-translate.
- Root `package.json`: orchestration scripts for both apps.
- `docker-compose.yml`: local stack for PostgreSQL + backend + frontend.

Runtime flow:
1. Angular app boots via `bootstrapApplication` (`frontend/src/main.ts`) using `app.config.ts`.
2. Frontend calls backend HTTP API under versioned prefix `/api/v1`.
3. Hono app (`backend/src/index.ts`) applies shared middleware (`logger`, `cors`, `prettyJSON`) and exposes `/health` plus `/api/v1`.
4. Persistence uses Prisma models in `backend/prisma/schema.prisma` backed by PostgreSQL.

Frontend platform details:
- Uses standalone components and signals.
- Enables zoneless change detection (`provideZonelessChangeDetection`).
- Registers Service Worker in non-dev mode (`provideServiceWorker`), with config in `frontend/ngsw-config.json`.

CI/CD shape (`.github/workflows/ci.yml`):
- Separate backend and frontend jobs.
- Backend pipeline: install -> Prisma generate -> lint -> typecheck -> test -> build.
- Frontend pipeline: install -> (lint if present) -> headless test -> build.

## Key conventions (repository-specific)

- API versioning is explicit: keep routes under `/api/v1` and preserve `/health` as a simple health endpoint.
- Backend package manager/runtime is **Bun**; frontend uses **npm/Angular CLI**.
- Keep Prisma table mappings (`@@map(...)`) and relation behavior consistent with existing schema patterns.
- All user-facing strings must be kept in sync across both translation files:
  - `frontend/src/assets/i18n/en.json`
  - `frontend/src/assets/i18n/fr.json`
- Roadmap-level product constraints already used by repo prompts/docs:
  - Offline-first coverage is required for Medical ID, First Aid guide, and Journal.
  - External providers should be accessed behind adapter interfaces.
- For frontend additions, align with current Angular style in codebase: standalone components + signals + config-first providers in `app.config.ts`.
