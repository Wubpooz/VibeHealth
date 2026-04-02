---
name: vibehealth-stack-scaffold
description: 'Scaffold a VibeHealth-style full-stack starter using Bun + Hono + Prisma + PostgreSQL backend and Angular 21 PWA + Tailwind + ngx-translate frontend. Use for bootstrap, starter, scaffold, greenfield setup, monorepo initialization, or cloning this repo architecture.'
argument-hint: 'Describe project name, scope (full-stack/backend/frontend), and options (auth, i18n, Docker, sample features).'
---

# VibeHealth Stack Scaffolder

## What this skill produces

A runnable scaffold aligned with the technologies and conventions used in this repository:

- **Backend**: Bun + Hono + Prisma + PostgreSQL (+ Better Auth integration points)
- **Frontend**: Angular 21 standalone app + Tailwind + ngx-translate (EN/FR) + PWA setup
- **Workspace**: monorepo scripts, Docker Compose, and health-check wiring
- **Quality baseline**: lint/test/build scripts and parity checks ready to run

## When to use

Use this skill when the user asks to:

- scaffold/bootstrap a new project
- generate a starter template similar to VibeHealth
- create a Bun + Hono + Prisma backend with Angular frontend
- initialize a health app monorepo with bilingual i18n and PWA support

## Inputs to collect before scaffolding

If not provided, ask briefly. If still ambiguous, use defaults.

1. **Scope**: `full-stack` (default), `backend-only`, or `frontend-only`
2. **Project path/name**: target directory and package naming
3. **Auth**: include Better Auth scaffolding (`yes` default)
4. **i18n**: include EN/FR translation skeleton (`yes` default)
5. **Infra**: local Docker PostgreSQL (`yes` default) vs external DB
6. **Depth**: quick skeleton vs production-ready baseline (default: production-ready baseline)

## Workflow

### 1) Align and plan

- Confirm requested scope and defaults.
- Provide a concise tree of files/folders that will be created.
- Call out any destructive operations before writing files.

### 2) Preflight checks

- Verify target directory state (new vs existing).
- Avoid overwriting unrelated files.
- If environment variables are required, ensure a `.env` exists; if missing, create one with placeholders.

### 3) Scaffold root workspace

Create/ensure:

- root `package.json` with orchestration scripts (`dev`, `build`, `test`, backend/frontend helpers)
- `docker-compose.yml` with PostgreSQL service
- root `README.md` with setup, run, build, test instructions
- top-level `tsconfig.json` and shared conventions

### 4) Scaffold backend (Bun + Hono + Prisma)

Create/ensure under `backend/`:

- `src/index.ts` with `/health` route and all API routes mounted under `/api/v1`
- middleware folder (`auth`, `locale`, etc. as needed)
- route folders with at least one protected route example
- Prisma schema with mapped table names (`@@map`) and user/session primitives
- auth integration points via Better Auth
- scripts for `db:generate`, `db:push`, `db:migrate`, `db:seed`

Backend conventions to enforce:

- strict TypeScript, avoid `any`
- `requireAuth` middleware for protected routes
- user-scoped queries for private data
- stable error response shape and explicit HTTP codes

### 5) Scaffold frontend (Angular 21 + Tailwind + ngx-translate)

Create/ensure under `frontend/`:

- Angular 21 standalone structure (`core`, `features`, `shared`)
- route shell and starter pages
- Tailwind setup and global design-token-ready styles
- ngx-translate configured with both `en.json` and `fr.json`
- PWA manifest + service worker configuration

Frontend conventions to enforce:

- standalone components only (no NgModules)
- signals (`signal`, `computed`) for state
- native control flow (`@if`, `@for`, `@switch`)
- `inject()` for DI
- OnPush change detection

### 6) Wire backend/frontend integration

- configure frontend proxy/base API URL to backend
- configure backend CORS for frontend origin
- document env vars for both apps
- include one end-to-end smoke path (e.g., frontend pinging `/health`)

### 7) Add quality gates

Add scripts and checks so the scaffold is verifiable immediately:

- backend: lint, typecheck, test, build
- frontend: lint, test (headless), build
- i18n parity check (EN/FR keys in sync)

### 8) Validate the scaffold

Run relevant commands for selected scope and report results.

Minimum success criteria:

- apps start in dev mode
- lint/typecheck/test/build pass for touched scope
- API versioning + health route are correct (`/api/v1/*`, `/health`)
- EN + FR translation files both present and consistent

### 9) Final delivery format

Return:

1. summary of files created/updated
2. commands executed and outcome
3. any remaining TODOs (e.g., OAuth credentials)
4. next recommended enhancement steps

## Branching rules

- **If user asks "quick scaffold"**: generate minimal runnable files, skip nonessential extras, but keep versioning/auth/i18n foundations.
- **If user asks "production-ready"**: include stricter linting, CI-ready scripts, stronger error handling, and test stubs.
- **If backend-only/frontend-only**: scaffold only requested side, but still include clear integration notes for later expansion.
- **If existing repo already has structure**: extend incrementally instead of replacing.

## Completion checklist

- [ ] Scope, defaults, and output path confirmed
- [ ] File tree scaffolded without destructive overwrites
- [ ] Stack-specific conventions applied (Bun/Hono/Prisma + Angular 21/Tailwind/i18n)
- [ ] `.env` placeholders added where needed
- [ ] Verification commands executed and reported
- [ ] Follow-up enhancements proposed
