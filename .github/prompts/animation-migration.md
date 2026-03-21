# Animation Architecture: Motion.dev & ngx-lottie

This document describes the animation architecture for VibeHealth. We use a dual-engine approach:

1. **`motion/mini` (Motion.dev):** For all standard UI choreography, staggered component animations, and micro-interactions (runs on the Web Animations API / compositor thread).
2. **`ngx-lottie`:** For complex vector animations - the VibeHealth Bunny Mascot and rich animated icons.

## Dependencies

```bash
# Already installed
npm install motion lottie-web ngx-lottie
```

## Global Application Config (`app.config.ts`)

ngx-lottie is configured with lazy-loaded lottie-web:

```typescript
import { provideLottieOptions } from 'ngx-lottie';

export const appConfig: ApplicationConfig = {
  providers: [
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

## Migration Checklist

- [x] Install motion, lottie-web, ngx-lottie
- [x] Configure provideLottieOptions in app.config.ts
- [x] Dashboard uses motion/mini for card entrance animations
- [ ] Replace static bunny emoji with ng-lottie container (needs Lottie JSON asset)
- [x] Documentation updated with Motion.dev patterns
