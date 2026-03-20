# 🐰 VibeHealth LLM Context System

> A comprehensive skill system for AI-assisted development of VibeHealth.

## 📁 File Index

| File | Purpose | When to Load |
|------|---------|--------------|
| **SKILL.md** | Master overview, architecture, quick reference | Always load first |
| **claude.md** | Claude-specific patterns and examples | When using Claude |
| **frontend.md** | Angular 21 development guide | Frontend tasks |
| **backend.md** | Hono + Prisma development guide | Backend tasks |
| **design.md** | "Soft Pop" design system | Styling tasks |
| **testing.md** | Testing patterns and requirements | Writing tests |
| **prompts.md** | Copy-paste prompts for common tasks | Task templates |

## 🔗 External Reference Documentation

These files contain full documentation for the technologies used:

| File | Technology | Size |
|------|------------|------|
| `.github/.angular/llms-full.txt` | Angular 21 | ~16k lines |
| `.github/.hono/llms-full.txt` | Hono Framework | ~14k lines |
| `.github/.gsap/CLAUDE.md` | Anime.js v4 | ~400 lines |
| `.github/.gsap/llms.txt` | GSAP (if needed) | ~500 lines |

## 🚀 Quick Start for LLMs

1. **Always start with**: Load `SKILL.md` for project context
2. **For your model**: Load `claude.md` for Claude-specific guidance
3. **Then load task-specific files**:
   - Frontend work → `frontend.md`
   - Backend work → `backend.md`
   - Styling work → `design.md`
   - Testing work → `testing.md`
4. **Need detailed docs?** Load the relevant `llms-full.txt` file

## 🔄 Auto-load Integration

To make discovery automatic for agents in this repository:

- `.github/copilot-instructions.md` includes the bootstrap load order.
- Root `README.md` links this context system for human and agent discovery.

Recommended agent startup behavior:
1. Load `.github/.vibehealth/SKILL.md`
2. Load model/task-specific files (for example `frontend.md`, `backend.md`, `design.md`, `testing.md`)
3. Load deep framework references only when needed (`.github/.angular/llms-full.txt`, `.github/.hono/llms-full.txt`, `.github/.gsap/*`)

## 📋 Key Files in Repository

```
vibehealth/
├── roadmap.md                    # Product roadmap with all phases
├── README.md                     # Project overview
├── .github/
│   ├── copilot-instructions.md   # Build/test commands
│   ├── .vibehealth/              # This skill system (YOU ARE HERE)
│   ├── .angular/                 # Angular reference docs
│   ├── .hono/                    # Hono reference docs
│   └── .gsap/                    # Animation reference docs
├── backend/                      # Bun + Hono + Prisma
└── frontend/                     # Angular 21 PWA
```

## 🎯 Current Project Status

**Phase 0 — Foundation**: ~90% Complete
- ✅ Auth, Onboarding, Medical ID, Design System
- ⏳ First Aid Guide (remaining)

See `roadmap.md` for full details.

---

*This system ensures consistent, high-quality AI-assisted development across the VibeHealth codebase.*
