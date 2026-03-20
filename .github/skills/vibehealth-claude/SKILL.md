---
name: vibehealth-claude
description: Claude-specific guidance and examples. Use this for vibehealth-claude related tasks.
---

# 🤖 Claude-Specific Instructions for VibeHealth

> **Purpose**: Claude-specific guidance, examples, and patterns for working on VibeHealth.

---

## 🎯 Your Role

You are a **senior full-stack developer** working on VibeHealth. You have deep expertise in:
- Angular 21 with signals, standalone components, and zoneless change detection
- Hono + Bun backend development
- Prisma ORM with PostgreSQL
- PWA architecture with offline-first patterns
- Accessible, performant UI development

---

## 📋 Pre-Flight Checklist

Before making changes, verify:

- [ ] Read `SKILL.md` for project context
- [ ] Check `roadmap.md` for feature scope
- [ ] Review existing patterns in similar files
- [ ] Understand the "Soft Pop" design aesthetic
- [ ] Know the i18n requirements (en.json + fr.json)

---

## 🏗️ Code Generation Patterns

### Creating a New Angular Component

```typescript
// ✅ CORRECT: Modern Angular 21 pattern
import { Component, signal, computed, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-feature-name',
  // Note: standalone: true is DEFAULT in Angular 20+, do NOT include it
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="feature-container">
      @if (loading()) {
        <div class="loading-state">{{ 'common.loading' | translate }}</div>
      } @else {
        <h2>{{ title() }}</h2>
        @for (item of items(); track item.id) {
          <div class="item-card" (click)="onItemClick(item)">
            {{ item.name }}
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .feature-container {
      padding: 1.5rem;
      background: linear-gradient(135deg, #fff5f2 0%, #fff 100%);
      border-radius: 1.5rem;
    }
    .item-card {
      padding: 1rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      margin-bottom: 0.75rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .item-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    }
  `]
})
export class FeatureNameComponent {
  // Dependency injection
  private readonly someService = inject(SomeService);
  
  // Inputs (new function-based API)
  readonly title = input<string>('Default Title');
  
  // Outputs (new function-based API)
  readonly itemSelected = output<Item>();
  
  // Signals for local state
  protected readonly loading = signal(false);
  protected readonly items = signal<Item[]>([]);
  
  // Computed values
  protected readonly itemCount = computed(() => this.items().length);
  
  onItemClick(item: Item): void {
    this.itemSelected.emit(item);
  }
}
```

### Creating a New Hono Route

```typescript
// ✅ CORRECT: Hono route pattern
import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';

const featureRoutes = new Hono();

// GET - List items
featureRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user');
  
  try {
    const items = await prisma.feature.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    return c.json({ items });
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return c.json({ error: 'Failed to fetch items' }, 500);
  }
});

// POST - Create item
featureRoutes.post('/', requireAuth, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  try {
    const { name, description } = body;
    
    const item = await prisma.feature.create({
      data: {
        userId: user.id,
        name,
        description
      }
    });
    
    return c.json({ item }, 201);
  } catch (error) {
    console.error('Failed to create item:', error);
    return c.json({ error: 'Failed to create item' }, 500);
  }
});

export { featureRoutes };
```

### Creating a Service with Signals

```typescript
// ✅ CORRECT: Service pattern with signals
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FeatureService {
  private readonly http = inject(HttpClient);
  
  // Private writable signals
  private readonly _items = signal<Item[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  
  // Public readonly signals
  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  
  // Computed values
  readonly hasItems = computed(() => this._items().length > 0);
  readonly itemCount = computed(() => this._items().length);
  
  async loadItems(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    
    try {
      const response = await this.http.get<{ items: Item[] }>('/api/v1/features', {
        withCredentials: true
      }).toPromise();
      
      this._items.set(response?.items ?? []);
    } catch (err: any) {
      this._error.set(err.message || 'Failed to load items');
    } finally {
      this._loading.set(false);
    }
  }
  
  async addItem(item: Omit<Item, 'id'>): Promise<boolean> {
    try {
      const response = await this.http.post<{ item: Item }>('/api/v1/features', item, {
        withCredentials: true
      }).toPromise();
      
      if (response?.item) {
        this._items.update(items => [...items, response.item]);
        return true;
      }
      return false;
    } catch (err: any) {
      this._error.set(err.message || 'Failed to add item');
      return false;
    }
  }
}
```

---

## 🎨 Styling Patterns (Soft Pop Aesthetic)

### Color Palette
```css
/* Primary gradient (coral → peach) */
background: linear-gradient(135deg, #ff6b6b 0%, #ffa07a 50%, #ffcc80 100%);

/* Soft background */
background: linear-gradient(135deg, #fff5f2 0%, #fff 100%);

/* Card shadows */
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08); /* hover */

/* Accent colors */
--accent-coral: #ff6b6b;
--accent-peach: #ffa07a;
--accent-mint: #b8e6d4;
--accent-lavender: #c5b4e3;
```

### Card Component
```css
.card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 107, 107, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}
```

### Button Styles
```css
.btn-primary {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa07a 100%);
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.875rem 2rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.35);
}
```

---

## 🚫 Anti-Patterns to Avoid

### Angular
```typescript
// ❌ WRONG: Using NgModules
@NgModule({ ... })

// ❌ WRONG: Setting standalone: true (it's default now)
@Component({ standalone: true, ... })

// ❌ WRONG: Using decorators for inputs/outputs
@Input() title: string;
@Output() clicked = new EventEmitter();

// ❌ WRONG: Using *ngIf, *ngFor
<div *ngIf="loading">...</div>
<div *ngFor="let item of items">...</div>

// ❌ WRONG: Using constructor injection
constructor(private service: MyService) {}

// ❌ WRONG: Using mutate() on signals
this.items.mutate(arr => arr.push(item));
```

### Hono
```typescript
// ❌ WRONG: Not using versioned routes
app.get('/users', handler); // Should be /api/v1/users

// ❌ WRONG: Forgetting auth middleware
router.post('/', async (c) => { ... }); // Should use requireAuth

// ❌ WRONG: Not handling errors
const data = await prisma.user.findUnique({ ... }); // Wrap in try/catch
```

### Styling
```css
/* ❌ WRONG: Using backdrop-filter (performance killer) */
backdrop-filter: blur(10px);

/* ❌ WRONG: Generic/boring gradients */
background: linear-gradient(to right, purple, blue);

/* ❌ WRONG: Sharp corners */
border-radius: 4px;
```

---

## 📝 Commit Message Format

```
type(scope): description

[optional body]

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(medical-id): add autocomplete for conditions
fix(auth): handle session expiry gracefully
docs(readme): update installation instructions
```

---

## 🔍 Debugging Tips

### Frontend
```typescript
// Log signal values
console.log('Items:', this.items());

// Track signal changes
effect(() => {
  console.log('Items changed:', this.items());
});
```

### Backend
```typescript
// Enable Hono logger
import { logger } from 'hono/logger';
app.use(logger());

// Debug Prisma queries
const prisma = new PrismaClient({ log: ['query'] });
```

---

## 📚 Reference Loading

When you need detailed documentation, load these files:

```markdown
# For Angular 21 details
See: .github/.angular/llms-full.txt

# For Hono API details  
See: .github/.hono/llms-full.txt

# For Anime.js v4 (CRITICAL: different from v3!)
See: .github/.gsap/CLAUDE.md

# For build/test commands
See: .github/copilot-instructions.md

# For product roadmap
See: roadmap.md
```

---

## 🎯 Task Execution Flow

1. **Understand the request** — What feature/fix is needed?
2. **Check existing patterns** — How do similar features work?
3. **Plan the changes** — Which files need modification?
4. **Implement incrementally** — Small, testable changes
5. **Verify the build** — `bun run typecheck`, `npm run build`
6. **Update i18n** — Add strings to both locales
7. **Test the feature** — Manual verification + unit tests
8. **Document if needed** — Update relevant `.md` files

---

*Remember: Consistency with the existing codebase is more important than personal preferences.*
