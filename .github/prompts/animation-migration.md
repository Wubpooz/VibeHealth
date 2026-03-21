# Animation Architecture: Motion.dev & ngx-lottie

This document describes the animation architecture for VibeHealth. We use a dual-engine approach:

1. **`motion/mini` (Motion.dev):** For all standard UI choreography, staggered component animations, and micro-interactions (runs on the Web Animations API / compositor thread).
2. **`ngx-lottie`:** For complex vector animations - the VibeHealth Bunny Mascot and rich animated icons.
3. **Angular Animations:** For page transitions and component-level micro-animations (state-based triggers).

## Dependencies

```bash
# Already installed
npm install motion lottie-web ngx-lottie
```

## Global Application Config (`app.config.ts`)

ngx-lottie is configured with lazy-loaded lottie-web, and Angular animations are enabled:

```typescript
import { provideLottieOptions } from 'ngx-lottie';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
  ],
};
```

## Motion.dev for UI Animations

**CRITICAL Angular Constraint:** Do NOT pass CSS selectors to Motion - View Encapsulation will break them. Use `@ViewChildren` with `ElementRef.nativeElement`.

**IMPORTANT:** Use `motion/mini` (2.3kb) for DOM animations. It requires CSS transform strings (not x/y/scale shorthands).

### Pattern for Staggered Entrance

```typescript
import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { animate } from 'motion/mini';

@Component({
  template: `<div #card *ngFor="let item of items">{{ item.name }}</div>`,
  styles: [`.card { opacity: 0; }`] // Start invisible
})
export class MyComponent implements AfterViewInit {
  @ViewChildren('card') cards!: QueryList<ElementRef<HTMLElement>>;

  ngAfterViewInit() {
    // Manual stagger with forEach
    this.cards.forEach((el, i) => {
      animate(
        el.nativeElement,
        { opacity: [0, 1], transform: ['translateY(30px)', 'translateY(0)'] },
        { duration: 0.5, ease: 'easeOut', delay: i * 0.1 }
      );
    });
  }
}
```

### Options Reference

```typescript
animate(element, keyframes, {
  duration: 0.5,           // seconds
  delay: 0.1,              // seconds  
  ease: 'easeOut',         // 'easeIn' | 'easeOut' | 'easeInOut' | [0.4, 0, 0.2, 1]
  type: 'spring',          // optional spring physics
  stiffness: 400,
  damping: 20,
});
```

## Angular Animations for Page Transitions & Micro-Interactions

### Reusable Micro-Animations

Import from `frontend/src/app/shared/animations/`:

```typescript
import { 
  fadeInOut,      // Basic fade
  slideInUp,      // Slide from bottom
  slideInRight,   // Slide from right
  slideInLeft,    // Slide from left
  scaleIn,        // Scale entrance (soft pop)
  scaleAndFade,   // Modal/dialog entrance
  bounceIn,       // Playful bounce entrance
  pulse,          // Attention-grabbing pulse
  pulseGlow,      // Glow effect for CTAs
  shake,          // Error feedback
  wiggle,         // Playful wiggle
  expandCollapse, // Accordion height animation
  cardHover,      // Card lift on hover
  buttonPress,    // Button press feedback
  successCheck,   // Checkmark draw animation
  badgeBounce,    // Notification badge
  flipCard,       // Card flip animation
  float,          // Mascot float
  drawerSlide,    // Side drawer
  tooltipAnim,    // Tooltip show/hide
  highlightFlash, // Flash for new items
} from '../../shared/animations';
```

### Usage in Components

```typescript
@Component({
  animations: [fadeInOut, slideInUp, scaleIn],
  template: `
    <div @fadeInOut *ngIf="visible()">Fades in/out</div>
    <div @slideInUp>Slides from bottom</div>
    <div @scaleIn>Soft pop entrance</div>
  `
})
export class MyComponent {}
```

### Page Transitions

Three transition variants are available in `frontend/src/app/shared/animations/page-transitions.ts`:

1. **fadeAnimation** - Simple cross-fade between routes
2. **slideUpAnimation** - Content slides up on enter
3. **scaleFadeAnimation** - Default "Soft Pop" aesthetic (scale + fade)

```typescript
// app.component.ts
import { routeAnimations } from './shared/animations';

@Component({
  animations: [routeAnimations],
  template: `
    <div [@routeAnimations]="getRouteAnimationData()">
      <router-outlet />
    </div>
  `
})
export class AppComponent {
  private contexts = inject(ChildrenOutletContexts);
  
  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
```

## ngx-lottie for Complex Vectors

For the mascot and rich animated icons, use ngx-lottie:

```typescript
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';

@Component({
  imports: [LottieComponent],
  template: `
    <ng-lottie 
      [options]="lottieOptions" 
      (animationCreated)="onAnimationCreated($event)"
    />
  `
})
export class MascotComponent implements OnDestroy {
  private animation?: AnimationItem;

  lottieOptions: AnimationOptions = {
    path: '/assets/animations/bunny-idle.json',
    loop: true,
    autoplay: true,
  };

  onAnimationCreated(animation: AnimationItem) {
    this.animation = animation;
  }

  ngOnDestroy() {
    this.animation?.destroy(); // Prevent memory leaks
  }
}
```

**Zone Warning:** ngx-lottie events run outside Angular zone. Use `NgZone.run()` if updating signals from event callbacks.

## CSS Keyframes for Simple Loops

For simple looping animations (float, pulse), prefer CSS keyframes:

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.floating { animation: float 3s ease-in-out infinite; }
```

## Animated Icons

Use `<app-animated-icon>` component for standard animated icons:

```html
<app-animated-icon name="check-circle" [size]="24" color="#10b981" />
<app-animated-icon name="heart" [animate]="triggerHeart()" />
```

**Available icons:** check-circle, shield-check, heart, bell, download, loader, arrow-right, sparkles, plus, minus, trash, settings, user, home, search, menu, close, carrot, droplet, activity.

## Migration Checklist

- [x] Install motion, lottie-web, ngx-lottie
- [x] Configure provideLottieOptions in app.config.ts
- [x] Enable provideAnimations() in app.config.ts
- [x] Dashboard uses motion/mini for card entrance animations
- [x] Page transitions configured in app.component.ts
- [x] Micro-animations library created (25+ reusable triggers)
- [x] Animated icon component extended to 20 icons
- [ ] Replace static bunny emoji with ng-lottie container (needs Lottie JSON asset)
- [x] Documentation updated with Motion.dev patterns

## File Locations

- **Micro-animations:** `frontend/src/app/shared/animations/micro-animations.ts`
- **Page transitions:** `frontend/src/app/shared/animations/page-transitions.ts`
- **Barrel export:** `frontend/src/app/shared/animations/index.ts`
- **Animated icons:** `frontend/src/app/shared/components/animated-icons/animated-icon.component.ts`
- **Spiral loader:** `frontend/src/app/shared/components/spiral-loader/spiral-loader.component.ts`
- **Motion.dev reference:** `.github/llms/.gsap/CLAUDE.md`
