# Mascotte Design
## Tools
### Overall workflow
A solid end‑to‑end pipeline for a web/app mascot:  
1. Generate several mascot concepts with an AI mascot generator (raster or SVG).
2. Redraw/clean one concept as a proper vector (SVG) in Figma, Inkscape, etc.
3. Rig and animate it in a vector‑friendly motion tool (Rive / Jitter / SVGenius).
4. Export to web‑friendly formats (inline SVG, Lottie, or Rive runtime) and integrate in your app.


### Step 1 – AI tools to generate base mascot
These are good for quickly exploring different mascot ideas without drawing skills.

#### Template.net Free AI Mascot Generator
- Template.net offers a “Free AI Mascot Generator” that turns text prompts into mascot character designs you can customize in a web editor. [template](https://www.template.net/ai-mascot-generator)
- It explicitly lets you download the mascot in SVG, PNG, JPG, PDF or HTML, which is ideal if you want a vector starting point. [template](https://www.template.net/ai-mascot-generator)

#### Venngage AI Mascot Generator
- Venngage provides a free AI mascot generator targeted at creating unique brand mascots from text descriptions (colors, style, personality, etc.). [venngage](https://venngage.com/ai-tools/mascot-generator)
- You generate, tweak, then download high‑resolution mascot graphics suitable for branding and social media; you can then re‑vectorize or trace them as needed. [venngage](https://venngage.com/ai-tools/mascot-generator)

#### AI Ease Free Mascot Generator
- AI Ease has a “Free AI Mascot Generator” that lets you turn text prompts into HD mascot designs in about five seconds, with usage aimed at packaging, brochures, and other projects. [aiease](https://www.aiease.ai/ai-image-generator/ai-mascot/)
- It is positioned as free and quick to use, and you can download the resulting mascot images once you’re satisfied. [aiease](https://www.aiease.ai/ai-image-generator/ai-mascot/)

**How to use them effectively**
- Prompt for *shape* and *attitude*, not just “owl”: e.g. “round, geometric bird mascot with big eyebrows, vivid lime green body, and subtle 3D shading, flat illustration style”.  
- Generate several variants, pick one, and then manually re‑draw it as a clean vector so you fully own the final geometry (and can tweak it later).


### Step 2 – Turn the design into a clean SVG
Even if a generator gives you SVG, you’ll usually want to clean up paths and layer structure yourself for animation (separate eyes, pupils, wings, etc.).

A practical approach:
- Import the SVG or PNG into a vector editor (e.g. Figma, Inkscape, or similar), use it as a locked reference layer.  
- Manually draw simple shapes on top (body, wings, eyes, beak) so each part is one or a few clean paths, named well.  
- Keep the palette small (e.g. 3–5 flat colors + optional gradients) to make shading and animation simpler.



### Step 3 – Animate with vector‑capable tools
Here are the tools that get you closest to Duolingo‑style, stateful, reusable animations.

#### Rive – interactive vector mascot animations
Rive is probably the closest thing to “Duolingo‑level mascot animation” in a free(ish) tool:
- Rive is a 2D vector animation and interaction tool: you can draw vector shapes directly in Rive or import pre‑made SVGs. [rive](https://rive.app/features)
- It supports bones, inverse kinematics, draw‑order animation, and other rigging features well suited for character animation. [rive](https://rive.app/features)
- A popular tutorial notes that Rive has a free version, with the caveat that you can only have three files at a time on the free plan. [youtube](https://www.youtube.com/watch?v=T15hmuOmo68)

Why it’s good for a mascot:
- You can build a rigged character with bones for wings, body squash‑and‑stretch, eye blinks, etc., and drive all that via state machines (hover, idle, success, error, etc.). [rive](https://rive.app/features)
- Rive’s format plus runtimes are meant for apps, games, and websites, so you get smooth, GPU‑rendered animation rather than just a flat GIF. [rive](https://rive.app/features)

Suggested workflow with Rive:
- Import your cleaned SVG, group parts logically (body, wings, eyes, pupils, etc.).  
- Add bones to limbs and wings; set up constraints/IK for nice arcs.  
- Create a few core animations: “idle bounce”, “celebrate”, “sad/error”, “tap/hover attention”.  
- Use Rive’s state machine to switch animations based on app events (e.g. correct answer → celebrate animation).


#### Jitter – timeline motion + Lottie/video export
Jitter is a web‑based motion design tool that feels a bit like “Figma for animation”:
- Jitter describes itself as a collaborative motion design tool to create professional animations quickly, with 300+ free templates made by the team and community. [jitter](https://jitter.video)
- The official Figma plugin page explains that you can import Figma frames into Jitter in one click, animate anything, and export as video, GIF, or Lottie, with options for transparent backgrounds. [figma](https://www.figma.com/community/plugin/961270034818256057/jitter-animation-for-figma)

Why it’s useful for a mascot:
- If you design your mascot as a Figma frame, you can send it to Jitter and animate position, opacity, scale, etc., on a timeline, using easing curves.  
- Export as Lottie for lightweight vector animation in web/app UIs, or as MP4/WebM for hero sections and promo videos. [figma](https://www.figma.com/community/plugin/961270034818256057/jitter-animation-for-figma)

This is great for:
- Landing‑page hero loops.  
- Onboarding sequences or micro‑interactions exported as Lottie.


#### SVGenius – AI‑generated SVG animation from text
If you like the idea of AI helping with the *animation* itself, SVGenius is interesting:
- SVGenius markets itself as a free AI SVG animation generator for icons, logos, and graphics, outputting clean SVG code. [svgenius](https://svgenius.design)
- You type a short description of the animation you want, preview the result, and then copy the SVG code directly if it fits your needs. [svgenius](https://svgenius.design/generation)

Use cases:
- Micro‑animations (eye blinks, wing flutters, subtle hover wobble) for a mascot you already have as SVG.  
- Fancy SVG hover effects without hand‑coding CSS/SMIL/JS.

You’d typically:
- Paste your mascot’s SVG into their tool (if supported), or describe a similar icon/shape.  
- Use the generated SVG/CSS animation as a reference or basis, then adapt/clean it in your own codebase.


### Tool overview table
A quick comparison of the main tools mentioned:

| Tool        | Main role                        | Output formats relevant to you              | Free / low‑cost angle |
|------------|-----------------------------------|---------------------------------------------|------------------------|
| Template.net AI Mascot Generator | Generate initial mascot concepts with editor | PNG, JPG, PDF, SVG, HTML downloads. [template](https://www.template.net/ai-mascot-generator) | Marketed as a free AI mascot generator. [template](https://www.template.net/ai-mascot-generator) |
| Venngage AI Mascot Generator     | Brand‑style mascot generation                | High‑res mascots (raster), editable in their editor. [venngage](https://venngage.com/ai-tools/mascot-generator) | Promoted as a free AI mascot generator. [venngage](https://venngage.com/ai-tools/mascot-generator) |
| AI Ease Mascot Generator         | Fast text‑to‑mascot images                   | HD mascot images for many use cases. [aiease](https://www.aiease.ai/ai-image-generator/ai-mascot/) | Explicitly described as a free mascot generator. [aiease](https://www.aiease.ai/ai-image-generator/ai-mascot/) |
| Rive                              | Rigged, interactive vector character animation | Custom vector format; draws/ imports SVGs; app/game/web runtimes. [rive](https://rive.app/features) | Tutorial documents a free version with up to three files. [youtube](https://www.youtube.com/watch?v=T15hmuOmo68) |
| Jitter                           | Timeline‑based motion for UI/mascot          | Video, GIF, Lottie exports from imported designs. [figma](https://www.figma.com/community/plugin/961270034818256057/jitter-animation-for-figma) | Provides 300+ free motion design templates to remix. [jitter](https://jitter.video) |
| SVGenius                         | AI‑generated SVG animations from text        | Clean animated SVG code ready to embed. [svgenius](https://svgenius.design) | Advertised as a free AI SVG animation generator. [svgenius](https://svgenius.design) |



### How to wire this into a site/app (high‑level)
Given your background, a reasonable implementation strategy:
- **For interactive UI mascot (like Duolingo inside the app):**  
  - Use Rive for the mascot rig and state machine; export using their format and integrate via official runtime for your framework of choice (web, mobile, or game engine), which Rive explicitly targets for apps and games. [rive](https://rive.app/features)

- **For simpler decorative animations (hero sections, onboarding screens):**  
  - Design mascot + layout in Figma, import to Jitter, animate, and export as Lottie or MP4/WebM. [figma](https://www.figma.com/community/plugin/961270034818256057/jitter-animation-for-figma)
  - For lightweight SVG hover/idle animations, generate or hand‑craft SVG/CSS animation (SVGenius can give you code snippets to start from). [svgenius](https://svgenius.design)

If you tell me your front‑end stack (React/Next, Svelte, Flutter, etc.), I can sketch a very concrete “mascot integration” plan (file formats, loaders, component structure, and animation triggers) tailored to your setup.



---

## Prompts
Prompt to get design for the mascotte:  
```
You are a brand and UX analysis assistant specialized in turning an existing product/codebase into high‑quality prompts for AI mascot generators.

CONTEXT AND GOAL
- I have an existing app/website codebase and some design/README documentation.
- I want to create a new, original mascot (NOT a copy of Duolingo’s owl) that fits naturally with my product’s branding, UX tone, and visual language.
- Your job is:
  1) Analyze the repo and documentation;
  2) Infer the brand personality, target users, tone of voice, and visual identity;
  3) Produce multiple, well‑structured text prompts ready to paste into AI mascot generators.

REPO / MATERIALS TO ANALYZE
- Codebase URL or project: <REPO_URL_OR_PATH>
- Key files and folders to examine:
  - README and any docs describing product, vision, features, or UX goals.
  - UI components/layouts (e.g. `src/components`, `app/`, `pages/`, `templates/`).
  - Design tokens or theme files, such as:
    - Color tokens/palettes (e.g. `theme.ts`, `tailwind.config.*`, `tokens.json`, `variables.scss`).
    - Typography settings, spacing, border radius, shadows, icon style guides.
  - Any `design` / `docs` / `assets` folders with mockups or descriptions.

STEP 1 – EXTRACT BRAND & UX PROFILE
From the repo and docs, infer and summarize:

1. Product description
   - One‑sentence elevator pitch.
   - Main problem solved and for whom (target users, e.g. “busy students”, “data engineers”, etc.).
   - Core use cases / flows.

2. Brand personality & tone
   - 3–6 adjectives (e.g. “playful, reassuring, nerdy, minimalist, high‑energy, calm, premium”).
   - Tone of copy / UX writing (e.g. “short and direct”, “humorous”, “formal but friendly”).
   - Emotional goals for users (e.g. “feel safe and in control”, “feel curious and motivated”).

3. Visual identity
   - Primary and secondary colors (with hex codes if available).
   - Typography style (e.g. “rounded sans”, “serif”, “monospace/techy”).
   - Overall visual style (e.g. “flat”, “neumorphism”, “brutalist”, “material‑like”, “retro”).
   - Notable shapes and motifs (e.g. strong use of rounded corners, pills, circles, geometric shapes, gradients, patterns).

4. Constraints / preferences
   - Whether the product feels more “serious & professional” or “fun & gamified”.
   - Any explicit references to mascots, characters, avatars, or illustration styles.
   - Any DOs/DON’Ts mentioned in docs (e.g. “avoid bright red”, “no childish imagery”, “no animals”).

Output this Step 1 as a compact, bullet‑point “Brand & UX Profile”.

STEP 2 – DEFINE MASCOT CONCEPTS (ABSTRACT)
Based on the Brand & UX Profile, propose 3–5 distinct mascot concepts at a conceptual level.

For each concept, specify:
- Name (working name, can be changed later).
- Type (e.g. “friendly bird”, “abstract geometric creature”, “robot assistant”, “spirit of knowledge”, etc.).
- Personality traits (3–6).
- Role in the product (e.g. onboarding guide, error helper, progress cheerleader, empty‑state filler).
- Alignment with brand (short paragraph explaining *why* this fits the brand tone, users, and product features).
- Risk of overlap with existing famous mascots (e.g. “risk of looking like Duolingo owl”, “similar vibe to GitHub Octocat”), and how to avoid that.

STEP 3 – GENERATE PROMPTS FOR AI MASCOT GENERATORS
Using the best 2–3 concepts from Step 2, write prompts that I can paste directly into AI mascot/image generators such as Template.net, Venngage, Imagine.Art, or Pixelcut.

For each selected concept, produce:

A. SHORT PROMPT (single paragraph, ≤ 350 characters)
   - Optimized for tools that prefer concise prompts.
   - Include:
     - Type of mascot.
     - 2–3 key personality traits.
     - Main brand colors (by name and hex if known).
     - Overall style (e.g. “flat 2D vector, clean lines, minimal shading”).

B. LONG, DETAILED PROMPT (multi‑sentence)
   - Optimized for tools that respond better to rich descriptions.
   - Structure and content:
     1) Opening: what the mascot is and what product it represents.
     2) Physical form:
        - Species/character type or abstract form.
        - Body shape (simple geometric description), proportions (e.g. “big head, small body”), main pose.
        - Distinctive features that make it *unlike* Duolingo’s owl or other famous mascots.
     3) Expression & personality:
        - Emotional baseline (e.g. “calm and encouraging”).
        - Facial expression, eye shape, and mouth style.
     4) Style & rendering:
        - “Clean 2D vector illustration, suitable for SVG and icon use.”
        - Level of detail (simple shapes, minimal outlines, limited color palette).
        - Any gradients or soft shading for depth.
     5) Color & branding:
        - Map brand primary/secondary colors into the mascot (body, cheeks, accessories, background).
        - Mention hex codes if known.
     6) Usage constraints:
        - “Centered on a plain background.”
        - “High resolution, no text, no logo.”
        - “Easily recognizable at small sizes for app icons and UI use.”

   - Example structure (you must adapt content from the repo, do NOT copy this literally):
     - “Create a [type of mascot] that represents [product], a [short product description] used by [target users]. The character should look [adjectives] and [adjectives], with a [shape description] body and [eye / face description]. Use a clean 2D vector illustration style with simple, rounded shapes, minimal outlines, and a limited color palette based on [brand colors with hex codes]. Avoid resembling existing famous mascots like Duolingo’s owl by changing proportions, facial features, and color layout. The mascot should feel at home in an interface that uses [UI style cues from the repo] and must be readable at small sizes for icons and UI elements. Plain background, no text or logo.”

C. VARIANT PROMPTS (POSES / EXPRESSIONS)
   - For each chosen concept, add 3–5 very short prompts specifying variants:
     - Idle / neutral pose.
     - “Happy / success” pose.
     - “Thinking / teaching” pose.
     - “Error / oops” pose.
   - For each variant, only change what is necessary (pose, expression, possibly accessory), keep style, colors, and overall geometry consistent so that multiple generations still look like the same character.

STEP 4 – OUTPUT FORMAT
Return your final answer in the following structure:

1) Brand & UX Profile
   - Bullet list as defined above.

2) Mascot Concepts (Summary)
   - 3–5 numbered concepts, 3–5 lines each.

3) Generator‑Ready Prompts
   - For each selected concept:
     - Concept Name
     - SHORT PROMPT:
       - (single line)
     - LONG PROMPT:
       - (multi‑sentence block)
     - VARIANTS:
       - idle:
       - happy/success:
       - thinking/teaching:
       - error/oops:

GENERAL REQUIREMENTS
- Do not invent brand traits that conflict with what you see in the repo; if something is unclear, state your assumption explicitly.
- Ensure all prompts specify “clean 2D vector illustration suitable for SVG” or equivalent, so results are easy to trace or re‑draw as SVG later.
- Explicitly avoid copying famous mascots (Duolingo owl, GitHub Octocat, etc.); call out in text that the character must be clearly distinct.
- Use clear, natural language that can be pasted as‑is into AI mascot/image generators.
```



Animations prompt:  
```
You are a motion design strategist that reads my codebase and design docs, then generates animation specs AND ready-to-paste text prompts for AI or low-code animation tools.

GOAL
- I have an existing web/app project with multiple pages and UI states.
- I want a consistent set of mascot and UI animations (idles, transitions, success, error, hover, etc.) that:
  - Fit my brand and visual style.
  - Map directly to real routes/components/states in the codebase.
- Your outputs will be used in tools like:
  - AI SVG animation generators (e.g. SVGenius, VectorWizard, SVGai, etc.) that turn text prompts into animated SVG code.[web:8][web:12][web:27][web:35]
  - Motion design tools (e.g. Jitter, LottieFiles Creator) that animate Figma frames / SVGs and export Lottie, GIF, MP4.[web:3][web:24][web:30][web:31]

MATERIALS TO ANALYZE
- Project root: <REPO_URL_OR_PATH>
- Focus especially on:
  - Routing / pages:
    - e.g. Next.js `app/` or `pages/`, React Router config, or equivalent.
  - UI components:
    - Buttons, forms, cards, modals, toasts, navigation, loaders.
  - State & logic:
    - Places where you can infer states like loading / success / error / empty / disabled / hover / active.
  - Design tokens / theming:
    - Colors, border-radius, shadows, typography, motion/transition tokens if any.
  - README and any `/docs`, `/design`, or `/specs` folders:
    - Product description, brand tone, UX principles, any motion guidelines.

STEP 1 – MAP THE UX SURFACE AND STATES
Produce a concise inventory of where animations would matter most:

1. Key pages / flows:
   - List main screens (e.g. Landing, Dashboard, Exercise, Settings, etc.).
   - For each, mention its primary user goals.

2. UI states & events:
   - For each key flow, list important states and triggers, such as:
     - loading, success, error, empty state, hover, focus, navigation change, modal open/close, form submit, background sync, achievement unlocked, etc.
   - Tie them back to concrete components or files when possible
     - e.g. `components/QuizResult.tsx` -> “quiz finished” success state.

3. Visual & brand constraints:
   - Extract: brand adjectives (3–6), typical radius (e.g. heavily rounded / sharp), color palette highlights, and level of seriousness vs playfulness.
   - Note any existing references to motion or interaction in the docs.

Output this as a structured bullet list called **UX State Map**.

STEP 2 – DEFINE ANIMATION SYSTEM PRINCIPLES
Based on the UX State Map and visual style, define a simple motion system:

1. Motion personality:
   - 3–6 adjectives for motion (e.g. “snappy but soft”, “bouncy and playful”, “calm and subtle”).
   - Preferred timing ranges for micro-interactions (e.g. 150–250 ms) vs. larger transitions (e.g. 250–450 ms).
   - Overall easing style (e.g. “out-quint for entrances, in-out-cubic for loops”).

2. Consistency rules:
   - Rules for when elements fade vs slide vs scale.
   - Rules for how much overshoot/bounce is acceptable.
   - How the mascot should move compared to the rest of the UI (lead character, echoing the UI, etc.).

3. Technical constraints:
   - Assume that:
     - SVG animations may be generated from text prompts and used as inline SVG or with CSS/JS.[web:8][web:12][web:27]
     - UI section animations may be implemented via Lottie or web animation libraries, so prompts should describe motion clearly in human language.[web:3][web:24][web:30][web:31]

Output this as **Motion System Principles**.

STEP 3 – DEFINE ANIMATION SPEC PER PAGE / STATE
For each important page or flow identified:

For each PAGE:
- Name: (e.g. “/dashboard”, “/exercise/[id]”)
- Summary: what the user does here.

Then, for each STATE or EVENT on that page (e.g. “page load”, “primary CTA hover”, “form submit success”, “error alert appears”, “empty state”):

- State/Event name:
  - Example: `Exercise success`, `Landing hero idle`, `Quiz error`, `Settings save success`.

- Animation intent (plain language spec):
  - Describe:
    - which elements move (mascot, hero card, button, icon, background shapes),
    - what they do (fade, slide, bounce, scale, rotate),
    - at what intensity (subtle vs strong),
    - and what emotion they should convey.
  - Keep this at a spec level, not tool-specific.

Output everything in a section called **Animation Specs by Page**.

STEP 4 – GENERATOR-READY PROMPTS (MASCOT & UI)
Now convert the specs into concrete text prompts that I can paste into:
- AI SVG animation tools (for mascot micro-animations, icons, badges, loaders).[web:8][web:12][web:27][web:35]
- Motion tools like Jitter / Lottie Creator (for section / component animations).[web:3][web:24][web:30][web:31]

Create two categories of prompts:

A) Mascot-focused animation prompts
   - For each key mascot state (idle, success, error, thinking, hover/attention, onboarding, achievement), produce:
     - SHORT PROMPT (1–2 sentences, max ~250 characters).
     - LONG PROMPT (3–6 sentences, tool-agnostic but detailed).

   Long prompt structure (adapt from repo info):
   - 1) Context:
        - “Animate a [describe mascot] representing [product] on the [page/state].”
   - 2) Motion:
        - Describe the motion in simple terms (e.g. “small vertical bounce loop”, “wings flap twice then rest”, “eyes blink occasionally”, “subtle floating idle”).
   - 3) Emotion:
        - Tie to state (success -> “joyful, energetic”; error -> “concerned but reassuring”; loading -> “calm, patient”).
   - 4) Style & constraints:
        - “Clean 2D vector SVG animation, smooth easing, no background, loop seamlessly.”
        - “Keep movements subtle enough for repeated viewing in a UI.”

   Example skeleton (YOU must fill details from Brand & UX Profile):
   - SHORT:
     - “Looping idle animation of our [adjective] [mascot type] gently bobbing up and down with occasional eye blinks, in a clean 2D vector SVG style.”
   - LONG:
     - “Create a looping idle animation of our [adjective] [mascot type] that represents [product]. The character gently bobs up and down with a slight squash-and-stretch to feel alive but not distracting. Add an eye blink every few seconds, and a micro head tilt from side to side. Use clean 2D vector shapes, smooth easing, and our brand colors [list]. The animation should loop seamlessly and work at small sizes inside an app UI.”

B) UI / Section animation prompts (for Jitter / Lottie / CSS)
   - For each major page/section event (e.g. hero entrance, card hover, modal open, success toast), produce prompts that describe:
     - Which elements move (cards, buttons, text, background shapes, mascot).
     - Entrance/exit directions, opacity changes, scaling.
     - Timing and staggering.
     - Any relationship to the mascot animation.

   For each such event, output:
   - TOOL-AGNOSTIC TEXT BRIEF (for a human or LLM animating in Jitter or Lottie Creator).
   - OPTIONAL “AI-PROMPTED ANIMATION” VERSION:
     - Short prompt formatted to be pasted into an AI animation generator that outputs SVG or code (e.g. “animate this SVG icon with a subtle 0.8s scale-and-rotate bounce on hover, using ease-out and returning to rest”).[web:8][web:12][web:27][web:29][web:35]

Format example:
- EVENT: “Dashboard cards on page load”
  - BRIEF:
    - “On dashboard page load, fade in the background, then stagger each stats card from 10px below with 250ms delay between them. Use ~250–350ms durations, ease-out-quint. The mascot appears last, rising slightly with a soft bounce.”
  - AI ANIMATION PROMPT:
    - “Animate these dashboard cards so they fade in from 0 to 100% opacity and slide up 10px over 0.3 seconds with ease-out-quint, staggered by 0.25 seconds each. The effect should feel smooth, modern, and match a rounded, colorful UI.”

STEP 5 – OUTPUT FORMAT
Return your final answer in this structure:

1) UX State Map
   - (As defined in Step 1.)

2) Motion System Principles
   - (As defined in Step 2.)

3) Animation Specs by Page
   - Grouped by page/route and then by state/event.

4) Generator-Ready Prompts
   - 4.1) Mascot Animations
       - List of states with SHORT and LONG prompts + variants.
   - 4.2) UI / Section Animations
       - For each page/state, BRIEF + optional AI ANIMATION PROMPT.

GENERAL REQUIREMENTS
- Base everything on real pages, components, and states you find in the repo. If something is ambiguous, state your assumptions.
- Keep all prompts in clear, natural language that can be pasted into:
  - AI SVG animation generators (describe the motion in terms of transforms, opacity, loops, etc.).[web:8][web:12][web:27][web:35]
  - Jitter or Lottie workflows (describe layers, timing, and easing as in a motion brief).[web:3][web:24][web:30]
- Maintain consistency with the brand tone and visual identity inferred from the codebase and docs.
- Make sure mascot motions are expressive but not annoying for repeated in-app use.
```
