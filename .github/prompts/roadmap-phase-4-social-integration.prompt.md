---
description: "Implement one Phase 4 Social & Integration feature (sharing, export, calendar/Doctolib, pregnancy)"
name: "VibeHealth Phase 4 Builder"
argument-hint: "Phase 4 feature to implement (e.g., '4.2 Export & Data Portability')"
agent: "agent"
---
Implement one **Phase 4 — Social & Integration** feature from [roadmap.md](../../roadmap.md).

## Phase 4 scope (roadmap §4.1–4.4)
- **4.1** Data Sharing with Relatives — invite via email/link, granular permissions, read-only caregiver dashboard, revoke access, activity feed
- **4.2** Export & Data Portability — Medical ID → PDF, health data → PDF/CSV/ZIP, date range + category filters, scheduled exports (weekly/monthly **email**)
- **4.3** Calendar & Doctolib Sync — iCal sync, Doctolib integration (via adapter — free API or manual import fallback), appointment reminders, two-way sync
- **4.4** Pregnancy Tracking — week-by-week guides, kick counter, contraction timer, appointment schedule, symptom log, postpartum transition

## Execution requirements
1. Define permissions and privacy boundaries first — sharing uses the caregiver role from BetterAuth.
2. Implement sync/export flows with robust error handling and retries.
3. External integrations (Doctolib, iCal) go behind adapter interfaces so providers can be swapped.
4. Add auditability where data sharing occurs (who accessed what, when).
5. Add all new user-facing strings to FR and EN translation files.
6. Add/adjust tests for permission and serialization paths.
7. Validate and summarize user-visible behavior.

If new screens/components are involved, run `/Roadmap Frontend Design` first.
