---
description: "Orchestrate implementation of one VibeHealth roadmap scope end-to-end"
name: "VibeHealth Roadmap Orchestrator"
argument-hint: "Phase + feature scope to implement (e.g., 'Phase 1 - Hydration Tracking')"
agent: "agent"
---
Use this prompt to implement **one selected scope** from the VibeHealth roadmap with production-quality steps.

References:
- [Roadmap](../../roadmap.md)
- [Project notes](../../README.md)

Task:
1. Confirm the selected roadmap scope and restate acceptance criteria.
2. Inspect the codebase and identify impacted layers (API, DB, frontend, tests, infra).
3. Produce a short implementation checklist and execute it incrementally.
4. Add/update tests and validate with lint/typecheck/test/build.
5. Summarize changed files, verification results, and remaining follow-ups.

Constraints:
- Keep changes scoped to the selected roadmap item.
- Prefer minimal, testable increments.
- If the selected scope includes UI/UX, run the dedicated frontend design prompt first (`/Roadmap Frontend Design`).
- If required environment variables are introduced, ensure `.env` exists with safe placeholders.
