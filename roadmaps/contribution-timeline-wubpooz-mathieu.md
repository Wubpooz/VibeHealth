# VibeHealth Contribution Timeline: Wubpooz + Mathieu

> Generated from repository git history (main branch) + roadmaps.

## Overall Stats (from git log)
- Author `Wubpooz`
  - Total lines added: **106,187**
  - Total lines deleted: **7,059**
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
- `2026-03-27` - `68923cc`: implementation and slides docs (roadmap implementation material/technical docs).
- `2026-03-29` - `ff16098`: mascot SVG asset updates (`rabbit_standing.svg`, `rabbit_thinking.svg`, etc.).
- `2026-03-29` - `85c76a2`: folder refactor (design/mascotte path cleanup and file movement).
- `2026-03-29` - `56dfd16`: translations and `preferredCountryCode` in `Profile` model.
- `2026-03-29` - `f78330f`: user settings fields, auth wiring and profile update integration.
- `2026-03-29` - `a8dbd95`: roadmap refresh.
- `2026-03-29` - `e97aa02`: de-ai emoji upgrade for UI reward/metric components.
- `2026-03-29` - `d51a6c5`: rewards page feature addition.
- `2026-03-29` - `ad1e4fc`: hydration UI rework placement.

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
