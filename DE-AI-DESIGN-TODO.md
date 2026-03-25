# De-AI Design TODO

Goal: Reduce emoji-based UI and replace with proper icons, SVG illustrations, or images for a more mature product design.

## High-level tasks

1. Audit all emoji usage in the app, including:
   - Sidebar nav labels and icons (e.g. '🏠', '💓', etc.)
   - Dashboards, metrics cards, toasts, success messages
   - Modal and button labels (e.g. `🩺`, `⚠️`)
   - Auth flow prompts, onboarding, and embedded text

2. For each emoji occurrence:
   - Replace with a corresponding `@lucide/angular` icon where available.
   - If no icon is available, use a curated SVG illustration asset.
   - If an image is more appropriate (e.g. detailed health status), use a responsive `img` or `picture` element.

3. Maintain accessibility:
   - `aria-hidden="true"` on decorative icons
   - semantic labels for interactive buttons

4. Update global styling and theming:
   - Use CSS utility classes for icon color states (default/active/hover)
   - Remove explicit `fill`/`stroke` emoji color hacks when replaced

5. Document the design direction in `DESIGN.md`:
   - “Soft Pop” style with consistent iconography
   - eliminate in-line emojis in production UI

## Priority components

- `frontend/src/app/features/dashboard/dashboard.component.ts`
- `frontend/src/app/features/metrics/*.component.ts`
- `frontend/src/app/features/medical-id/medical-id.component.ts`
- `frontend/src/app/shared/components/sidebar/sidebar.component.ts`
- `frontend/src/app/shared/components/stats-grid/stats-grid.component.ts`
- `frontend/src/app/shared/components/carrot-feed/carrot-feed.component.ts`

## Validation

- Run `npm run lint` and `npm run test -- --watch=false --browsers=ChromeHeadless`
- Peer review via a11y checks for contrast and icon labels
