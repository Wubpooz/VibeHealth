# Angular 21 compatibility investigation: `InputSignalWithTransform` brand mismatch

## Summary

This document captures the investigation and recommended fix for Angular 21 template errors like:

- `TS2551: Property '__@ɵINPUT_SIGNAL_BRAND_WRITE_TYPE@...' does not exist on type 'InputSignalWithTransform<boolean, unknown>'`

Observed in template bindings such as:

- `<i-arrow-right [animate]="btn2Hover()" />`
- `<i-shield-check [animate]="true" />`

---

## Error signature (what we saw)

The failures happen in templates using icon inputs:

- `[animate]="btn2Hover()"`
- `[animate]="true"`

Angular compiler message pattern:

- `Did you mean '__@ɵINPUT_SIGNAL_BRAND_WRITE_TYPE@5930'` (or a different numeric suffix)

The changing suffix values are important clues.

---

## Investigation performed

### 1) Confirmed icon input implementation

In this repository, icon components define `animate` as a signal input with transform, e.g.:

- `animate = input(false, { transform: booleanAttribute });`

This is valid modern Angular API usage.

### 2) Checked repo Angular/toolchain versions

Workspace is on Angular 21 (`@angular/* ~21.0.0`) and TypeScript 5.9.x.

### 3) Identified path alias risk

`tsconfig.base.json` maps:

- `"ng-animated-icons": ["packages/animated-icons/src/index.ts"]`

Consuming raw library source from app builds can create separate type identity contexts.

### 4) Interpreted error semantics

The internal branded field mismatch (`...@2591` vs `...@5930`) strongly indicates **type identity mismatch** for Angular signal input types, not a runtime template bug.

---

## Root cause

The issue is typically caused by **multiple Angular type identities in the same build graph**.

In practice this happens when one or more of these are true:

1. Duplicate `@angular/core` instances exist in dependency tree.
2. Library is consumed as raw source via TS path mapping instead of built package.
3. Linked package setup (`npm link` / symlinked workspaces) causes different Angular resolution contexts.

When that happens, template checker compares `InputSignalWithTransform` from identity A against identity B, and branded internal fields do not match.

---

## Recommended fix

### A) Ensure single Angular identity

- Pin all `@angular/*` packages in the app to the same `21.x` line.
- Remove duplicate installs.
- Reinstall dependencies cleanly.

### B) Avoid consuming raw source for app usage

Do **not** use a TS path alias from app directly to:

- `packages/animated-icons/src/index.ts`

Instead consume either:

- published package (`ng-animated-icons`), or
- built artifact from `dist/packages/animated-icons`.

### C) Avoid link setups that reintroduce Angular duplication

If using `npm link`/symlink workflows, switch to packed/built installation where possible.

### D) Optional temporary template workaround

For static truthy usage you can use boolean attribute form:

- `<i-shield-check animate />`

For dynamic values keep `[animate]="..."` after A–C are fixed.

Use `$any(...)` only as temporary escape hatch.

---

## Verification checklist

After applying fixes:

- [ ] `@angular/core` resolves once for the app build.
- [ ] App no longer imports library via raw source path alias.
- [ ] `ng serve` / `nx serve` compiles without TS2551 errors.
- [ ] Both static and dynamic animate bindings compile:
  - [ ] `<i-check animate />`
  - [ ] `<i-arrow-right [animate]="btn2Hover()" />`

---

## Notes for this repository

- Library icon input usage (`input(..., { transform: booleanAttribute })`) is correct.
- The reported error pattern matches consumer-environment resolution issues more than library API misuse.
- Keep Angular as peer dependency in the package, and avoid app-level path aliasing to raw source for integration tests of published behavior.

---

## Quick command hints (consumer app)

Use your package manager equivalents:

1. Remove lockfile + `node_modules`
2. Reinstall cleanly
3. Ensure only one Angular core instance is installed
4. Replace source alias consumption with package/built artifact consumption

(Exact commands vary by npm/pnpm/yarn/bun and app layout.)
