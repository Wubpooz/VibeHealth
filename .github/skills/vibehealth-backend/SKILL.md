---
name: vibehealth-backend
description: Complete reference for Hono + Bun + Prisma development patterns in VibeHealth. Use this for vibehealth-backend related tasks.
---

# 🔧 VibeHealth Backend Development Guide

> **Purpose**: Complete reference for Hono + Bun + Prisma development patterns in VibeHealth.

---

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── routes/                 # API route handlers
│   │   ├── auth.routes.ts      # Authentication endpoints
│   │   ├── profile.routes.ts   # User profile CRUD
│   │   ├── medical-id.routes.ts# Medical ID management
│   │   ├── metrics.routes.ts   # Vitals/hydration/activity/nutrition/goals APIs
│   │   └── reference-data.routes.ts # Autocomplete data
│   │
│   ├── middleware/
│   │   └── auth.middleware.ts  # requireAuth, optionalAuth
│   │
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client instance
│   │   └── auth.ts             # BetterAuth configuration
│   │
│   ├── services/               # Business logic (if needed)
│   └── index.ts                # Hono app entry point
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration files
│
├── tests/                      # Test files
└── package.json                # Scripts & dependencies
```

---

## 📈 Metrics API & Data Conventions

### Route groups (all under `/api/v1/metrics`)
- `/vitals`
- `/hydration`
- `/activities`
- `/meals`
- `/goals`
- `/goals/:id/progress`

### Prisma models used by metrics
- `VitalLog`
- `HydrationLog`
- `ActivityLog`
- `MealLog`
- `Goal`
- `GoalProgress`

### Validation and auth expectations
- Metrics routes must enforce `requireAuth` so user-scoped data cannot leak.
- Validate request body/query params with Zod before Prisma calls.
- Always include `userId` filtering in read/update/delete operations.

---

## ⚡ Hono Essentials

### Basic Route Setup

```typescript
import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';

// Create a route group
const featureRoutes = new Hono();

// Public endpoint (no auth)
featureRoutes.get('/public', async (c) => {
  return c.json({ message: 'Hello, world!' });
});

// Protected endpoint (requires auth)
featureRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user');
  
  try {
    const items = await prisma.feature.findMany({
      where: { userId: user.id }
    });
    return c.json({ items });
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { featureRoutes };
```

### Registering Routes in index.ts

```typescript
// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { authRoutes } from './routes/auth.routes';
import { profileRoutes } from './routes/profile.routes';
import { medicalIdRoutes } from './routes/medical-id.routes';
import { featureRoutes } from './routes/feature.routes';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['http://localhost:4200'],
  credentials: true
}));

// Health check (not versioned)
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes (versioned)
const api = new Hono();
api.route('/auth', authRoutes);
api.route('/profile', profileRoutes);
api.route('/medical-id', medicalIdRoutes);
api.route('/features', featureRoutes);

app.route('/api/v1', api);

export default app;
```

---

## 🔐 Authentication

### BetterAuth Setup

```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  emailAndPassword: {
    enabled: true
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 // 1 hour
    }
  }
});
```

### Email Delivery (useSend)

- Use useSend for auth transactional emails (verification + reset password).
- API base URL: `https://app.usesend.com/api` and send endpoint: `POST /v1/emails`.
- Auth uses `Authorization: Bearer us_*`.
- Keep a development fallback that logs links when keys are missing in dev, while surfacing errors in non-dev.

```bash
USESEND_API_KEY=us_xxx
USESEND_FROM_EMAIL=hello@yourdomain.com
USESEND_BASE_URL=https://app.usesend.com/api
```

### Auth Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Context, Next } from 'hono';
import { auth } from '../lib/auth';

export async function requireAuth(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  });
  
  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  c.set('user', session.user);
  c.set('session', session.session);
  
  await next();
}

export async function optionalAuth(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  });
  
  if (session?.user) {
    c.set('user', session.user);
    c.set('session', session.session);
  }
  
  await next();
}
```

### Auth Routes

```typescript
// src/routes/auth.routes.ts
import { Hono } from 'hono';
import { auth } from '../lib/auth';

const authRoutes = new Hono();

// Mount BetterAuth handler
authRoutes.all('/*', (c) => auth.handler(c.req.raw));

export { authRoutes };
```

---

## 🗄️ Prisma Patterns

### Schema Design

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Use @@map for table naming consistency
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  profile       Profile?
  medicalId     MedicalId?
  sessions      Session[]

  @@map("users")
}

model Profile {
  id                String   @id @default(cuid())
  userId            String   @unique
  dateOfBirth       DateTime?
  biologicalSex     String?
  height            Float?
  weight            Float?
  allergies         String[] @default([])
  medicalConditions String[] @default([])
  currentMedications String[] @default([])
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model MedicalId {
  id                String   @id @default(cuid())
  userId            String   @unique
  bloodType         String?
  allergies         String[] @default([])
  medications       String[] @default([])
  emergencyContacts Json     @default("[]")
  qrCode            String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("medical_ids")
}
```

### Common Query Patterns

```typescript
// Find one with relation
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { profile: true }
});

// Find many with filter
const items = await prisma.feature.findMany({
  where: {
    userId,
    status: 'active'
  },
  orderBy: { createdAt: 'desc' },
  take: 20
});

// Create with relation
const profile = await prisma.profile.create({
  data: {
    userId,
    dateOfBirth: new Date(dateOfBirth),
    biologicalSex,
    allergies: allergies || []
  }
});

// Upsert (create or update)
const medicalId = await prisma.medicalId.upsert({
  where: { userId },
  update: {
    bloodType,
    allergies: allergies || [],
    updatedAt: new Date()
  },
  create: {
    userId,
    bloodType,
    allergies: allergies || []
  }
});

// Update with validation
const updated = await prisma.profile.update({
  where: { userId },
  data: {
    ...updates,
    updatedAt: new Date()
  }
});

// Delete
await prisma.feature.delete({
  where: { id: itemId }
});

// Transaction
const [profile, medicalId] = await prisma.$transaction([
  prisma.profile.update({ ... }),
  prisma.medicalId.update({ ... })
]);
```

---

## 📝 Route Patterns

### CRUD Example

```typescript
import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';

const featureRoutes = new Hono();

// GET /api/v1/features - List all
featureRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user');
  
  try {
    const items = await prisma.feature.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    return c.json({ items });
  } catch (error) {
    console.error('Failed to list features:', error);
    return c.json({ error: 'Failed to fetch features' }, 500);
  }
});

// GET /api/v1/features/:id - Get one
featureRoutes.get('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  
  try {
    const item = await prisma.feature.findFirst({
      where: { id, userId: user.id }
    });
    
    if (!item) {
      return c.json({ error: 'Not found' }, 404);
    }
    
    return c.json({ item });
  } catch (error) {
    console.error('Failed to get feature:', error);
    return c.json({ error: 'Failed to fetch feature' }, 500);
  }
});

// POST /api/v1/features - Create
featureRoutes.post('/', requireAuth, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  try {
    const { name, description } = body;
    
    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }
    
    const item = await prisma.feature.create({
      data: {
        userId: user.id,
        name,
        description
      }
    });
    
    return c.json({ item }, 201);
  } catch (error) {
    console.error('Failed to create feature:', error);
    return c.json({ error: 'Failed to create feature' }, 500);
  }
});

// PUT /api/v1/features/:id - Update
featureRoutes.put('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  try {
    // Verify ownership
    const existing = await prisma.feature.findFirst({
      where: { id, userId: user.id }
    });
    
    if (!existing) {
      return c.json({ error: 'Not found' }, 404);
    }
    
    const item = await prisma.feature.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    });
    
    return c.json({ item });
  } catch (error) {
    console.error('Failed to update feature:', error);
    return c.json({ error: 'Failed to update feature' }, 500);
  }
});

// DELETE /api/v1/features/:id - Delete
featureRoutes.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  
  try {
    // Verify ownership
    const existing = await prisma.feature.findFirst({
      where: { id, userId: user.id }
    });
    
    if (!existing) {
      return c.json({ error: 'Not found' }, 404);
    }
    
    await prisma.feature.delete({ where: { id } });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Failed to delete feature:', error);
    return c.json({ error: 'Failed to delete feature' }, 500);
  }
});

export { featureRoutes };
```

---

## 🧪 Testing

### Test Setup

```typescript
// tests/feature.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import app from '../src/index';

describe('Feature Routes', () => {
  beforeAll(async () => {
    // Setup test database, seed data
  });
  
  afterAll(async () => {
    // Cleanup
  });
  
  it('should return 401 without auth', async () => {
    const res = await app.request('/api/v1/features');
    expect(res.status).toBe(401);
  });
  
  it('should list features for authenticated user', async () => {
    const res = await app.request('/api/v1/features', {
      headers: {
        'Cookie': 'session=valid-session-token'
      }
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toBeDefined();
  });
});
```

### Running Tests

```bash
# All tests
bun test

# Specific file
bun test src/routes/feature.test.ts

# Specific test name
bun test -t "should list features"

# Watch mode
bun test --watch
```

---

## 🔧 Database Commands

```bash
# Generate Prisma client after schema changes
bun run db:generate

# Push schema to database (development)
bun run db:push

# Create migration (production-ready)
bun run db:migrate

# Open Prisma Studio (GUI)
bun run db:studio

# Reset database (⚠️ deletes all data)
bunx prisma migrate reset
```

---

## 📊 Response Patterns

### Success Responses

```typescript
// Single item
return c.json({ item: { ... } });

// Collection
return c.json({ items: [...] });

// Created
return c.json({ item: { ... } }, 201);

// No content
return c.body(null, 204);

// With metadata
return c.json({
  items: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 100
  }
});
```

### Error Responses

```typescript
// Bad request
return c.json({ error: 'Name is required' }, 400);

// Unauthorized
return c.json({ error: 'Unauthorized' }, 401);

// Forbidden
return c.json({ error: 'Access denied' }, 403);

// Not found
return c.json({ error: 'Resource not found' }, 404);

// Server error
return c.json({ error: 'Internal server error' }, 500);
```

---

## 🔒 Security Checklist

- [ ] All sensitive routes use `requireAuth` middleware
- [ ] User ID is taken from session, not request body
- [ ] Ownership verified before update/delete operations
- [ ] Input validation on all POST/PUT endpoints
- [ ] Errors logged but not exposed to client
- [ ] CORS configured for frontend origin only
- [ ] Session cookies are httpOnly and secure

---

## 📚 Reference Documentation

For detailed Hono documentation, see:
- `.github/.hono/llms-full.txt` - Complete Hono docs

---

*Remember: All routes under `/api/v1`, always use `requireAuth` for protected endpoints.*
