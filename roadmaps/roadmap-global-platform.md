# 🌍 Global Platform Roadmap (Shared/Foundation)

> **Focus**: Cross-cutting features, final polish, compliance, privacy, and shared infra.

## Technical Boundaries
- **API Namespace**: `/api/v1/user/*` or shared middleware setup.
- **Database Scope**: Account permissions (`SHARED_ACCESS`) and core privacy settings.
- **Frontend Scope**: Core `app.component`, print layouts, data portals.

---

## Milestone 1: Privacy & Data Sharing (Phase 4)
- [ ] Add `SHARED_ACCESS` to `schema.prisma`.
- [ ] Build UI flows for patients to invite relatives/caregivers via email or link.
- [ ] Implement granular permission checks in backend middleware (who can read what data).
- [ ] Build the "Read-Only Dashboard" experience for caregivers.

## Milestone 2: Export & Data Portability (Phase 4)
- [ ] Add backend endpoints to export Medical ID as a printable PDF.
- [ ] Add backend endpoints to export ALL health data as a CSV or ZIP archive.
- [ ] Build the frontend Data Export wizard with category filters/date range selection.
- [ ] Support scheduled exports (e.g. weekly/monthly summary email via useSend).

## Milestone 3: Hardening & Compliance (Phase 5)
- [ ] Accessibility audit: Ensure WCAG 2.1 AA compliance (contrast, screen readers, focus traps).
- [ ] Performance optimization: Lazy loading, caching, CDN setup.
- [ ] Security audit & penetration test (check for IDORs, weak CORS, missing CSRF).
- [ ] GDPR compliance center: Data deletion flow, consent management, privacy dashboard.

## Milestone 4: Localization & Community (Phase 5)
- [ ] Validate FR & EN translations are 100% complete across all new features.
- [ ] Ensure dynamic/reference content (medicine names, helpline numbers, and help websites) is properly internationalized based on the user's localized region.
- [ ] Structure the app to easily accept community-contributed translation packs.
