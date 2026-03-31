# 🐰 VibeHealth

> Your personal health companion — a delightful full-stack PWA for tracking health, habits, and wellness.

VibeHealth combines medical essentials, lifestyle tracking, and a bunny-powered motivation loop into one app. It is designed with bilingual support (EN/FR), strong type safety, and an offline-first mindset for critical flows.

## 🚀 Tech Stack

### Backend
- **Runtime**: [Bun](https://bun.sh)
- **API Framework**: [Hono](https://hono.dev)
- **ORM**: [Prisma](https://www.prisma.io)
- **Database**: PostgreSQL 16
- **Validation**: [Zod](https://zod.dev)
- **Authentication**: BetterAuth

### Frontend
- **Framework**: [Angular 21](https://angular.dev) (standalone + signals)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Animations**: [motion](https://motion.dev), `ng-animated-icons`
- **Icons**: `@lucide/angular` (RC)
- **PWA**: Angular Service Worker
- **i18n**: `ngx-translate` (EN + FR)

### Infrastructure
- Docker + Docker Compose
- GitHub Actions
- nginx (production)

## 📋 Feature Status

### Phase 0 — Foundation ✅
- Auth + accounts
- Onboarding wizard with autocomplete
- Medical ID + QR
- First Aid guide
- Bunny mascot and rewards
- Shared design system + i18n

### Phase 1 — Health Tracking ✅
- Metrics API and Prisma models implemented for:
  - vitals
  - hydration
  - activity
  - meals/nutrition
  - goals + goal progress
- Frontend pages/routes implemented:
  - /vitals
  - /activity
  - /nutrition
  - /goals
  - /workouts (profile-based suggestions + rep/rest workflow)
- Input experiences implemented:
  - vitals/activity/nutrition loggers
  - goals wizard modal/overlay
- Reference data is database-backed for cataloged activities and meals templates
- Barcode scanner UI is a  coming soon interaction placeholder
- Health platform sync contract exists, with provider ingestion and full conflict resolution pending

### Phase 2 — Medical Intelligence (active)
- Medicine tracker + reminders foundations are in place (CRUD, schedule reminders, data model)
- Health checks, vaccines, and condition guides are in design and early implementation
- Pollen/allergen tracking components are planned

See [roadmap.md](./roadmap.md) for phase planning.

## 🧭 Project Structure

`	ext
vibehealth/
├── backend/
│   ├── prisma/schema.prisma
│   └── src/
│       ├── index.ts
│       ├── middleware/
│       └── routes/
├── frontend/
│   └── src/app/
│       ├── core/
│       ├── features/
│       └── shared/
├── docker-compose.yml
└── .github/
`

## 📈 Metrics API Snapshot

All metrics endpoints are under /api/v1/metrics:
- GET/POST /vitals
- GET/POST /hydration
- GET/POST /activities
- GET/POST /meals
- GET/POST/PATCH/DELETE /goals
- GET/POST /goals/:id/progress

## 🛠️ Quick Start

1. Clone repository
2. Set up backend environment file (ackend/.env)
3. Start containers (
pm run docker:up) or run services locally

### Local development

Backend:
- cd backend
- un install
- un run db:generate
- un run db:push
- un run dev

Frontend:
- cd frontend
- 
pm install
- 
pm start

## ✅ Quality Gates

- Backend: un run lint && bun run typecheck && bun test && bun run build
- Frontend: 
pm run lint && npm run test -- --watch=false --browsers=ChromeHeadless && npm run build

## 🌍 Internationalization

Translations live in rontend/src/assets/i18n/:
- en.json
- r.json

Both locales must stay in sync for user-facing strings.
