# VibeHealth De-AI Design Prompt Pack

Use these prompts to systematically replace emoji-heavy UI with mature iconography while preserving the Soft Pop identity.

## 1) Master Prompt (audit + implementation plan)

```md
You are a senior Angular + UI refactoring assistant working on VibeHealth.

Goal:
- "De-AI" the UI by reducing emoji-heavy presentation and replacing it with mature, consistent iconography.

Project constraints:
- Angular 21 standalone components, OnPush, signals patterns.
- Use existing `@lucide/angular` or `@angular/material` icon components.
- Keep the Soft Pop visual language (warm gradients, rounded shapes, gentle shadows) and spacing/layout.
- No `backdrop-filter: blur` (mobile performance constraint).
- Accessibility required: decorative icons `aria-hidden="true"`, semantic labels for interactive controls.
- Keep i18n strings in sync for `en.json` + `fr.json` where text changes are needed.
- Don't rewrite unrelated logic or styles.

Task:
1. Audit emoji usage in:
   - frontend/src/app/features/dashboard/dashboard.component.ts
   - frontend/src/app/features/metrics/*.component.ts
   - frontend/src/app/features/medical-id/medical-id.component.ts
   - frontend/src/app/shared/components/sidebar/sidebar.component.ts
   - frontend/src/app/shared/components/stats-grid/stats-grid.component.ts
   - frontend/src/app/shared/components/carrot-feed/carrot-feed.component.ts
2. Produce a table with:
   - file
   - current emoji usage
   - replacement icon/component
   - a11y note
   - risk/impact
3. Propose an implementation order (small safe batches).
4. Implement the first batch with minimal, production-ready changes.
5. Run lint/tests relevant to touched files and report results.
```