---
description: "Design frontend UI/UX for a VibeHealth roadmap feature using frontend design skill guidance"
name: "Roadmap Frontend Design"
argument-hint: "Feature to design (e.g., 'Hydration tracker dashboard and quick-log flow')"
agent: "agent"
---
Create a frontend design package for the selected VibeHealth feature.

References:
- [Roadmap](../../roadmap.md)
- [Project notes](../../README.md)
- [Frontend design skill](../../.prompts/frontend_design_SKILL.md)

## Design context (always apply)
- **Framework**: Angular 21 + Tailwind CSS
- **Platform**: PWA (mobile-first, installable, offline-capable)
- **Animations**: animate.js for micro-interactions
- **i18n**: all text via ngx-translate — no hardcoded strings
- **Mascot**: bunny 🐰 with states (idle, happy, sad, encouraging) — integrate where it adds delight
- **Dark mode**: required for every screen

## Mandatory behavior
1. Start by reading and applying the **[frontend design skill](../../.prompts/frontend_design_SKILL.md)**.
2. Produce:
   - User flows (happy path + edge/error paths)
   - Information architecture and screen map
   - Component breakdown and reusable design tokens (reference existing design system from Phase 0)
   - Interaction states (loading, empty, error, success)
   - Accessibility checks (WCAG 2.1 AA basics: contrast, focus, ARIA)
   - Responsive strategy (mobile-first PWA — 320px → 768px → 1280px breakpoints)
3. Output implementation-ready guidance for Angular + Tailwind, including component names and data bindings.
4. Specify which strings need FR and EN translations.
5. End with a handoff checklist for engineering.

Keep output concrete, concise, and directly actionable for the phase implementation prompts.
