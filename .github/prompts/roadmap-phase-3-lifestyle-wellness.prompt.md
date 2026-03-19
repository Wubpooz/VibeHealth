---
description: "Implement one Phase 3 Lifestyle & Wellness feature (mood, period, journal, workouts, relaxation, focus)"
name: "VibeHealth Phase 3 Builder"
argument-hint: "Phase 3 feature to implement (e.g., '3.6 Focus Helper')"
agent: "agent"
---
Implement one **Phase 3 — Lifestyle & Wellness** feature from [roadmap.md](../../roadmap.md).

## Phase 3 scope (roadmap §3.1–3.6)
- **3.1** Mood Tracker — emoji scale + tags, trend correlation (sleep, activity, weather), daily/weekly reflections, bunny empathy
- **3.2** Period Tracker — cycle logging, predictions, **pill reminders** (web push + device push + email), symptom trends, pregnancy-mode switch
- **3.3** Journaling — rich entries (Markdown, images, audio, video, locations), tags, calendar view, media gallery, **offline capability** (Service Worker cache)
- **3.4** Workouts Tab — exercise suggestions by profile, categories, plans, timer/rep counter, post-workout summary linked to vitals
- **3.5** Relaxation & Meditation — ambient sounds, guided audio, timer, session history, streaks
- **3.6** Focus Helper — Pomodoro/custom timer, bunny carrot reward loop, leave penalty, stats/streaks, DND hint

## Execution requirements
1. Convert feature idea into concrete user flows and acceptance criteria from `roadmap.md`.
2. Implement backend (Hono + Zod + Prisma) + frontend (Angular components) + storage links as needed.
3. Address edge cases: privacy (journal sharing), media handling (upload, compression, thumbnails), notification timing, timezone-awareness.
4. Integrate bunny mascot reactions where applicable (mood, focus, streaks).
5. Add all new user-facing strings to FR and EN translation files.
6. Add tests for core logic and critical flows.
7. Summarize shipped behavior and known constraints.

For screen/UX-heavy work, run `/Roadmap Frontend Design` before implementation.
