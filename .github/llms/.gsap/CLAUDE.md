# Motion.dev Animation Reference Guide for AI Assistants

## 🚨 CRITICAL: USE MOTION.DEV (NOT ANIME.JS) 🚨

**This project uses Motion.dev (motion package v12+) - DO NOT use Anime.js syntax**

**If you're about to write `import anime from 'animejs'` - STOP!**
**Use Motion.dev imports as shown below.**

## 🚀 Quick Start - Essential Setup

### 1. Correct Import (REQUIRED)
```javascript
// ✅ CORRECT: Import from motion/mini for lightweight DOM animations (2.3kb)
import { animate } from 'motion/mini';

// ✅ CORRECT: Import from motion for full features (SVG morphing, sequences)
import { animate, stagger, spring } from 'motion';

// ❌ WRONG: Never use Anime.js
// import anime from 'animejs';
// import { animate } from 'animejs';
```

### 2. Angular Integration Pattern (REQUIRED)
```typescript
// ✅ CORRECT: Use ViewChildren with ElementRef.nativeElement
import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { animate } from 'motion/mini';

@Component({
  template: `<div #card *ngFor="let item of items">{{ item.name }}</div>`
})
export class MyComponent implements AfterViewInit {
  @ViewChildren('card') cards!: QueryList<ElementRef<HTMLElement>>;

  ngAfterViewInit() {
    this.cards.forEach((el, i) => {
      animate(
        el.nativeElement,
        { opacity: [0, 1], transform: ['translateY(30px)', 'translateY(0)'] },
        { duration: 0.5, ease: 'easeOut', delay: i * 0.1 }
      );
    });
  }
}

// ❌ WRONG: Using CSS selectors (fails with Angular View Encapsulation)
// animate('.card', { opacity: 1 });
```

## ✅ Quick Validation Checklist

Before generating animation code, verify:
- [ ] Using `import { animate } from 'motion/mini'` or `'motion'`
- [ ] Using `ViewChildren` + `ElementRef.nativeElement` for Angular
- [ ] Using `transform` strings for transforms (not `x`, `y`, `scale` directly with mini)
- [ ] Using `ease:` not `easing:`
- [ ] Using seconds for durations
- [ ] Using proper ease names: `'easeIn'`, `'easeOut'`, `'easeInOut'`

## 🎯 Core API - Most Common Patterns

### Basic Animation (motion/mini)
```javascript
// Single element
animate(element, { opacity: [0, 1] }, { duration: 0.5 });

// With transform (use transform string for motion/mini)
animate(element, { 
  opacity: [0, 1], 
  transform: ['translateY(30px)', 'translateY(0)'] 
}, { duration: 0.5, ease: 'easeOut' });

// Scale animation
animate(element, { 
  transform: ['scale(0.95)', 'scale(1)'] 
}, { duration: 0.3 });
```

### Staggered Animations (manual stagger with motion/mini)
```javascript
// With forEach loop (motion/mini)
elements.forEach((el, i) => {
  animate(el, { 
    opacity: [0, 1], 
    transform: ['translateY(30px)', 'translateY(0)'] 
  }, { duration: 0.5, ease: 'easeOut', delay: i * 0.1 });
});

// With full motion package stagger helper
import { animate, stagger } from 'motion';
animate(elements, { x: [0, 100] }, { delay: stagger(0.1) });
```

### Spring Animations
```javascript
animate(element, { 
  transform: ['scale(1)', 'scale(1.1)'] 
}, { type: 'spring', stiffness: 400, damping: 20 });
```

## ❌ Common AI Mistakes to Avoid

### MISTAKE #1: Using Anime.js Import
```javascript
// ❌ WRONG - This is Anime.js
import anime from 'animejs';
anime({ targets: '.element', translateX: 250 });

// ✅ CORRECT - Use Motion.dev
import { animate } from 'motion/mini';
animate(element, { transform: ['translateX(0)', 'translateX(250px)'] });
```

### MISTAKE #2: Using CSS Selectors in Angular
```javascript
// ❌ WRONG - Fails with Angular's View Encapsulation
animate('.card', { opacity: 1 });

// ✅ CORRECT - Use ElementRef.nativeElement
animate(cardElement.nativeElement, { opacity: [0, 1] });
```

### MISTAKE #3: Using x/y/scale with motion/mini
```javascript
// ❌ WRONG - motion/mini doesn't support these shorthands
animate(el, { y: 30, scale: 0.95 });

// ✅ CORRECT - Use transform string
animate(el, { transform: ['translateY(30px) scale(0.95)', 'translateY(0) scale(1)'] });
```

### MISTAKE #4: Using Wrong Ease Names
```javascript
// ❌ WRONG
animate(el, { opacity: 1 }, { ease: 'ease-out' });
animate(el, { opacity: 1 }, { easing: 'easeOut' });
animate(el, { opacity: 1 }, { ease: 'outQuad' });

// ✅ CORRECT
animate(el, { opacity: 1 }, { ease: 'easeOut' });
animate(el, { opacity: 1 }, { ease: 'easeInOut' });
animate(el, { opacity: 1 }, { ease: [0.4, 0, 0.2, 1] }); // cubic-bezier
```

## 📋 Property Reference

### Animation Options
```javascript
animate(element, keyframes, {
  duration: 0.5,           // seconds
  delay: 0.1,              // seconds
  ease: 'easeOut',         // easing function
  type: 'spring',          // optional: use spring physics
  stiffness: 400,          // spring stiffness
  damping: 20,             // spring damping
  repeat: Infinity,        // repeat count
  repeatType: 'reverse',   // 'loop' | 'reverse' | 'mirror'
});
```

### Easing Functions
```javascript
// Built-in easings
'linear'
'easeIn'
'easeOut'
'easeInOut'

// Cubic bezier
[0.4, 0, 0.2, 1]  // ease-out like
[0.16, 1, 0.3, 1] // ease-out-expo
```

### Keyframes
```javascript
// From/To values
{ opacity: [0, 1] }
{ transform: ['translateY(30px)', 'translateY(0)'] }

// Multiple keyframes
{ opacity: [0, 1, 0.5] }  // 0 → 1 → 0.5

// Single value (animate from current to this)
{ opacity: 1 }
```

## 🎨 Common Animation Patterns

### Entrance Animation
```javascript
animate(element, { 
  opacity: [0, 1], 
  transform: ['translateY(20px)', 'translateY(0)'] 
}, { duration: 0.5, ease: 'easeOut' });
```

### Hover Effect
```javascript
element.addEventListener('mouseenter', () => {
  animate(element, { transform: ['translateY(0)', 'translateY(-4px)'] }, { duration: 0.2 });
});
element.addEventListener('mouseleave', () => {
  animate(element, { transform: ['translateY(-4px)', 'translateY(0)'] }, { duration: 0.2 });
});
```

### Button Press
```javascript
animate(button, { 
  transform: ['scale(1)', 'scale(0.95)', 'scale(1)'] 
}, { duration: 0.15 });
```

### Loading Pulse
```javascript
animate(element, { opacity: [0.5, 1] }, { 
  duration: 1, 
  repeat: Infinity, 
  repeatType: 'reverse' 
});
```

## 🔧 ngx-lottie for Complex Animations

For complex vector animations (mascot, rich icons), use ngx-lottie:

```typescript
// app.config.ts - Configure with lazy loading
import { provideLottieOptions } from 'ngx-lottie';

export const appConfig = {
  providers: [
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
  ],
};
```

```typescript
// Component usage
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  imports: [LottieComponent],
  template: `<ng-lottie [options]="options" (animationCreated)="onCreated($event)" />`
})
export class MyComponent implements OnDestroy {
  private animation?: AnimationItem;
  
  options: AnimationOptions = {
    path: '/assets/animations/mascot.json',
    loop: true,
    autoplay: true,
  };

  onCreated(animation: AnimationItem) {
    this.animation = animation;
  }

  ngOnDestroy() {
    this.animation?.destroy(); // Prevent memory leaks
  }
}
```

## ⚡ Performance Tips

1. **Use motion/mini for simple DOM animations** (2.3kb vs 18kb)
2. **Prefer transform and opacity** - they don't trigger layout
3. **Clean up animations** - call returned cleanup function when element unmounts
4. **Use CSS for simple loops** - `@keyframes` is more efficient for infinite animations

## 💡 AI Code Generation Rules

When asked to create animations:

1. **ALWAYS** use `import { animate } from 'motion/mini'` for DOM animations
2. **ALWAYS** use `ViewChildren` + `ElementRef.nativeElement` in Angular
3. **NEVER** use CSS selectors like `'.card'` in Angular components
4. **ALWAYS** use `transform` strings for transforms with motion/mini
5. **ALWAYS** use proper ease names: `'easeIn'`, `'easeOut'`, `'easeInOut'`
6. **NEVER** use Anime.js syntax or imports
7. **PREFER** motion/mini (2.3kb) unless you need full features
8. **USE** ngx-lottie for complex vector animations

## NPM Packages
```bash
# Core animation
npm install motion

# Lottie for complex vectors
npm install lottie-web ngx-lottie
```