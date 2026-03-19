---
name: Scaffold Similar Stack Backend
description: Scaffold a new project backend with the APP5 stack and practices (Bun, Hono, Zod, Prisma, Postgres, BetterAuth), plus Docker, Postman, CI, and integrated frontend constraints.
argument-hint: Describe the new project's domain, core features, constraints, and non-functional requirements.
agent: agent
---
Create a production-ready scaffold for a **new project** that follows the same engineering practices and architecture patterns as this repository, but with a **different domain/specification**.

Use the user input as the project specification and goals.

## Inputs to collect/confirm
- Project name
- Domain and business goals
- Core entities and relationships
- Main API use cases and role model
- Security/compliance constraints
- Environment targets (local/dev/prod)

If any critical input is missing, ask concise follow-up questions first.

## Required architecture and stack
### Backend
- Runtime/package manager: **Bun**
- API framework: **Hono**
- Validation: **Zod**
- ORM/data layer: **Prisma**
- Database: **PostgreSQL**
- Auth: **BetterAuth**
- Logging: structured application and request logging
- Environment management: `.env` with safe placeholders and sample docs

### Frontend constraints (for integration and docs)
- Frontend stack target: **Angular 21 + Tailwind CSS**
- Testing requirement: **Karma** setup and example tests
- Animation requirement: include **animate.js** usage guidance/components
- Frontend design guidance: explicitly reference and use the **Claude frontend design skill** if available in the environment before generating UI architecture/design details.

## Infrastructure and operations requirements
Include scaffolding and configuration for:
- `compose.yaml` / Docker Compose services for app + db (+ optional reverse proxy)
- `Dockerfile`(s) for backend (and frontend if included)
- **Caddyfile** for reverse proxy / TLS-ready routing
- **nginx** config (alternative or complementary static/proxy setup)
- CI pipeline (lint, typecheck, test, build, and optionally container validation)

## API collaboration and docs requirements
- OpenAPI generation or maintained API spec
- Postman collection structure with environment file and sample flow(s)
- Design and architecture docs (including decisions, trade-offs, and deployment notes)
- `robots.txt` and `sitemap` generation strategy (for frontend/public endpoints)

## Expected output format
Provide results in this order:
1. **Scaffold plan** (short, actionable checklist)
2. **Proposed folder structure**
3. **Files to create/update** with purpose
4. **Starter implementations/configs**
5. **Runbook** (setup, dev, test, build, docker, CI)
6. **Risks + assumptions + follow-up questions**

## Quality gates (must satisfy)
- Type-safe boundaries and validated inputs
- Security-aware defaults (auth, secrets handling, least privilege)
- Clear separation of concerns (routes/services/schemas/middleware)
- Reproducible local environment with Docker Compose
- Testable baseline in backend and frontend
- Documentation sufficient for onboarding another developer

## Implementation behavior
- Make small, verifiable changes and run tests/lint/typecheck where possible.
- If a required variable is missing, create/update `.env` with placeholders and document them.
- Prefer conventions from this repository when in doubt.
- Do not hardcode domain specifics from this repository; adapt everything to the new project input.
