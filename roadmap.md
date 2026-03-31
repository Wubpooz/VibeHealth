# 🐰 VibeHealth — Product Roadmap

> **Vision**: A comprehensive, personal health companion — powered by a friendly bunny mascot — that unifies vitals tracking, medical intelligence, wellness tools, and lifestyle features into one delightful app.

---

## Status Update (March 2026)

- Phase 0 (Foundation): Complete
- Phase 1 (Core Health Tracking): Complete and in production readiness
- Phase 2 (Medical Intelligence): Active development (medicine tracker + reminders, health checks, vaccines, guides)
- Phase 3+ (Lifestyle, social, integrations): planning and backlog grooming

---

## Tech Stack (from scaffold prompt)

| Layer | Technology |
|---|---|
| Runtime / PM | **Bun** |
| API | **Hono** |
| Validation | **Zod** |
| ORM | **Prisma** |
| Database | **PostgreSQL** |
| Auth | **BetterAuth** |
| Frontend | **Angular 21 + Tailwind CSS** |
| Animations | **animate.js** |
| Infra | Docker Compose, Caddy, nginx, CI |

---

## Phase Overview

`mermaid
gantt
    title VibeHealth Delivery Phases
    dateFormat  YYYY-MM-DD
    axisFormat  %b %Y

    section Phase 0 – Foundation
    Auth, Profile, Scaffold        :p0, 2026-04-01, 6w

    section Phase 1 – Core Health
    Vitals, Activity, Nutrition    :p1, after p0, 8w

    section Phase 2 – Medical Intelligence
    Medicines, Vaccines, Guides    :p2, after p1, 8w

    section Phase 3 – Lifestyle & Wellness
    Mood, Journal, Relaxation      :p3, after p2, 6w

    section Phase 4 – Social & Integration
    Sharing, Export, Calendar      :p4, after p3, 6w

    section Phase 5 – Advanced & P2
    Maps, Health Sync, Pregnancy   :p5, after p4, 8w
`

---

## Phase 0 — Foundation *(completed)*

> Scaffold, auth, onboarding, bunny mascot, design system, offline essentials, and i18n.

### 0.1 Project Scaffold
- ✅ Monorepo scaffold is in place: Bun/Hono backend + Angular 21 PWA frontend with Docker and CI wiring.
- Bun + Hono API with structured routes/services/schemas
- Prisma schema, PostgreSQL via Docker Compose
- Angular 21 **PWA** with Tailwind, routing, shared components
- CI pipeline (lint → typecheck → test → build → container)
- Environment config (.env with safe placeholders)
- **Service Worker** setup for offline caching from day one

### 0.2 Authentication & Accounts
- ✅ BetterAuth email/password auth with session-aware route guarding is implemented.
- BetterAuth integration (email/password, OAuth, magic links)
- Session management & JWT refresh
- Role model: user, caregiver (read-only shared access), admin

### 0.3 Onboarding / Profiling Wizard
- ✅ Multi-step wizard
  - Name, date of birth, biological sex, height, weight
  - Medical conditions, allergies, current medications (smart autocomplete)
  - Fitness level, goals (weight loss, muscle gain, maintenance, wellness)
  - Menstrual cycle info (optional)
  - Pregnancy status (optional)
  - Notification preferences (web push, device push, email)

### 0.4 Bunny Mascot System 🐰
- ✅ Mascot component with idle/happy/sad/encouraging states
- ✅ Bunny reacts to user actions (logging, streaks, milestones)
- ✅ Carrot reward system (used by focus tools)

### 0.5 Medical ID
- ✅ Emergency card with name, age, blood type, allergies, meds, contacts
- ✅ QR code generation for quick scan
- ✅ **Offline-ready** — cached via Service Worker

### 0.6 Design System & Shared UI
- ✅ Color palette, typography, spacing tokens
- ✅ Reusable components: cards, charts, modals, bottom nav, FAB, autocomplete
- ✅ Dark mode support
- ✅ Micro-animations (animate.js)

### 0.7 Internationalization (i18n)
- ✅ EN + FR synced translations across features
- ngx-translate setup, locale map

### 0.8 First Aid Guide
- ✅ First Aid list/detail flows implemented and offline-ready
- Categories: burns, choking, CPR, fractures, allergic reactions

---

## Phase 1 — Core Health Tracking *(completed)*

> Vitals, activity, nutrition, hydration, and goals.

### ✅ Core implementation completed
- ✅ Metrics backend + frontend for vitals, hydration, activity, meals, goals
- ✅ Workouts foundation on /workouts with profile-based suggestions, plan generation, set logging, rep counters, rest timers
- ✅ Health sync contract support for Google Fit / Samsung Health (state + manual pull + auto sync flag)
- ⚠️ Partial: Full provider OAuth ingestion and conflict resolution to finalize

### 1.1 Vitals
- ✅ /vitals logged with trends
- BP, HR, SpO2, temperature, weight, etc

### 1.2 Activity
- ✅ /activity tracker + weekly summary
- Searchable activity catalog with MET values

### 1.3 Nutrition
- ✅ /nutrition food diary + macros
- Meal catalog templates + autofill
- Barcode scan UX placeholder

### 1.4 Hydration
- ✅ Hydration quick-log + daily goal ring

### 1.5 Goals
- ✅ SMART goals creation + progress logging
- Bunny celebration events

---

## Phase 2 — Medical Intelligence *(active)

> Medicines, health checks, vaccines, guides.

### 2.1 Medicine Tracker & Reminders
- ✅ Add medications (name, dose, frequency, schedule)
- ✅ Reminders + snooze logic exists
- ⚠️ In-progress: side-effect database and interaction warnings

### 2.2 Health Checks & Vaccines
- In-progress: recommended screenings + vaccine schedule workflows
- Upcoming: appointment logging and personalized reminders

### 2.3 Guides & Articles
- In-progress: condition library + article CMS

### 2.4 Pollen Tracking
- Planned: location-based pollen levels, forecasts, alerting

---

## Phase 3 — Lifestyle & Wellness *(planned)

> Mood, periods, journaling, workouts, relaxation, focus.

- Mood tracker, period tracker, journaling, workouts tab, ambient meditation, focus mode

---

## Phase 4 — Social & Integration *(planned)

> Sharing, export, calendar sync, supported devices

---

## Phase 5 — Advanced & P2

> Maps, health sync deep integration, pregnancy, platform federation

