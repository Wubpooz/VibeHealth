# Design System Strategy: The Soft Pop Aesthetic

## 1. Overview & Creative North Star: "The Living Canvas"
This design system rejects the clinical, rigid structures of traditional health tech in favor of **The Living Canvas**. Our goal is to create a digital environment that feels breathable, organic, and perpetually in motion. By moving away from "boxy" layouts and harsh dividers, we embrace a high-end editorial feel that prioritizes human warmth over mechanical efficiency.

The "Soft Pop" aesthetic is defined by its intentional asymmetry and tonal depth. We use large-scale typography to anchor the eye, while "blob" backgrounds and flowing curves create a sense of natural movement. This isn't just a UI; it’s an invitation to wellness that feels as premium as a boutique lifestyle magazine.

---

## 2. Colors & Surface Philosophy
The palette is rooted in sunset warmth, balanced by cool, minty refreshments. We utilize a Material-inspired token system to ensure programmatic consistency while maintaining a bespoke visual soul.

### The "No-Line" Rule
**Strict Mandate:** Prohibit the use of 1px solid borders for sectioning or containment. 
Boundaries must be defined exclusively through:
*   **Background Shifts:** e.g., A `surface-container-low` section placed against a `surface` background.
*   **Tonal Transitions:** Using the Spacing Scale (Token 24 / 8.5rem) to create "islands" of content rather than walled gardens.

### Surface Hierarchy & Nesting
Treat the interface as a physical stack of fine, semi-translucent paper.
*   **Layer 0 (Base):** `surface` (#fff4f0).
*   **Layer 1 (Large Containers):** `surface-container-low` (#faeeea).
*   **Layer 2 (Interactive Cards):** `surface-container-highest` (#e7dad5).
*   **The Glass Rule:** For floating elements (Modals, Navigation Bars), use a 70% opacity version of `surface-container-lowest` with a `backdrop-filter: blur(20px)`. This "frosted glass" effect allows the organic "blobs" in the background to bleed through, softening the interface.

### Signature Textures & Gradients
Apply a subtle 3% monochromatic noise texture to the `background` to eliminate "digital flatness." 
*   **Primary Gradient:** `primary` (#aa2c32) to `primary-container` (#ff7574) at a 135° angle. Use this for Hero CTAs and high-impact visual moments.

---

## 3. Typography: Editorial Authority
We utilize **Satoshi** and **Plus Jakarta Sans** to create a sophisticated hierarchy that feels both modern and authoritative.

*   **Display (Plus Jakarta Sans):** Used for "Vibe Moments"—large, welcoming headers that break the grid. The fluid scale allows these to breathe across device sizes.
*   **Headlines (Plus Jakarta Sans):** Bold, high-contrast anchors for content blocks.
*   **Body (Be Vietnam Pro):** Chosen for its exceptional legibility and neutral character, allowing the accent colors to shine without competition.
*   **Hierarchy Note:** Always lead with high contrast. A `display-lg` headline should be paired with generous `24` (8.5rem) spacing to ensure the "Editorial" feel is maintained.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are largely forbidden. We achieve depth through the **Layering Principle**.

*   **The Ambient Shadow:** When an element must "float" (e.g., a primary action button), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(170, 44, 50, 0.08)`. The shadow color must be a tinted version of the `primary` or `on-surface` color, never pure black or grey.
*   **The Ghost Border Fallback:** If accessibility requires a stroke (e.g., high-contrast mode), use `outline-variant` at **10% opacity**. It should be felt, not seen.
*   **Nesting Logic:** Place `surface-container-lowest` cards on a `surface-container-low` section to create a soft, natural lift that mimics natural light.

---

## 5. Components: Softness with Purpose

### Buttons: The Pill Concept
*   **Primary:** Pill-shaped (`rounded-full`), using the Primary Gradient. On hover, apply a `box-shadow` tinted to #ff6b6b with a 12px blur.
*   **Secondary:** Pill-shaped, `surface-container-highest` background with `primary` text. No border.
*   **Tertiary:** Text-only with a subtle `primary` underline that expands on hover.

### Input Fields: The Recessed Look
*   **Styling:** Use `surface-container-highest` with a `rounded-md` (1.5rem) corner. 
*   **Interaction:** On focus, transition the background to `surface-container-lowest` and apply a 2px "Ghost Border" using `primary_dim`.

### Cards & Lists: The No-Divider Standard
*   **Standard:** Use vertical whitespace (Token 8 or 10) to separate list items. 
*   **Alternative:** Use a alternating background shift—every second item receives a `surface-container-low` fill with a `32px` corner radius. **Never use a horizontal line.**

### Additional Signature Components
*   **The "Blob" Accent:** A decorative background component using `tertiary_container` with a `border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%` to break the geometric monotony.
*   **Progress Orbs:** Instead of linear bars, use organic, expanding circular shapes in `mint` (#b8e6d4) to track health metrics.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Intentional Asymmetry:** Shift text blocks slightly off-center when paired with organic "blob" illustrations.
*   **Embrace Moderate Radii:** Stick to the `rounded-md` (1.5rem) radius for major layout containers to maintain the "Soft" identity.
*   **Leverage Tonal Color:** Use `on-primary-container` for text on colored backgrounds to ensure WCAG AA compliance while staying in-palette.

### Don’t:
*   **Don't use 1px borders:** This instantly breaks the "Soft Pop" premium feel.
*   **Don't use pure greys:** All neutrals must be warmed with peach/coral undertones (refer to `surface-variant` and `outline`).
*   **Don't crowd the content:** If it feels full, add more `24` (8.5rem) spacing. The design must breathe to feel "healthy."