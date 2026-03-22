# 🎨 VibeHealth Frontend Development Guide

> **Purpose**: Complete reference for Angular 21 development patterns in VibeHealth.

---

## 🏗️ Project Structure

```
frontend/src/app/
├── core/                       # Singleton services (injected at root)
│   ├── auth/                   # AuthService, guards
│   ├── profile/                # ProfileService
│   ├── medical-id/             # MedicalIdService
│   ├── rewards/                # RewardsService (carrots!)
│   ├── reference-data/         # ReferenceDataService (autocomplete data)
│   └── api/                    # API client utilities
│
├── features/                   # Feature-specific components
│   ├── auth/                   # Login, Register, VerifyEmail
│   ├── dashboard/              # Main dashboard
│   ├── landing/                # Public landing page
│   ├── medical-id/             # Medical ID card & editor
│   └── onboarding/             # Multi-step wizard
│
├── shared/                     # Reusable components
│   └── components/
│       ├── autocomplete/       # Smart search/select component
│       ├── mascot/             # Bunny mascot component
│       └── ...                 # Other shared components
│
├── app.component.ts            # Root component
├── app.config.ts               # Application configuration
└── app.routes.ts               # Route definitions
```

---

## 🖼️ Icon System

- Use `@lucide/angular` as the primary icon library.
- Prefer per-icon tree-shakeable imports, e.g. `import { LucideCarrot } from '@lucide/angular';`.
- Use `LucideDynamicIcon` for runtime icon selection and prevent importing full icon set.
- Maintain consistency with established visual language (stroke style, 24px default size, robust `prefers-reduced-motion` fallback).

## ⚡ Angular 21 Essentials

### Standalone Components (Default)

```typescript
// ✅ In Angular 20+, standalone: true is the DEFAULT
// Do NOT include it in the decorator
@Component({
  selector: 'app-my-component',
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class MyComponent {}
```

### Signals for State Management

```typescript
import { signal, computed, effect } from '@angular/core';

// Writable signal
const count = signal(0);

// Read value
console.log(count()); // 0

// Update value
count.set(10);
count.update(c => c + 1);

// Computed (derived state)
const doubled = computed(() => count() * 2);

// Effect (side effects)
effect(() => {
  console.log('Count changed:', count());
});
```

### Input/Output Functions (New API)

```typescript
import { input, output } from '@angular/core';

@Component({...})
export class MyComponent {
  // Required input
  readonly title = input.required<string>();
  
  // Optional input with default
  readonly count = input(0);
  
  // Output
  readonly clicked = output<void>();
  readonly itemSelected = output<Item>();
  
  onClick(): void {
    this.clicked.emit();
  }
}
```

### Native Control Flow

```html
<!-- ✅ CORRECT: Native control flow -->
@if (loading()) {
  <spinner />
} @else if (error()) {
  <error-message [message]="error()" />
} @else {
  <content />
}

@for (item of items(); track item.id) {
  <item-card [item]="item" />
} @empty {
  <no-items-message />
}

@switch (status()) {
  @case ('pending') {
    <pending-badge />
  }
  @case ('active') {
    <active-badge />
  }
  @default {
    <unknown-badge />
  }
}

<!-- ❌ WRONG: Old directives -->
<!-- <div *ngIf="loading">...</div> -->
<!-- <div *ngFor="let item of items">...</div> -->
```

### Dependency Injection

```typescript
import { inject } from '@angular/core';

@Component({...})
export class MyComponent {
  // ✅ CORRECT: inject() function
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  
  // ❌ WRONG: constructor injection
  // constructor(private http: HttpClient) {}
}
```

---

## 🧩 Component Patterns

### Service with Readonly Signals

```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly _items = signal<Item[]>([]);
  private readonly _loading = signal(false);
  
  // Expose as readonly to prevent external mutation
  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  
  // Computed values
  readonly hasItems = computed(() => this._items().length > 0);
  
  async loadItems(): Promise<void> {
    this._loading.set(true);
    try {
      const response = await this.http.get<Item[]>('/api/v1/items').toPromise();
      this._items.set(response ?? []);
    } finally {
      this._loading.set(false);
    }
  }
}
```

### Smart Initialization with afterNextRender

```typescript
import { afterNextRender } from '@angular/core';

@Component({...})
export class MyComponent {
  constructor() {
    afterNextRender(() => {
      // Runs after the first render, safe for DOM access
      this.initializeAnimations();
    });
  }
}
```

### Cleanup with DestroyRef

```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({...})
export class MyComponent {
  private readonly destroyRef = inject(DestroyRef);
  
  ngOnInit(): void {
    someObservable$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
    
    // Or manual cleanup
    this.destroyRef.onDestroy(() => {
      // cleanup logic
    });
  }
}
```

---

## 🔌 Reusable Components

### Autocomplete Component Usage

```typescript
import { AutocompleteComponent } from '@shared/components/autocomplete/autocomplete.component';

@Component({
  imports: [AutocompleteComponent],
  template: `
    <app-autocomplete
      [options]="conditions()"
      [selectedItems]="selectedConditions"
      [placeholder]="'Search conditions...'"
      [allowCustom]="true"
      [multiple]="true"
      (selectionChange)="onConditionsChange($event)"
    />
  `
})
export class MyFormComponent {
  private readonly referenceData = inject(ReferenceDataService);
  
  readonly conditions = this.referenceData.conditions;
  selectedConditions: string[] = [];
  
  onConditionsChange(items: string[]): void {
    this.selectedConditions = items;
  }
}
```

### Mascot Component Usage

```typescript
import { MascotComponent } from '@shared/components/mascot/mascot.component';

@Component({
  imports: [MascotComponent],
  template: `
    <app-mascot
      [state]="mascotState()"
      [message]="mascotMessage()"
      [showCarrots]="true"
    />
  `
})
export class DashboardComponent {
  readonly mascotState = signal<'idle' | 'happy' | 'sad' | 'encouraging'>('idle');
  readonly mascotMessage = signal('Welcome back!');
}
```

### Spiral Loader Component Usage

```typescript
import { SpiralLoaderComponent } from '@shared/components/spiral-loader/spiral-loader.component';

@Component({
  imports: [SpiralLoaderComponent],
  template: `
    @if (isLoading()) {
      <app-spiral-loader [size]="80" [label]="'Loading health data...'" />
    }
  `
})
export class MyComponent {
  readonly isLoading = signal(true);
}
```

The spiral loader is a reusable loading indicator inspired by Framer's spiral component. Use it for async operations like:
- API data fetching
- Form submissions
- Route transitions
- Resource processing

### Animated Icon Component Usage

```typescript
import { AnimatedIconComponent } from '@shared/components/animated-icons/animated-icon.component';

@Component({
  imports: [AnimatedIconComponent],
  template: `
    <!-- Hover-triggered animation -->
    <app-animated-icon name="check-circle" [size]="24" color="#10b981" />
    
    <!-- Programmatically triggered -->
    <app-animated-icon name="heart" [animate]="showHeartAnimation()" />
  `
})
export class MyComponent {
  readonly showHeartAnimation = signal(false);
}
```

Available icons: `check-circle`, `shield-check`, `heart`, `bell`, `download`, `loader`, `arrow-right`, `sparkles`.

Icons animate on hover by default and support programmatic triggering via the `[animate]` input.
```

---

## 🌐 i18n with ngx-translate

### Setup (already configured in app.config.ts)

```typescript
// app.config.ts
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslateService({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json'),
        deps: [HttpClient]
      }
    })
  ]
};
```

### Using Translations

```html
<!-- In templates -->
<h1>{{ 'page.title' | translate }}</h1>
<p>{{ 'greeting' | translate:{ name: userName() } }}</p>

<!-- With async values -->
<button>{{ 'button.save' | translate }}</button>
```

```typescript
// In components
import { TranslateService } from '@ngx-translate/core';

@Component({...})
export class MyComponent {
  private readonly translate = inject(TranslateService);
  
  showMessage(): void {
    const message = this.translate.instant('success.saved');
    // or async:
    this.translate.get('success.saved').subscribe(msg => {
      console.log(msg);
    });
  }
}
```

### Translation File Structure

```json
// en.json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel"
  },
  "onboarding": {
    "step1": {
      "title": "Personal Information",
      "subtitle": "Let's get to know you"
    }
  },
  "medicalId": {
    "title": "Medical ID",
    "bloodType": "Blood Type"
  }
}
```

---

## 🧭 Routing Patterns

### Lazy Loading Routes

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { 
    path: 'landing',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent),
    canActivate: [authGuard]
  }
];
```

### Auth Guard (Functional)

```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  return router.createUrlTree(['/login']);
};
```

---

## 🎬 Animation Patterns (Anime.js v4)

### CRITICAL: Use v4 Syntax

```typescript
// ✅ CORRECT v4
import { animate, createTimeline, stagger } from 'animejs';

// Set time unit ONCE in main.ts
import { engine } from 'animejs';
engine.timeUnit = 's';

// Simple animation (single line)
animate('.card', { opacity: [0, 1], y: [20, 0], duration: 0.5, ease: 'outQuad' });

// Staggered entrance
animate('.list-item', { opacity: [0, 1], y: [20, 0], delay: stagger(0.1), duration: 0.5 });

// Timeline
const tl = createTimeline({ defaults: { duration: 0.5, ease: 'outQuad' } });
tl.add('.title', { opacity: [0, 1], y: [-20, 0] })
  .add('.subtitle', { opacity: [0, 1] }, '-=0.3')
  .add('.content', { opacity: [0, 1], y: [20, 0] }, '-=0.2');
```

```typescript
// ❌ WRONG v3 syntax
import anime from 'animejs'; // WRONG
anime({ targets: '.card', translateX: 250 }); // WRONG
```

See `.github/.gsap/CLAUDE.md` for complete v4 reference.

---

## ✨ Landing Motion Pattern (Current Standard)

- Primary hero CTA should use an **icon slide-in interaction** for emphasis.
- Decorative hero motion can use a **spiral dot-field layer** inspired by generative spiral patterns.
- Trust and feature affordance icons should be **animated inline SVGs** (Lucide-style motion cues).
- Always include `prefers-reduced-motion` handling to disable non-essential motion.

---

## 🔔 Global Feedback & Navigation UX

- Use the global **goey-toast** host mounted in `AppComponent` for async success/error/info feedback.
- Trigger toasts from feature components via a shared `ToastService` instead of local alert banners when action outcomes are transient.
- Include a global **scroll-to-top with circular progress indicator** in the root shell.
- For unknown routes, use a dedicated standalone **Not Found** page component and route wildcard traffic to it.

---

## 📐 Forms (Reactive)

### Creating Reactive Forms

```typescript
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="name" />
      @if (form.get('name')?.errors?.['required'] && form.get('name')?.touched) {
        <span class="error">Name is required</span>
      }
      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `
})
export class MyFormComponent {
  private readonly fb = inject(FormBuilder);
  
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]]
  });
  
  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
```

---

## 🔍 Testing Patterns

### Component Testing

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
        provideHttpClientTesting()
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Running Tests

```bash
# All tests (headless)
npm run test -- --watch=false --browsers=ChromeHeadless

# Single file
npm run test -- --include src/app/features/dashboard/dashboard.component.spec.ts --watch=false --browsers=ChromeHeadless

# Watch mode (development)
npm run test
```

---

## 📚 Reference Documentation

For detailed Angular 21 documentation, see:
- `.github/.angular/llms-full.txt` - Complete Angular docs
- `.github/.angular/best-practices.md` - Coding standards
- `.github/.angular/guidelines.md` - Style guide

---

*Remember: Angular 21 = Standalone + Signals + Native Control Flow*
