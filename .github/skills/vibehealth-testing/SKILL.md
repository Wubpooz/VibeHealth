---
name: vibehealth-testing
description: Unit tests, E2E patterns, coverage requirements. Use this for vibehealth-testing related tasks.
---

# 🧪 VibeHealth Testing Guide

> **Purpose**: Complete reference for testing patterns and requirements in VibeHealth.

---

## 🎯 Testing Philosophy

VibeHealth follows a **practical testing approach**:

1. **Test behavior, not implementation** — Focus on what components do, not how
2. **High confidence, low maintenance** — Tests that catch bugs without breaking on refactors
3. **Fast feedback loops** — Tests should run quickly
4. **Accessibility included** — Test for a11y compliance

---

## 🔧 Test Configuration

### Backend (Bun Test)

```typescript
// bun.config.ts (if needed)
export default {
  test: {
    coverage: true,
    coverageReporter: ['text', 'lcov']
  }
};
```

### Frontend (Karma/Jasmine)

```typescript
// karma.conf.js is pre-configured
// Tests run with: npm run test -- --watch=false --browsers=ChromeHeadless
```

---

## 🖥️ Frontend Testing

### Component Testing Pattern

```typescript
// feature.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';

import { FeatureComponent } from './feature.component';
import { FeatureService } from '@core/feature/feature.service';

describe('FeatureComponent', () => {
  let component: FeatureComponent;
  let fixture: ComponentFixture<FeatureComponent>;
  let mockService: jasmine.SpyObj<FeatureService>;

  beforeEach(async () => {
    // Create mock service with signals
    mockService = jasmine.createSpyObj('FeatureService', ['loadItems', 'addItem'], {
      items: signal([]),
      loading: signal(false),
      error: signal(null)
    });

    await TestBed.configureTestingModule({
      imports: [FeatureComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FeatureService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading state', () => {
    // Update the mock signal
    (mockService.loading as any).set(true);
    fixture.detectChanges();

    const loadingEl = fixture.nativeElement.querySelector('.loading');
    expect(loadingEl).toBeTruthy();
  });

  it('should display items when loaded', () => {
    const testItems = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' }
    ];
    (mockService.items as any).set(testItems);
    fixture.detectChanges();

    const itemEls = fixture.nativeElement.querySelectorAll('.item');
    expect(itemEls.length).toBe(2);
  });

  it('should call loadItems on init', () => {
    expect(mockService.loadItems).toHaveBeenCalled();
  });
});
```

### Testing Signals

```typescript
describe('Signal Testing', () => {
  it('should update computed values', () => {
    const count = signal(0);
    const doubled = computed(() => count() * 2);

    expect(doubled()).toBe(0);

    count.set(5);
    expect(doubled()).toBe(10);
  });
});
```

### Testing Inputs/Outputs

```typescript
describe('Component with Inputs/Outputs', () => {
  it('should accept input values', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('h1');
    expect(titleEl.textContent).toContain('Test Title');
  });

  it('should emit output events', () => {
    const spy = jasmine.createSpy('itemSelected');
    component.itemSelected.subscribe(spy);

    component.onItemClick({ id: '1', name: 'Test' });

    expect(spy).toHaveBeenCalledWith({ id: '1', name: 'Test' });
  });
});
```

### Testing Forms

```typescript
describe('Form Component', () => {
  it('should validate required fields', () => {
    const nameControl = component.form.get('name');
    
    nameControl?.setValue('');
    expect(nameControl?.valid).toBeFalse();
    expect(nameControl?.errors?.['required']).toBeTruthy();

    nameControl?.setValue('John');
    expect(nameControl?.valid).toBeTrue();
  });

  it('should submit valid form', () => {
    spyOn(component, 'onSubmit');

    component.form.patchValue({
      name: 'John Doe',
      email: 'john@example.com'
    });

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    expect(component.onSubmit).toHaveBeenCalled();
  });
});
```

### Testing HTTP Calls

```typescript
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('Service with HTTP', () => {
  let service: FeatureService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FeatureService
      ]
    });

    service = TestBed.inject(FeatureService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding requests
  });

  it('should fetch items', async () => {
    const mockItems = [{ id: '1', name: 'Test' }];

    // Call the service method
    const promise = service.loadItems();

    // Expect a request to the correct URL
    const req = httpMock.expectOne('/api/v1/features');
    expect(req.request.method).toBe('GET');

    // Respond with mock data
    req.flush({ items: mockItems });

    await promise;
    expect(service.items()).toEqual(mockItems);
  });
});
```

---

## 🔧 Backend Testing

### Route Testing Pattern

```typescript
// feature.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import app from '../src/index';
import { prisma } from '../src/lib/prisma';

describe('Feature Routes', () => {
  let authCookie: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create test user and get auth cookie
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    });
    testUserId = user.id;

    // Mock authentication (adjust based on your auth setup)
    authCookie = `session=${testUserId}`;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.user.delete({ where: { id: testUserId } });
  });

  describe('GET /api/v1/features', () => {
    it('should return 401 without auth', async () => {
      const res = await app.request('/api/v1/features');
      expect(res.status).toBe(401);
    });

    it('should return empty array for new user', async () => {
      const res = await app.request('/api/v1/features', {
        headers: { Cookie: authCookie }
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
    });
  });

  describe('POST /api/v1/features', () => {
    it('should create a new feature', async () => {
      const res = await app.request('/api/v1/features', {
        method: 'POST',
        headers: {
          Cookie: authCookie,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'Test Feature' })
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.item.name).toBe('Test Feature');
    });

    it('should validate required fields', async () => {
      const res = await app.request('/api/v1/features', {
        method: 'POST',
        headers: {
          Cookie: authCookie,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Missing name
      });

      expect(res.status).toBe(400);
    });
  });
});
```

### Database Isolation

```typescript
import { describe, it, beforeEach, afterEach } from 'bun:test';
import { prisma } from '../src/lib/prisma';

describe('Database Tests', () => {
  beforeEach(async () => {
    // Clean up before each test
    await prisma.feature.deleteMany({});
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.feature.deleteMany({});
  });

  it('should create and retrieve feature', async () => {
    // Test implementation
  });
});
```

---

## 🧪 Test Commands

### Backend

```bash
# Run all tests
cd backend && bun test

# Run specific file
bun test src/routes/feature.test.ts

# Run tests matching pattern
bun test -t "should create"

# Watch mode
bun test --watch

# With coverage
bun test --coverage
```

### Frontend

```bash
# Run all tests (headless, CI-friendly)
cd frontend && npm run test -- --watch=false --browsers=ChromeHeadless

# Run specific file
npm run test -- --include src/app/features/feature/feature.component.spec.ts --watch=false --browsers=ChromeHeadless

# Watch mode (development)
npm run test

# With coverage
npm run test -- --code-coverage --watch=false --browsers=ChromeHeadless
```

---

## ✅ Testing Checklist

### Before Submitting Code

- [ ] Unit tests pass locally
- [ ] New code has test coverage
- [ ] Tests are descriptive and maintainable
- [ ] No skipped tests without explanation
- [ ] Mocks are minimal and focused

### Test Quality Criteria

- [ ] Tests are independent (can run in any order)
- [ ] Tests are deterministic (same result every run)
- [ ] Tests are fast (< 100ms per test ideally)
- [ ] Tests have clear assertions
- [ ] Tests cover edge cases

---

## 📊 Coverage Goals

| Area | Target | Notes |
|------|--------|-------|
| Backend Routes | 80%+ | Critical paths fully covered |
| Frontend Components | 70%+ | UI rendering and interactions |
| Services | 90%+ | Business logic thoroughly tested |
| Utilities | 100% | Pure functions easy to test |

---

## 🔍 Debugging Tests

### Frontend

```typescript
// Debug output
console.log(fixture.nativeElement.innerHTML);

// Pause execution
debugger;

// Log signal values
console.log('Items:', service.items());
```

### Backend

```typescript
// Debug output
console.log('Response:', await res.json());

// Check Prisma queries
const prisma = new PrismaClient({ log: ['query'] });
```

---

## 🚫 Anti-Patterns

### Don't Do This

```typescript
// ❌ Testing implementation details
expect(component['privateMethod']).toHaveBeenCalled();

// ❌ Brittle selectors
const el = fixture.nativeElement.querySelector('div > div > span.class');

// ❌ Testing framework behavior
expect(signal(5)()).toBe(5); // Angular already tests this

// ❌ Async without proper handling
service.loadItems(); // Missing await
expect(service.items().length).toBe(1); // Will fail
```

### Do This Instead

```typescript
// ✅ Testing behavior
const items = fixture.nativeElement.querySelectorAll('[data-testid="item"]');
expect(items.length).toBe(2);

// ✅ Semantic selectors
const button = fixture.nativeElement.querySelector('[data-testid="submit-btn"]');

// ✅ Testing your code
expect(component.itemCount()).toBe(3);

// ✅ Proper async handling
await service.loadItems();
expect(service.items().length).toBe(1);
```

---

*Remember: Tests are documentation. Write them to explain what your code does.*
