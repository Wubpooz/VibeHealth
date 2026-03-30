# VibeHealth Contribution Timeline: Wubpooz + Mathieu

> Generated from repository git history (main branch) + roadmaps.

## Overall Stats (from git log)
- Author `Wubpooz`
  - Total lines added: **119,576**
  - Total lines deleted: **10,836**
- Author `mathieu`
  - Total lines added: **212,374**
  - Total lines deleted: **14,118**

## High-level feature areas (roadmap alignment)
### Phase 0 (Foundation)
- Project scaffold, auth, profile, medical ID, offline-first First Aid, i18n, mascot + rewards, design system.

### Phase 1 (Core Health Metrics)
- Hydration, vitals, activity, nutrition, goals, workouts foundations, sync contract placeholders.

### Phase 2 (Medical Intelligence)
- Medicines, reminders, health checks, vaccines, condition library, articles, pollen tracking.

### Phase 3 (Lifestyle & Wellness)
- Mood tracker, period tracker, journaling, relaxation, focus helper.

### Phase 4 (Social & Integrations)
- Export, calendar sync, sharing, caregiver feature.

## Selected Timeline for Wubpooz (March 2026)
- `2026-03-30` - `a5a0eee`: code review of my changes. (13 files changed, +77, -52)
- `2026-03-30` - `9214cb3`: enhance meal type breakdown display with no meals logged message. (2 files changed, +917, -427)
- `2026-03-30` - `22fca19`: migrate all data to database; removed hardcoded onboarding types; language selection in settings; country selection UX improvements; wiki localization enhancements. (30 files changed, +7029, -1834)
- `2026-03-30` - `760ef88`: autocomplete in the side effect lookup. (2 files changed, +46, -6)
- `2026-03-30` - `0978a71`: fix medical ID not visible. (1 file changed, +10, -2)
- `2026-03-30` - `f63c8c9`: update skills. (8 files changed, +41, -1)
- `2026-03-30` - `5afbc49`: page headers gradients removed, now Lucide icon components. (10 files changed, +41, -22)
- `2026-03-30` - `6fd0781`: fix header scrolling with page. (1 file changed, +1, -1)
- `2026-03-30` - `50db710`: improved workout page colors, UI, examples. (3 files changed, +840, -209)
- `2026-03-30` - `58cdd65`: improved vitals UI/UX (tooltips, customization, custom date range, easier input). (4 files changed, +1376, -235)
- `2026-03-30` - `f19de79`: use a consistent header style across all pages. (12 files changed, +211, -158)
- `2026-03-30` - `81e1b61`: improved wiki view new entries and better UI/UX. (3 files changed, +290, -71)
- `2026-03-30` - `48ee4e8`: linked user data across the app. (3 files changed, +309, -45)
- `2026-03-30` - `10d65f6`: added wiki entries. (5 files changed, +289, -238)
- `2026-03-30` - `418bcee`: UI examples - TO USE. (9 files changed, +0, -0)
- `2026-03-30` - `95bad06`: improve vital dashboard UI/UX. (2 files changed, +595, -291)
- `2026-03-30` - `56395ca`: merge main branch updates. (merge commit, no file stats)
- `2026-03-30` - `4c568aa`: merge wellness branch into main (ola-hn). (merge commit, no file stats)
- `2026-03-29` - `ad1e4fc`: hydration UI rework placement. (1 file changed, +11, -4)
- `2026-03-29` - `d51a6c5`: rewards page feature addition. (5 files changed, +794, -2)
- `2026-03-29` - `e97aa02`: de-ai emoji upgrade for UI reward/metric components. (12 files changed, +496, -163)
- `2026-03-29` - `a8dbd95`: roadmap refresh. (2 files changed, +16, -16)

## Selected Timeline for Mathieu (by commit message context)
- `2026-03-?` - `2e0ede2`: email OTP/magic link + forgot password + i18n and auth flows.
- `2026-03-?` - `71ca336`: metrics workout sync + roadmap markers.
- `2026-03-?` - `dac7cbc`: README + roadmap status updates for metrics.
- `2026-03-?` - `47fd295`: workouts snapshot + roadmap completion marker.
- `2026-03-?` - `8f21134`: medical ID export/share + OAuth placeholder sync.

## Key repo files touched by these authors
- backend/src/routes/metrics.routes.ts
- backend/src/routes/profile.routes.ts
- backend/src/lib/prisma.ts
- backend/src/tests/unit/profile.routes.test.ts
- frontend/src/app/core/auth/auth.service.ts
- frontend/src/app/core/profile/profile.service.ts
- frontend/src/app/features/metrics/* (dashboard, hydration, activity, nutrition, goals, workouts)
- frontend/src/app/features/settings/settings.component.ts
- frontend/src/app/features/rewards/rewards-page.component.ts
- frontend/src/assets/i18n/en.json, fr.json
- roadmaps/roadmap-ola-wellness.md, roadmap.md

## Notes
- Summary focuses on explicit git history for `Wubpooz` and `mathieu`; there may also be merge commits with other users (raphael, ola, copilot branches).
- Timeline is based on available head commits from repository and the existing roadmap discipline in `roadmap.md` and `roadmap-mathieu-metrics.md`.

## How to regenerate
1. `git log --all --author='Wubpooz|mathieu' --numstat --pretty=format:'%h|%ad|%an|%s' --date=short`
2. `git log --all --author='Wubpooz' --numstat --pretty=format:'...` etc.
3. use `Select-String` and line-sum aggregation for totals in PowerShell.
