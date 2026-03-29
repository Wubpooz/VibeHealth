# Design System Specification: Editorial Organicism

## 1. Overview & Creative North Star
**The Creative North Star: "The Ethereal Companion"**
This system rejects the cold, sterile nature of traditional health interfaces in favor of a "Ethereal Companion" aesthetic. It blends the playful warmth of our bunny mascot with a high-end, editorial layout style. We break the "template" look by using intentional white space, dramatic typographic scale shifts, and glassmorphism to create a UI that feels like a premium digital magazine rather than a utility tool.

**Design Philosophy:**
*   **Intentional Asymmetry:** Avoid perfectly centered grids. Lean into weighted compositions where the mascot or hero text anchors one side, allowing the "Glass Panels" to float with a sense of gravity and purpose.
*   **Soft Power:** We use generous rounding (2xl-3xl) to communicate safety and friendliness, but we maintain "Premium" status through sophisticated tonal layering and the total absence of harsh structural lines.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a "Vibrant Rose" core, supported by "Sage Green" accents. However, the secret to the premium feel lies in the neutral "Surface" tiers.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. All spatial boundaries must be created through background shifts. 
*   Place a `surface-container-low` (#f7f2f2) card on a `surface` (#fdf8f8) background.
*   The contrast is felt, not seen. This creates a "seamless" interface that feels organic and high-end.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of frosted glass and fine paper:
*   **Base Layer:** `surface` (#fdf8f8).
*   **Sectioning:** `surface-container-low` (#f7f2f2) for large background groupings.
*   **Primary Cards:** `surface-container-lowest` (#ffffff) to provide the highest "pop" and cleanest readability.
*   **Interaction States:** Use `surface-bright` for hover states to create a subtle "glow" effect.

### The Glass & Gradient Rule
To prevent a "flat" appearance, use **Glassmorphism** for floating elements (headers, navigation bars, modal overlays):
*   **Background:** `white/80` (or `surface-container-lowest` at 80% opacity).
*   **Backdrop Blur:** 12px to 20px.
*   **Signature Texture:** Apply a linear gradient from `primary` (#b90538) to `primary_container` (#dc2c4f) for main CTAs. This adds "soul" and depth that a flat hex code cannot achieve.

---

## 3. Typography
We use a high-contrast pairing to balance playfulness with editorial authority.

*   **Headings (Outfit):** Set with tight letter-spacing (-0.02em) and bold weights. "Outfit" provides a geometric, friendly punch that mirrors the curves of the mascot.
*   **Body (Plus Jakarta Sans):** A modern, highly legible typeface that feels sophisticated and airy.

**Scale Highlights:**
*   **Display-LG:** 3.5rem (Outfit Bold). Use for hero welcome states (e.g., "Good morning, [Name] 🐰").
*   **Headline-MD:** 1.75rem (Outfit Bold). Used for major section headers.
*   **Body-LG:** 1.0rem (Plus Jakarta Sans). The standard for all narrative text.
*   **Label-MD:** 0.75rem (Plus Jakarta Sans Bold, All Caps). Used for eyebrow headers or tiny metadata.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** and **Ambient Light**, never through heavy drop shadows.

*   **The Layering Principle:** Stack `surface-container-lowest` cards on `surface-container-low` backgrounds. This creates a "Soft Lift."
*   **Ambient Shadows:** For floating glass panels, use a shadow with a 24px-32px blur, but keep the opacity at 4%-6%. The shadow color must be a tinted version of `on-surface` (#1c1b1c), creating a natural, warm depth rather than a "dirty" grey.
*   **The "Ghost Border" Fallback:** If a container requires a border for accessibility (e.g., on a white background), use `outline_variant` at **15% opacity**. A 100% opaque border is strictly prohibited.

---

## 5. Components

### Glass Panels (The Signature Component)
The core container for this system.
*   **Background:** `surface-container-lowest` @ 80% opacity.
*   **Blur:** 16px Backdrop Blur.
*   **Edge:** 1px Ghost Border (15% opacity `outline_variant`).
*   **Radius:** `3xl` (3rem).

### Buttons
*   **Primary:** Gradient (`primary` to `primary_container`), `full` radius, `on_primary` text. Use a subtle shadow that matches the primary color.
*   **Secondary:** `secondary_container` background with `on_secondary_container` text. No border.
*   **Tertiary:** Ghost style. No background, `primary` text weight bold.

### Emoji-Based Icons
Avoid standard line-art icons. Icons should be housed in "Pill" containers:
*   **Container:** `surface-container-high` or a tinted version of `secondary_container`.
*   **Content:** A single expressive Emoji. This reinforces the "Friendly Bunny" brand personality.

### Inputs & Fields
*   **Background:** `surface-container-highest`.
*   **Radius:** `md` (1.5rem).
*   **State:** On focus, the border-variant shifts to `primary` at 40% opacity with a soft outer glow.

### Navigation
*   **Desktop (Sidebar):** A vertical glass panel floating on the left. Use `title-md` for labels.
*   **Mobile (Bottom Bar):** A docked glass panel with `backdrop-blur`. Icons are larger, label text is `label-sm`.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use the Bunny Mascot as a functional element (e.g., peeking from behind a glass card to point at a notification).
*   **Do** embrace vertical white space. If you think there is enough space between sections, add 1.4rem (`spacing-4`) more.
*   **Do** use "Sage Green" (`secondary`) specifically for success states and health-positive growth metrics.

### Don’t:
*   **Don’t** use dividers or lines. Use a `0.7rem` (`spacing-2`) background color shift instead.
*   **Don’t** use "Outfit" for body text. It is too "loud" for long-form reading and ruins the editorial balance.
*   **Don’t** use sharp corners. Every element, including images and input fields, must adhere to the `md` to `3xl` rounding scale.
*   **Don’t** use pure black (#000000) for text. Always use `on_surface` (#1c1b1c) to maintain the "Warm Premium" aesthetic.