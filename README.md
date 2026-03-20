# 🐰 VibeHealth

> Your personal health companion - A comprehensive health tracking and wellness application

VibeHealth is a modern, full-stack Progressive Web Application (PWA) designed to help users track their health, manage medications, monitor vitals, and maintain overall wellness. Built with a friendly bunny mascot to encourage healthy habits!

## 🚀 Tech Stack

### Backend
- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime
- **API Framework**: [Hono](https://hono.dev) - Lightweight web framework
- **ORM**: [Prisma](https://www.prisma.io) - Type-safe database client
- **Database**: PostgreSQL 16
- **Validation**: [Zod](https://zod.dev) - TypeScript-first schema validation
- **Authentication**: BetterAuth

### Frontend
- **Framework**: [Angular 18](https://angular.io) - Modern web framework
- **Styling**: [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- **Animations**: animate.js
- **PWA**: Service Worker with offline support
- **i18n**: ngx-translate (French & English)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Reverse Proxy**: nginx (production)

## 📋 Features Roadmap

### Phase 0 — Foundation (Current Phase)
- ✅ Project scaffold with Bun + Hono + Angular PWA
- ✅ Docker Compose setup with PostgreSQL
- ✅ CI pipeline (lint → typecheck → test → build)
- ✅ i18n support (FR + EN)
- ✅ Service Worker for offline capabilities
- ✅ Authentication & user accounts
- ✅ Onboarding wizard with smart autocomplete
- ✅ Bunny mascot system
- ✅ Medical ID with QR code
- ✅ Design system & shared UI components
- ⏳ First aid guide (offline-first)

### Future Phases
See [roadmap.md](./roadmap.md) for complete feature breakdown.

## 🏗️ Project Structure

\`\`\`
vibehealth/
├── backend/
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic
│   │   ├── schemas/      # Zod validation schemas
│   │   ├── middleware/   # Custom middleware
│   │   └── index.ts      # Application entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   ├── tests/            # Backend tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/          # Angular components
│   │   └── assets/
│   │       └── i18n/     # Translation files (en.json, fr.json)
│   └── package.json
├── docker-compose.yml    # Development environment
└── .github/
    └── workflows/        # CI/CD pipelines
\`\`\`

## 🤖 AI Agent Discovery & Auto-Load Context

VibeHealth includes an LLM context system for consistent multi-agent collaboration.

- Entry point: `.github/.vibehealth/SKILL.md`
- Index: `.github/.vibehealth/README.md`
- Subskills:
  - `.github/.vibehealth/frontend.md`
  - `.github/.vibehealth/backend.md`
  - `.github/.vibehealth/design.md`
  - `.github/.vibehealth/testing.md`
  - `.github/.vibehealth/prompts.md`
  - `.github/.vibehealth/claude.md`

Framework references for deep lookup:
- Angular 21: `.github/.angular/llms-full.txt`
- Hono: `.github/.hono/llms-full.txt`
- Animation refs: `.github/.gsap/CLAUDE.md`, `.github/.gsap/llms.txt`

Agent behavior convention: load `.github/.vibehealth/SKILL.md` first, then load task-specific subskills.

## 🛠️ Development Setup

### Prerequisites
- [Bun](https://bun.sh) >= 1.0
- [Node.js](https://nodejs.org) >= 20
- [Docker](https://www.docker.com) & Docker Compose
- [PostgreSQL](https://www.postgresql.org) (or use Docker)

### Quick Start

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/Wubpooz/VibeHealth.git
cd VibeHealth
\`\`\`

2. **Set up environment variables**
\`\`\`bash
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration
\`\`\`

3. **Start with Docker Compose** (Recommended)
\`\`\`bash
npm run docker:up
\`\`\`

This will start:
- PostgreSQL database on port 5432
- Backend API on http://localhost:3000
- Frontend on http://localhost:4200

4. **Or run locally**

Backend:
\`\`\`bash
cd backend
bun install
bun run db:generate
bun run db:push
bun run dev
\`\`\`

Frontend:
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

### Available Scripts

Root level:
- \`npm run dev\` - Start both backend and frontend
- \`npm run build\` - Build both projects
- \`npm test\` - Run all tests
- \`npm run docker:up\` - Start Docker services
- \`npm run docker:down\` - Stop Docker services
- \`npm run docker:logs\` - View Docker logs

Backend:
- \`bun run dev\` - Start development server
- \`bun run build\` - Build for production
- \`bun test\` - Run tests
- \`bun run lint\` - Lint code
- \`bun run db:generate\` - Generate Prisma client
- \`bun run db:push\` - Push schema to database
- \`bun run db:studio\` - Open Prisma Studio

Frontend:
- \`npm start\` - Start development server
- \`npm run build\` - Build for production
- \`npm test\` - Run tests
- \`npm run lint\` - Lint code

## 🔒 Environment Variables

Create a \`backend/.env\` file based on \`.env.example\`:

\`\`\`env
DATABASE_URL=postgresql://vibehealth:vibehealth_dev@localhost:5432/vibehealth
PORT=3000
NODE_ENV=development
AUTH_SECRET=your-secret-key
AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:4200
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run all tests
npm test

# Backend tests only
cd backend && bun test

# Frontend tests only
cd frontend && npm test
\`\`\`

## 📦 Building for Production

\`\`\`bash
# Build both projects
npm run build

# Or build individually
npm run build:backend
npm run build:frontend
\`\`\`

## 🚢 Deployment

The application can be deployed using Docker:

\`\`\`bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

## 🌍 Internationalization

VibeHealth supports multiple languages from day one:
- 🇬🇧 English (en)
- 🇫🇷 French (fr)

Translation files are located in \`frontend/src/assets/i18n/\`.

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome! Please open an issue to discuss proposed changes.

## 📄 License

This project is private and for portfolio purposes.

## 🙏 Acknowledgments

- Health data sources: OpenFDA, ANSM open data
- Icons and assets: To be determined
- Bunny mascot: Custom design

---

Built with ❤️ using modern web technologies
