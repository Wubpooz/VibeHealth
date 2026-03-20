# 📝 VibeHealth Reusable Prompts

> **Purpose**: Copy-paste prompts for common development tasks in VibeHealth.

---

## 🏗️ Creating New Features

### New Angular Component

```markdown
Create a new Angular 21 component for [FEATURE NAME].

Requirements:
- Follow the patterns in `.github/.vibehealth/frontend.md`
- Use signals for state management
- Use `input()` and `output()` functions (not decorators)
- Use native control flow (`@if`, `@for`, `@switch`)
- Set `changeDetection: ChangeDetectionStrategy.OnPush`
- Use `inject()` for dependencies
- Add translations to both `en.json` and `fr.json`
- Follow the "Soft Pop" design aesthetic (see `design.md`)

The component should:
[DESCRIBE WHAT THE COMPONENT DOES]

Files to create/modify:
- `frontend/src/app/features/[feature]/[component].component.ts`
- `frontend/src/assets/i18n/en.json`
- `frontend/src/assets/i18n/fr.json`
```

### New Hono Route

```markdown
Create a new Hono route for [FEATURE NAME].

Requirements:
- Follow the patterns in `.github/.vibehealth/backend.md`
- Place under `/api/v1/[route-name]`
- Use `requireAuth` middleware for protected endpoints
- Use Prisma for database operations
- Handle errors with try/catch and appropriate HTTP status codes
- Return consistent response shapes ({ item }, { items }, { error })

Endpoints needed:
- GET /api/v1/[route] - [DESCRIBE]
- POST /api/v1/[route] - [DESCRIBE]
- PUT /api/v1/[route]/:id - [DESCRIBE]
- DELETE /api/v1/[route]/:id - [DESCRIBE]

Files to create/modify:
- `backend/src/routes/[feature].routes.ts`
- `backend/src/index.ts` (register route)
- `backend/prisma/schema.prisma` (if new model needed)
```

### New Service

```markdown
Create a new Angular service for [SERVICE NAME].

Requirements:
- Follow the patterns in `.github/.vibehealth/frontend.md`
- Use `@Injectable({ providedIn: 'root' })`
- Use signals for state (private writable, public readonly)
- Use `computed()` for derived state
- Use `inject()` for HttpClient
- Handle loading/error states

The service should:
[DESCRIBE WHAT THE SERVICE DOES]

Files to create:
- `frontend/src/app/core/[service]/[service].service.ts`
```

---

## 🔧 Modifying Existing Code

### Add Autocomplete to Form

```markdown
Add autocomplete functionality to [FIELD NAME] in [COMPONENT].

Requirements:
- Use the existing `AutocompleteComponent` from `@shared/components/autocomplete`
- Fetch options from `ReferenceDataService` (or create new endpoint if needed)
- Support multi-select with chips
- Allow custom entries with `[allowCustom]="true"`
- Preserve existing form structure

Reference: See `frontend/src/app/features/onboarding/onboarding.component.ts` for example usage.
```

### Add Translation Keys

```markdown
Add translation keys for [FEATURE/COMPONENT].

Requirements:
- Add keys to BOTH `en.json` and `fr.json`
- Use nested structure: `"feature.section.key": "value"`
- Include all user-facing strings
- Use placeholders for dynamic values: `"greeting": "Hello, {{name}}"`

Keys needed:
- [LIST THE KEYS AND THEIR ENGLISH VALUES]
```

### Add Prisma Model

```markdown
Add a new Prisma model for [MODEL NAME].

Requirements:
- Follow existing schema patterns in `backend/prisma/schema.prisma`
- Use `@@map()` for table name (snake_case)
- Add proper relations to User model
- Include `createdAt` and `updatedAt` timestamps
- Use `onDelete: Cascade` for user relations

Model should have:
- [LIST FIELDS AND TYPES]

After creation:
1. Run `bun run db:generate`
2. Run `bun run db:push` (or `db:migrate` for production)
```

---

## 🐛 Bug Fixes

### Fix Component Issue

```markdown
Fix issue in [COMPONENT NAME]: [DESCRIBE THE BUG]

Current behavior:
[WHAT HAPPENS NOW]

Expected behavior:
[WHAT SHOULD HAPPEN]

Steps to reproduce:
1. [STEP 1]
2. [STEP 2]
3. [OBSERVE BUG]

Please:
1. Identify the root cause
2. Implement a fix following existing patterns
3. Ensure no regressions
4. Add test coverage if appropriate
```

### Fix API Issue

```markdown
Fix issue in [ROUTE]: [DESCRIBE THE BUG]

Current behavior:
[WHAT HAPPENS NOW]

Expected behavior:
[WHAT SHOULD HAPPEN]

Request example:
```
[METHOD] /api/v1/[route]
Body: { ... }
```

Please:
1. Identify the root cause
2. Fix the issue
3. Ensure proper error handling
4. Test the fix
```

---

## 🎨 Design Tasks

### Apply Soft Pop Styling

```markdown
Apply "Soft Pop" styling to [COMPONENT/FEATURE].

Requirements:
- Follow the design system in `.github/.vibehealth/design.md`
- Use the color palette (coral, peach, warm gradients)
- Use rounded corners (1rem+ for cards, 9999px for buttons)
- Add soft shadows (not harsh drop shadows)
- Use Satoshi typography from Fontshare (`https://api.fontshare.com/v2/css?f[]=satoshi...`)
- Include subtle animations (fade-in, float, icon slide-in CTA where relevant)
- Consider spiral dot-field animation for hero sections when context fits
- Use animated inline SVG icons for trust badges and affordances when possible
- Use goey-style toast feedback for action success/error states where appropriate
- Add scroll-to-top progress controls on long pages when discoverability is useful
- For wildcard routes, prefer a custom branded 404 page instead of redirecting silently
- NO `backdrop-filter: blur` (performance)

Specific elements to style:
- [LIST ELEMENTS]
```

### Add Animation

```markdown
Add animation to [ELEMENT/INTERACTION].

Requirements:
- Use Anime.js v4 syntax (see `.github/.gsap/CLAUDE.md`)
- Use `animate()` not `anime()`
- Use `ease:` not `easing:`
- Keep simple animations on single line
- Use seconds for duration (not milliseconds)

Animation should:
- Trigger on: [load / hover / click / scroll]
- Properties: [opacity, y, scale, etc.]
- Duration: [X seconds]
- Easing: [outQuad, outElastic, etc.]
```

---

## 🧪 Testing Tasks

### Write Component Tests

```markdown
Write tests for [COMPONENT NAME].

Requirements:
- Follow patterns in `.github/.vibehealth/testing.md`
- Mock services with signals
- Test rendering, inputs, outputs
- Test user interactions
- Use `data-testid` attributes for selectors

Test cases needed:
- [ ] Component creates successfully
- [ ] Displays loading state
- [ ] Displays data when loaded
- [ ] Handles empty state
- [ ] [COMPONENT-SPECIFIC TESTS]
```

### Write API Tests

```markdown
Write tests for [ROUTE NAME] routes.

Requirements:
- Follow patterns in `.github/.vibehealth/testing.md`
- Test auth requirements
- Test success cases
- Test validation errors
- Test not found cases
- Clean up test data

Test cases needed:
- [ ] GET returns 401 without auth
- [ ] GET returns items for authenticated user
- [ ] POST creates item
- [ ] POST validates required fields
- [ ] PUT updates existing item
- [ ] DELETE removes item
```

---

## 📚 Documentation Tasks

### Document Component

```markdown
Add documentation for [COMPONENT NAME].

Include:
- Purpose and usage
- Inputs and Outputs
- Example usage in template
- Styling customization options
- Accessibility considerations

Format as JSDoc comments in the component file.
```

### Update Roadmap

```markdown
Update roadmap.md to reflect current progress.

Changes:
- Mark [FEATURE] as complete (✅)
- Update phase status
- Add any new learnings to "Resolved Decisions"
```

---

## 🔄 Refactoring Tasks

### Extract Reusable Component

```markdown
Extract [FUNCTIONALITY] from [CURRENT LOCATION] into a reusable component.

Requirements:
- Create in `frontend/src/app/shared/components/[name]/`
- Make it configurable via inputs
- Emit events via outputs
- Document usage with examples
- Update original component to use the new shared component

The extracted component should:
- [DESCRIBE REUSABLE FUNCTIONALITY]
```

### Optimize Performance

```markdown
Optimize performance of [COMPONENT/FEATURE].

Current issues:
- [DESCRIBE PERFORMANCE ISSUE]

Please:
1. Identify the bottleneck
2. Implement optimizations following these guidelines:
   - Use OnPush change detection
   - Use trackBy for @for loops
   - Lazy load if possible
   - Avoid backdrop-filter: blur
   - Use transform/opacity for animations
3. Measure improvement
```

---

## 🌐 i18n Tasks

### Add New Language

```markdown
Add support for [LANGUAGE CODE] ([LANGUAGE NAME]).

Steps:
1. Create `frontend/src/assets/i18n/[code].json`
2. Copy structure from `en.json`
3. Translate all strings
4. Add language option to language selector

Note: Ensure all keys from en.json are present in the new file.
```

---

## 📋 Code Review Prompts

### Review Changes

```markdown
Review the following code changes for [FEATURE/FIX]:

Check for:
- [ ] Follows Angular 21 patterns (signals, standalone, inject())
- [ ] Follows Hono patterns (versioned routes, auth middleware)
- [ ] Follows "Soft Pop" design aesthetic
- [ ] Has proper error handling
- [ ] Has test coverage
- [ ] Has i18n support (both locales)
- [ ] No performance anti-patterns
- [ ] Accessible (WCAG AA)

Please provide specific feedback on any issues found.
```

---

*Copy these prompts and fill in the [PLACEHOLDERS] for your specific task.*
