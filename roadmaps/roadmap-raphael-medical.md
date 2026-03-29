# 🏥 Medical Intel Team Roadmap (Care)

> **Focus**: Medical reference data, push notification reminders, cron jobs, and 3rd-party/offline API integrations.

## Technical Boundaries
- **API Namespace**: `/api/v1/medical/*` (managed in `backend/src/routes/medical.routes.ts`)
- **Database Scope**: Focus on persistent static tracking (`MEDICATION`, `MEDICATION_REMINDER`, `SIDE_EFFECT`, `APPOINTMENT`)
- **Frontend Scope**: `frontend/src/app/features/medical/*`

---

## Milestone 1: First Aid & Guides (Offline First)
- [x] Configure Angular Service Workers to forcefully cache First Aid content.
- [x] Build offline-first, quick-reference First Aid cards UI representing 8 emergency procedures (CPR, Choking, Burns, etc.).
- [x] Implement severity tiers (🚨 Critical / ⚠️ Urgent / 💙 Moderate) with color-coded cards, keyword search, and severity filter pills.
- [x] Add expandable step-by-step accordions with numbered steps.
- [x] Implement an offline-accessible local helpline directory (one-tap call links) including a sticky emergency call button always in the header. **Ensure helpline numbers and help websites are internationalized per region**.
- [x] Integrate a condition library and markdown document renderer for health articles.
- [x] Add a settings page where the user can change their country.

## Milestone 2: Medication & Reminders
- [x] Add `MEDICATION` and `MEDICATION_REMINDER` to `schema.prisma`.
- [x] Create Hono CRUD routes to list, add, edit, and stop tracking medicines. **Ensure medicine names are internationalized or mapped to universal standards (e.g. WHO INN)**.
- [x] Build the Frontend UI to schedule doses, set duration, and view upcoming refill alerts.
- [x] Write Backend workers/crons to dispatch Web Push and Email notifications.

## Milestone 3: External Intelligence & Sync
- [x] Hook into OpenFDA (or ANSM open data) to display potential side effects and interactions.
- [ ] Integrate a 3rd-party Pollen Tracking API to broadcast daily levels dynamically based on location.
- [ ] Build the Appointment tracker (with recommended screenings and vaccines based on user profile age/sex).
- [ ] Plan Doctor Maps API integration (Free open APIs like OpenStreetMap) for finding nearby specialists.

## Milestone 4: Calendar & Doctolib Sync
- [ ] Add 2-way iCal sync for appointments and medication reminders.
- [ ] Integrate Doctolib OAuth (or manual import flow) to pull upcoming appointments and prep notes automatically.
