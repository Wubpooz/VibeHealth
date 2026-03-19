---
description: "Implement one Phase 2 Medical Intelligence feature (medicines, vaccines/checks, guides, pollen)"
name: "VibeHealth Phase 2 Builder"
argument-hint: "Phase 2 feature to implement"
agent: "agent"
---
Implement one **Phase 2 — Medical Intelligence** feature from `roadmap.md`.

Scope includes:
- Medicine tracker/reminders and side effects/integrations
- Health checks and vaccine planning/reminders
- Guides/articles and content pipeline
- Pollen tracking and alerts

Execution requirements:
1. Define data contracts and external adapter boundaries.
2. Implement resilient integrations (timeouts, fallback handling, caching where needed).
3. Preserve privacy/security constraints for health data.
4. Add tests (unit + integration-level where practical).
5. Report assumptions and mock/stub strategy for external APIs.

If frontend flows/screens are part of scope, invoke `/Roadmap Frontend Design` first.
