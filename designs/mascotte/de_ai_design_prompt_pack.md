# VibeHealth De-AI Design Prompt Pack

Use these prompts to systematically replace emoji-heavy UI with mature iconography while preserving the Soft Pop identity.

## 1) Master Prompt (audit + implementation plan)

```md
You are a senior Angular + UI refactoring assistant working on VibeHealth.

Goal:
- "De-AI" the UI by reducing emoji-heavy presentation and replacing it with mature, consistent iconography.

Project constraints:
- Angular 21 standalone components, OnPush, signals patterns.
- Use existing `@lucide/angular` icon components (prefer `Lucide*` imports).
- Keep the Soft Pop visual language (warm gradients, rounded shapes, gentle shadows).
- No `backdrop-filter: blur` (mobile performance constraint).
- Accessibility required: decorative icons `aria-hidden="true"`, semantic labels for interactive controls.
- Keep i18n strings in sync for `en.json` + `fr.json` where text changes are needed.

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

## 2) Per-file Refactor Prompt (small batch, safe)

```md
Refactor only the following file(s) to remove or reduce emoji-based UI:
- [PASTE FILES]

Rules:
- Replace emoji visuals with `@lucide/angular` icons when possible.
- Keep existing behavior unchanged.
- Preserve spacing/layout and Soft Pop feel.
- Do not rewrite unrelated logic.
- Add `aria-hidden="true"` for decorative icons and accessible text labels for controls.
- If text copy changes are required, update both:
  - frontend/src/assets/i18n/en.json
  - frontend/src/assets/i18n/fr.json

Return:
- exact diff summary
- any i18n keys added/changed
- commands run and results
```

## 3) Icon Mapping Prompt (consistency pass)

```md
Create a VibeHealth emoji-to-icon mapping dictionary for reuse across the app.

Requirements:
- Prefer Lucide icon names already used in repo when possible.
- One canonical icon per concept (home, vitals, activity, nutrition, warning, success, rewards, etc.).
- Include size guidance and color token guidance for:
  - default
  - hover/active
  - muted/disabled

Output format:
- JSON-like mapping + short usage notes.
```

## 4) Accessibility Verification Prompt

```md
Review current icon replacements for accessibility.

Check:
- Decorative icons have `aria-hidden="true"`.
- Interactive icon-only buttons have clear accessible names.
- Color contrast still meets WCAG AA.
- No information is conveyed by color alone.
- Focus states remain visible after style changes.

Return:
- issues found
- exact file/line references
- minimal fixes
```

## 5) Final QA Prompt (before merge)

```md
Perform final QA for the De-AI pass.

Validate:
1. Emoji usage removed/reduced in targeted files.
2. Icon style is consistent with VibeHealth Soft Pop design.
3. i18n parity maintained (en/fr keys aligned).
4. No regressions in component behavior.
5. Lint/tests/build results reported.

Provide:
- checklist with ✅/❌
- remaining follow-ups (if any)
```

## 6) Suggested Rollout Batches

1. **Navigation surfaces first**  
   Sidebar + stats-grid (high visibility, low risk).
2. **Dashboard + carrot-feed**  
   Most user-facing "tone" cleanup.
3. **Metrics feature pages**  
   Replace logger and state-message emojis with icons/illustrations.
4. **Medical ID and remaining edge surfaces**  
   Final consistency + a11y sweep.
