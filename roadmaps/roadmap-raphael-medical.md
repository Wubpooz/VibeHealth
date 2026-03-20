# 🏥 Medical Intel Team Roadmap (Care)

> **Focus**: Medical reference data, push notification reminders, cron jobs, and 3rd-party/offline API integrations.

## Technical Boundaries
- **API Namespace**: `/api/v1/medical/*` (managed in `backend/src/routes/medical.routes.ts`)
- **Database Scope**: Focus on persistent static tracking (`MEDICATION`, `MEDICATION_REMINDER`, `SIDE_EFFECT`, `APPOINTMENT`)
- **Frontend Scope**: `frontend/src/app/features/medical/*`

---

## Milestone 1: First Aid & Guides (Offline First)
- [ ] Configure Angular Service Workers to forcefully cache First Aid content.
- [ ] Build offline-first, quick-reference First Aid cards UI (burns, CPR, choking).
- [ ] Implement an offline-accessible local helpline directory (one-tap call links).
- [ ] Integrate a condition library and markdown document renderer for health articles.

## Milestone 2: Medication & Reminders
- [ ] Add `MEDICATION` and `MEDICATION_REMINDER` to `schema.prisma`.
- [ ] Create Hono CRUD routes to list, add, edit, and stop tracking medicines.
- [ ] Build the Frontend UI to schedule doses, set duration, and view upcoming refill alerts.
- [ ] Write Backend workers/crons to dispatch Web Push and Email notifications.

## Milestone 3: External Intelligence & Sync
- [ ] Hook into OpenFDA (or ANSM open data) to display potential side effects and interactions.
- [ ] Integrate a 3rd-party Pollen Tracking API to broadcast daily levels dynamically based on location.
- [ ] Build the Appointment tracker (with recommended screenings based on user profile age/sex).
- [ ] Plan Doctor Maps API integration (Free open APIs like OpenStreetMap) for finding nearby specialists.
