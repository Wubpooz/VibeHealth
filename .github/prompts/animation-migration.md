# Animation Architecture Migration: Motion.dev & ngx-lottie

Please help me migrate the animation architecture of the `VibeHealth` Angular 21 application. We are moving away from older, thread-blocking animation libraries (like Anime.js or heavy GSAP plugins) and standardizing on a dual-engine architecture:

1. **`motion` (Motion.dev):** For all standard UI choreography, layout transitions, and staggered component animations (runs on the Web Animations API / compositor thread).
2. **`ngx-lottie`:** For all complex vector illustrations, specifically the VibeHealth Bunny Mascot and micro-animated icons.

### Step 1: Dependencies
Please run the necessary commands to install the new packages.
`bun add motion lottie-web ngx-lottie`

### Step 2: Global Application Config (`app.config.ts`)
Set up `ngx-lottie` in our standalone Angular architecture. Use the dynamic import syntax so `lottie-web` is lazy-loaded and doesn't bloat our initial bundle.

```typescript
// Example config logic
import { provideLottieOptions } from 'ngx-lottie';

export const appConfig: ApplicationConfig = {
  providers: [
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
  ],
};
```

### Step 3: Implement Motion for UI Elements
When animating HTML elements (like staggered grids, modal pop-ups, or status cards), strictly use the `motion` package. 
**Crucial Angular Constraint:** Do not pass string CSS selectors (e.g. `animate('.card', ...)`) to Motion, as View Encapsulation can cause this to fail. Instead, use Angular's `@ViewChildren` or `@ViewChild` to gather the `ElementRef`s, unwrap their `nativeElement`s, and pass those HTMLElements directly to `animate()` inside `ngAfterViewInit`.

**Example Pattern for Motion:**
```typescript
import { animate, stagger } from 'motion';

@ViewChildren('card') cards!: QueryList<ElementRef<HTMLElement>>;

ngAfterViewInit() {
  const elements = this.cards.map(el => el.nativeElement);
  animate(elements, { opacity: [0, 1], y: [20, 0] }, { delay: stagger(0.1) });
}
```

### Step 4: Implement ngx-lottie for the Mascot
When animating the VibeHealth Mascot (or any future complex vector graphics), strictly use the `<ng-lottie>` component. Ensure change detection performance isn't destroyed by Lottie's `requestAnimationFrame` loop. 
**Crucial Constraint:** If you need to bind to Lottie events (like `(loopComplete)` or `(animationCreated)`), remember that `ngx-lottie` runs these outside of the Angular zone. You MUST inject `NgZone` and use `ngZone.run()` or manually call `ChangeDetectorRef` when updating angular signals reacting to these events.

**Example Pattern for Lottie:**
```typescript
import { AnimationOptions, AnimationItem } from 'ngx-lottie';

options: AnimationOptions = {
  path: '/assets/animations/bunny-idle.json', // Treat all lottie assets like this
};

animationCreated(animationItem: AnimationItem): void {
  // Save reference for manual playback control (play/pause/stop) 
}
```

### Task Execution:
1. Scan `package.json` and remove Anime.js or redundant GSAP packages if they exist.
2. Update the `app.config.ts` per my specs.
3. Migrate our `Dashboard` to use `motion` for staggering the feature cards (Vitals, Hydration, First Aid, etc.) upon entry.
4. Replace the static text-based "Bunny Mascot" widget on the Dashboard with a skeleton outline for an `<ng-lottie>` container.
