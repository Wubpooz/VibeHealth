# 🎨 VibeHealth Design System

> **Purpose**: Complete design system reference for the "Soft Pop" aesthetic used in VibeHealth.

---

## 🌈 Design Philosophy

### "Soft Pop" Aesthetic

VibeHealth uses a distinctive **"Soft Pop"** design language characterized by:

- **Organic shapes** — Rounded corners, blob backgrounds, flowing curves
- **Warm gradients** — Coral to peach transitions, never harsh
- **Playful motion** — Float animations, spring-based micro-interactions
- **Textured depth** — Subtle noise overlays instead of flat colors
- **Generous whitespace** — Breathing room, not cramped layouts

### Design Principles

1. **Warmth over coldness** — No clinical blues or sterile whites
2. **Soft over sharp** — Rounded everything, no 90° corners
3. **Playful over serious** — The bunny mascot sets the tone
4. **Accessible over trendy** — WCAG AA compliance always
5. **Fast over fancy** — No `backdrop-filter: blur` (performance killer)

---

## 🎨 Color Palette

### Primary Colors

```css
:root {
  /* Coral → Peach gradient (primary brand) */
  --color-coral: #ff6b6b;
  --color-coral-light: #ff8787;
  --color-peach: #ffa07a;
  --color-peach-light: #ffcc80;
  
  /* Gradient definitions */
  --gradient-primary: linear-gradient(135deg, #ff6b6b 0%, #ffa07a 50%, #ffcc80 100%);
  --gradient-warm: linear-gradient(135deg, #fff5f2 0%, #fff 100%);
  --gradient-sunset: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
}
```

### Accent Colors

```css
:root {
  /* Complementary accents */
  --color-mint: #b8e6d4;
  --color-mint-light: #d4f5e9;
  --color-lavender: #c5b4e3;
  --color-lavender-light: #e0d6f0;
  --color-sky: #87ceeb;
  --color-sky-light: #b0e0f0;
  
  /* Functional colors */
  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-error: #f87171;
  --color-info: #60a5fa;
}
```

### Neutral Colors

```css
:root {
  /* Warm neutrals */
  --color-bg: #fffaf8;
  --color-bg-soft: #fff5f2;
  --color-surface: #ffffff;
  --color-border: rgba(255, 107, 107, 0.1);
  --color-border-hover: rgba(255, 107, 107, 0.2);
  
  /* Text colors */
  --color-text: #2d3436;
  --color-text-secondary: #636e72;
  --color-text-muted: #b2bec3;
}
```

### Dark Mode (Optional)

```css
[data-theme="dark"] {
  --color-bg: #1a1a2e;
  --color-bg-soft: #16213e;
  --color-surface: #1f1f3a;
  --color-text: #f5f5f5;
  --color-text-secondary: #a0a0a0;
}
```

---

## 📝 Typography

### Font Stack

```css
:root {
  /* Display font (headings) */
  --font-display: 'Satoshi', 'Avenir Next', 'Segoe UI', sans-serif;
  
  /* Body font (text) */
  --font-body: 'Satoshi', 'Avenir Next', 'Segoe UI', sans-serif;
  
  /* Mono font (code) */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Font Source

```css
/* Fontshare */
@import url('https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap');
```

### Font Sizes (Fluid Scale)

```css
:root {
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);
  --text-3xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem);
  --text-4xl: clamp(2.25rem, 1.75rem + 2.5vw, 3rem);
}
```

### Typography Styles

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

body {
  font-family: var(--font-body);
  font-weight: 400;
  line-height: 1.6;
}

.text-gradient {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 📐 Spacing Scale

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

---

## 🔲 Border Radius

```css
:root {
  --radius-sm: 0.5rem;    /* 8px - small elements */
  --radius-md: 0.75rem;   /* 12px - buttons, inputs */
  --radius-lg: 1rem;      /* 16px - cards */
  --radius-xl: 1.5rem;    /* 24px - large cards, modals */
  --radius-2xl: 2rem;     /* 32px - hero sections */
  --radius-full: 9999px;  /* pill shapes */
}
```

---

## 🌑 Shadows

```css
:root {
  /* Soft shadows (default) */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.08);
  --shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.1);
  
  /* Colored shadows (for hover states) */
  --shadow-coral: 0 8px 25px rgba(255, 107, 107, 0.35);
  --shadow-mint: 0 8px 25px rgba(184, 230, 212, 0.35);
  --shadow-lavender: 0 8px 25px rgba(197, 180, 227, 0.35);
}
```

---

## 🎴 Component Styles

### Cards

```css
.card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card-gradient {
  background: var(--gradient-warm);
}

.card-featured {
  background: var(--gradient-primary);
  color: white;
}
```

### Buttons

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  box-shadow: var(--shadow-coral);
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border: 2px solid var(--color-border);
}

.btn-secondary:hover {
  border-color: var(--color-coral);
}

.btn-ghost {
  background: transparent;
  color: var(--color-coral);
  border: none;
}

.btn-ghost:hover {
  background: var(--color-bg-soft);
}
```

### Inputs

```css
.input {
  width: 100%;
  padding: var(--space-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-base);
  background: var(--color-surface);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-coral);
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.input::placeholder {
  color: var(--color-text-muted);
}
```

### Chips/Tags

```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: var(--color-bg-soft);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--color-text);
}

.chip-coral {
  background: rgba(255, 107, 107, 0.15);
  color: var(--color-coral);
}

.chip-removable {
  padding-right: var(--space-1);
}

.chip-remove {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 🎬 Animation Patterns

### Keyframes

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Usage

```css
.floating {
  animation: float 3s ease-in-out infinite;
}

.pulsing {
  animation: pulse-soft 2s ease-in-out infinite;
}

.entrance {
  animation: fade-in-up 0.5s ease-out forwards;
}

/* Staggered entrance */
.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
```

### Signature Micro-Interactions

```css
/* Radial-spread CTA button (Framer icon-slide-in-button inspired) */
.slide-in-cta {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.slide-in-cta::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 0;
  height: 0;
  background: #e11d48; /* single accent color */
  border-radius: 50%;
  transform: translate(-50%, 50%);
  transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1), height 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}

.slide-in-cta:hover::before,
.slide-in-cta:focus-visible::before {
  /* Expand radially from bottom center */
  width: 300%;
  height: 300%;
}

.slide-in-cta__icon {
  transform: translateX(-4px);
  opacity: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.slide-in-cta:hover .slide-in-cta__icon,
.slide-in-cta:focus-visible .slide-in-cta__icon {
  transform: translateX(0);
  opacity: 1;
}

/* Spiral dot-field loader (Framer spiral inspired) */
/* Use the <app-spiral-loader> component for loading states */
/* See frontend/src/app/shared/components/spiral-loader/ */
```

### Animated Icon Guidance

- Prefer the `<app-animated-icon>` component for standard icons (check-circle, heart, bell, etc.)
- Animate only `transform`, `opacity`, and SVG stroke-dash offsets when possible.
- For custom icons inspired by Lucide animated icons, recreate the interaction in Angular using CSS keyframes/transitions.
- Keep icon animation subtle and meaningful (hover/focus state, not constant distraction).
- Available animated icons: `check-circle`, `shield-check`, `heart`, `bell`, `download`, `loader`, `arrow-right`, `sparkles`.

### Toast Motion Language

- Toasts should feel organic and lively (goey-toast inspired), but remain readable and fast.
- Use layered blob accents + small entrance motion, with clear tone colors (`success`, `error`, `info`, `warning`).
- Keep toasts dismissible and time-bound, and honor reduced-motion preferences.

### Scroll-to-Top Progress Pattern

- Use a floating circular control that doubles as a scroll progress indicator.
- Progress ring should represent `scrollY / (scrollHeight - clientHeight)`.
- Keep hover interaction subtle; do not block content or primary actions.
- Use transparent background with only the progress ring and arrow visible (no solid button background).

### 404 Page Pattern

- Use the "A Color Bright" inspired style with interactive eye-tracking.
- Eyes follow the cursor using JavaScript-driven pupil transforms.
- Display "4 0 4" where the 4s are represented by pairs of tracking eyes.
- Maintain colorful orb decorations without blur (solid circles).
- Keep background warm and light (#fffbf5) with subtle grain texture.

### Anime.js v4 Patterns

```typescript
// Simple entrance (single line)
animate('.card', { opacity: [0, 1], y: [20, 0], duration: 0.5, ease: 'outQuad' });

// Staggered list
animate('.list-item', { opacity: [0, 1], y: [20, 0], delay: stagger(0.1), duration: 0.5, ease: 'outQuad' });

// Hover lift
element.addEventListener('mouseenter', () => animate(element, { y: -4, duration: 0.2, ease: 'outQuad' }));
element.addEventListener('mouseleave', () => animate(element, { y: 0, duration: 0.2, ease: 'outQuad' }));
```

---

## 🖼️ Background Patterns

### Noise Texture

```css
.with-noise {
  position: relative;
}

.with-noise::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}
```

### Gradient Mesh Background

```css
.gradient-mesh {
  background: 
    radial-gradient(ellipse at 20% 80%, rgba(255, 107, 107, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(184, 230, 212, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(197, 180, 227, 0.1) 0%, transparent 50%),
    var(--color-bg);
}
```

### Organic Blob

```css
.blob {
  position: absolute;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  background: var(--gradient-primary);
  opacity: 0.1;
  animation: blob-morph 8s ease-in-out infinite;
}

@keyframes blob-morph {
  0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
  50% { border-radius: 60% 40% 30% 70% / 50% 60% 50% 40%; }
}
```

---

## ♿ Accessibility Requirements

### Color Contrast
- All text must meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Interactive elements must have visible focus states
- Don't rely on color alone to convey meaning

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--color-coral);
  outline-offset: 2px;
}
```

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile first approach */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

---

## ⚠️ Performance Constraints

### Avoid These
- `backdrop-filter: blur()` — Major performance hit, especially on mobile
- Heavy box-shadows on many elements — Use sparingly
- Large unoptimized images — Always use WebP/AVIF with `NgOptimizedImage`
- Layout-triggering animations — Use `transform` and `opacity` only

### Prefer These
- CSS `transform` for all motion
- `will-change: transform` on animated elements (sparingly)
- `contain: layout` on complex components
- Lazy loading for below-fold content

---

*This design system ensures visual consistency and performance across all VibeHealth interfaces.*
