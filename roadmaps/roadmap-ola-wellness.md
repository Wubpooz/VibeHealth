# 🧘 Mind & Wellness Team Roadmap (Lifestyle)

> **Focus**: Subjective tracking, rich media journaling, user engagement hooks, and audio playback.

## Technical Boundaries
- **API Namespace**: `/api/v1/wellness/*` (managed in `backend/src/routes/wellness.routes.ts`)
- **Database Scope**: Focus on subjective and session-based logs (`MOOD_LOG`, `PERIOD_LOG`, `JOURNAL_ENTRY`, `MEDIA_ATTACHMENT`, `FOCUS_SESSION`)
- **Frontend Scope**: `frontend/src/app/features/wellness/*`

---

## Milestone 1: Mood & Journal Foundations
- [ ] Add `MOOD_LOG` and `JOURNAL_ENTRY` (with `MEDIA_ATTACHMENT`) to `schema.prisma`.
- [ ] Develop Hono CRUD routes to create text/rich-media entries and daily mood reflections.
- [ ] Build the Journal Frontend UX (List view, Calendar View, tag/mood filtering).
- [ ] Implement image/audio uploader logic attached to Journal entries.

## Milestone 2: Period & Cycle Tracker
- [ ] Add `PERIOD_LOG` to `schema.prisma`.
- [ ] Implement algorithms/math for period cycle prediction (next period, fertile window).
- [ ] Build the Frontend UI (cycle logging: flow intensity, symptoms logs).
- [ ] Allow configuring contraceptive pill reminders (with snooze support via device push).

## Milestone 3: Relaxation & Focus Sessions
- [ ] Add `FOCUS_SESSION` to `schema.prisma`.
- [ ] Implement an Ambient Audio player for relaxation modes (background sounds, timer logic).
- [ ] Build the Focus Helper Pomodoro screen locking mechanism.
- [ ] Wire the Focus Timer to the Bunny Mascot (penalize early exit, reward with carrots for completed sessions).
- [ ] Develop dynamic "streak" API aggregations for tracking consistent meditation or focus.
