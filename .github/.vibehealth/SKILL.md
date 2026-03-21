# 🐰 VibeHealth — Master Skill File

> **Purpose**: This file provides LLMs with complete context about the VibeHealth project, ensuring consistent, high-quality contributions across the codebase.

---

## 🎯 Project Vision

VibeHealth is a **comprehensive, personal health companion** — powered by a friendly bunny mascot — that unifies vitals tracking, medical intelligence, wellness tools, and lifestyle features into one delightful PWA.

**Key Differentiators**:
- Offline-first architecture for critical features (Medical ID, First Aid, Journal)
- Bilingual from day one (FR + EN with ngx-translate)
- Premium "Soft Pop" design aesthetic with organic shapes and playful micro-interactions
- Smart autocomplete for all medical data entry
- Carrot-based reward system tied to the bunny mascot

---

## 🏗️ Architecture Overview

```
vibehealth/
├── backend/                    # Bun + Hono + Prisma
│   ├── src/
│   │   ├── routes/             # API route handlers (versioned under /api/v1)
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Auth, CORS, logging
│   │   ├── lib/                # Prisma client, utilities
│   │   └── index.ts            # Hono app entry point
│   └── prisma/schema.prisma    # Database schema
│
├── frontend/                   # Angular 21 PWA
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Singleton services (auth, profile, rewards, etc.)
│   │   │   ├── features/       # Feature modules (auth, dashboard, medical-id, etc.)
│   │   │   └── shared/         # Reusable components (autocomplete, mascot, etc.)
│   │   ├── assets/i18n/        # Translation files (en.json, fr.json)
│   │   └── styles.css          # Global styles + design tokens
│   └── angular.json            # Build configuration
│
├── .github/
│   ├── .vibehealth/            # This skill system
│   ├── .angular/               # Angular 21 reference docs
│   ├── .hono/                  # Hono framework reference
│   ├── .gsap/                  # Animation reference (Motion.dev patterns)
│   └── copilot-instructions.md # Build/test commands
│
└── roadmap.md                  # Product roadmap with phases
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| **Runtime** | Bun | 1.x | Fast JS runtime for backend |
| **API** | Hono | 4.x | Ultrafast web framework |
| **ORM** | Prisma | 7.x | Type-safe PostgreSQL client |
| **Database** | PostgreSQL | 16 | Primary data store |
| **Auth** | BetterAuth | 1.x | Email/password, OAuth, magic links |
| **Frontend** | Angular | 21.x | Standalone components + signals |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **Animation** | Motion.dev | 12.x | `motion/mini` for DOM, ngx-lottie for vectors |
| **Lottie** | ngx-lottie | 20.x | Complex vector animations (mascot, icons) |
| **i18n** | ngx-translate | 16.x | FR + EN locales |
| **PWA** | Service Worker | - | Offline caching via ngsw |

---

## 📜 Subskills Reference

This skill system is modular. Load these subskills as needed:

| Subskill | File | Purpose |
|----------|------|---------|
| **Frontend Development** | `frontend.md` | Angular 21 patterns, component architecture, signals |
| **Backend Development** | `backend.md` | Hono routes, Prisma patterns, BetterAuth |
| **Design System** | `design.md` | "Soft Pop" aesthetic, tokens, component styling |
| **Testing** | `testing.md` | Unit tests, E2E patterns, coverage requirements |
| **Prompts** | `prompts.md` | Reusable prompts for common tasks |
| **Claude Instructions** | `claude.md` | Claude-specific guidance and examples |

---

## ⚡ Quick Commands

### Development
```bash
# Full stack (from root)
npm run dev

# Backend only (from backend/)
bun run dev

# Frontend only (from frontend/)
npm start
```

### Build & Test
```bash
# Backend
cd backend && bun run lint && bun run typecheck && bun test && bun run build

# Frontend
cd frontend && npm run lint && npm run test -- --watch=false --browsers=ChromeHeadless && npm run build
```

### Database
```bash
cd backend
bun run db:generate   # Generate Prisma client
bun run db:push       # Push schema to database
bun run db:migrate    # Run migrations
bun run db:studio     # Open Prisma Studio
```

---

## 🎨 Design Philosophy

### "Soft Pop" Aesthetic
- **Colors**: Warm gradients (coral → peach), soft shadows, organic shapes
- **Typography**: Satoshi from Fontshare for both display and body, generous spacing
- **Motion**: Subtle float animations, radial-spread CTA micro-interactions, spiral-loader for loading states, and progress-ring back-to-top controls
- **Feedback**: Gooey-style toast notifications for success/error/info states
- **Texture**: Noise overlays for depth, no harsh `backdrop-filter: blur` (performance)

### Component Patterns
- **Cards**: Rounded corners (1.5rem+), soft shadows, gradient borders
- **Buttons**: Pill-shaped, hover lift effects, emoji accents
- **Inputs**: Floating labels, soft focus rings, autocomplete dropdowns
- **Chips**: Removable tags for multi-select fields

---

## 🔒 Critical Conventions

### Frontend (Angular 21)
1. **Standalone components only** — no NgModules
2. **Signals for state** — use `signal()`, `computed()`, never `mutate()`
3. **Native control flow** — `@if`, `@for`, `@switch` (not `*ngIf`, `*ngFor`)
4. **OnPush change detection** — always set in `@Component`
5. **inject() function** — not constructor injection
6. **input()/output() functions** — not decorators
7. **Readonly signals** — expose `.asReadonly()` from services

### Backend (Hono + Bun)
1. **API versioning** — all routes under `/api/v1`, preserve `/health`
2. **Prisma patterns** — consistent `@@map()` for table names
3. **Auth middleware** — use `requireAuth` for protected routes
4. **Type safety** — strict TypeScript, no `any`

### i18n
1. **Both locales required** — every string in `en.json` must exist in `fr.json`
2. **Flat keys** — use dot notation: `"onboarding.step1.title"`
3. **Interpolation** — `{{ 'key' | translate:params }}`

---

## 📚 External Documentation References

When working on specific technologies, refer to these embedded docs:

- **Angular 21**: `.github/.angular/llms-full.txt` (16k lines of official docs)
- **Hono**: `.github/.hono/llms-full.txt` (14k lines of official docs)
- **Anime.js v4**: `.github/.gsap/CLAUDE.md` (critical: v4 syntax differs from v3!)
- **GSAP**: `.github/.gsap/llms.txt` (for ScrollTrigger if needed)

---

## 🚀 Current Implementation Status

### Phase 0 — Foundation ✅ (Mostly Complete)
- ✅ Project scaffold (Bun + Hono + Angular PWA)
- ✅ Docker Compose + PostgreSQL
- ✅ CI/CD pipeline
- ✅ i18n (FR + EN)
- ✅ Authentication & accounts
- ✅ Onboarding wizard with autocomplete
- ✅ Bunny mascot + carrot rewards
- ✅ Medical ID with QR code
- ✅ Design system + shared components
- ⏳ First Aid guide (offline-first)

### Next Phases (See roadmap.md)
- Phase 1: Vitals, Activity, Nutrition, Hydration, Goals
- Phase 2: Medicines, Health Checks, Vaccines, Guides
- Phase 3: Mood, Periods, Journal, Workouts, Relaxation
- Phase 4: Sharing, Export, Calendar Sync
- Phase 5: Practitioner Map, Health Platform Sync

---

## 🧪 Quality Gates

Before merging any code:

1. **Lint passes**: `bun run lint` (backend), `npm run lint` (frontend)
2. **Types pass**: `bun run typecheck` (backend), builds without errors
3. **Tests pass**: `bun test` (backend), `npm test -- --watch=false` (frontend)
4. **Build succeeds**: `npm run build` (both)
5. **i18n complete**: Both `en.json` and `fr.json` updated
6. **Accessibility**: WCAG AA compliance, focus management

---

## 🤝 Collaboration Guidelines

When multiple LLMs work on this project:

1. **Read this file first** — understand the full context
2. **Check subskills** — load relevant `.md` files for specific tasks
3. **Follow conventions** — consistency > personal preference
4. **Update docs** — if you add patterns, document them
5. **Test everything** — verify changes work before committing

---

*Last updated: March 2026*
*Maintained by: VibeHealth Team*
