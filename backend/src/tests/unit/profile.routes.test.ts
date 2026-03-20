/**
 * Unit tests for profile routes.
 *
 * The preload (setup.ts) stubs lib/prisma and lib/auth before any module loads.
 * Here we import the stubbed prisma module and replace its methods with spies
 * so we can assert on calls and control return values per-test.
 */
import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import { Hono } from 'hono';

import { prisma } from '../../lib/prisma';
import * as authLib from '../../lib/auth';
import { profileRoutes } from '../../routes/profile.routes';
import { mockUser, mockSession } from '../helpers/mock-auth';

// ─── Fixture ──────────────────────────────────────────────────────────────────
const existingProfile = {
  id: 'profile-id-001',
  userId: mockUser.id,
  dateOfBirth: new Date('1990-06-15'),
  biologicalSex: 'male',
  height: 180,
  weight: 80,
  fitnessLevel: 'intermediate',
  goals: ['weight_loss', 'endurance'],
  medicalConditions: [],
  allergies: ['peanuts'],
  currentMedications: [],
  notificationPreferences: { email: true, push: true },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── App factory ──────────────────────────────────────────────────────────────
/**
 * Builds a Hono test app that pre-injects auth context, bypassing the real
 * requireAuth middleware (tested independently in auth.middleware.test.ts).
 */
const buildApp = () => {
  const app = new Hono();

  // Short-circuit requireAuth by pre-populating the context store
  app.use('*', async (c, next) => {
    c.set('user', mockUser);
    c.set('session', mockSession);
    await next();
  });

  app.route('/profile', profileRoutes);
  return app;
};

const postProfile = (app: Hono, payload: Record<string, unknown>) =>
  app.request('/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

// ─── Global auth stub ─────────────────────────────────────────────────────────
// profileRoutes always runs requireAuth (which calls auth.api.getSession).
// Stub it to return a valid session so route handlers actually execute.
let authGetSessionSpy: ReturnType<typeof spyOn>;

beforeEach(() => {
  authGetSessionSpy = spyOn(authLib.auth.api, 'getSession').mockResolvedValue({
    user: mockUser,
    session: mockSession,
  } as never);
});

afterEach(() => {
  authGetSessionSpy?.mockRestore();
});

// ─── GET /profile ─────────────────────────────────────────────────────────────
describe('GET /profile', () => {
  let findUniqueSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    findUniqueSpy = spyOn(prisma.profile, 'findUnique');
  });

  afterEach(() => {
    findUniqueSpy?.mockRestore();
  });

  it('returns 200 with the profile when one exists', async () => {
    findUniqueSpy.mockResolvedValue(existingProfile as never);

    const app = buildApp();
    const res = await app.request('/profile');
    const body: any = await res.json();

    expect(res.status).toBe(200);
    expect(body.hasProfile).toBe(true);
    expect(body.profile.userId).toBe(mockUser.id);
  });

  it('queries Prisma with the authenticated user id', async () => {
    findUniqueSpy.mockResolvedValue(existingProfile as never);

    const app = buildApp();
    await app.request('/profile');

    expect(findUniqueSpy).toHaveBeenCalledWith({
      where: { userId: mockUser.id },
    });
  });

  it('returns hasProfile: false when no profile exists', async () => {
    findUniqueSpy.mockResolvedValue(null as never);

    const app = buildApp();
    const res = await app.request('/profile');
    const body: any = await res.json();

    expect(res.status).toBe(200);
    expect(body.hasProfile).toBe(false);
    expect(body.profile).toBeNull();
  });

  it('returns 500 when Prisma throws', async () => {
    findUniqueSpy.mockImplementation(() => Promise.reject(new Error('DB connection lost')));

    const app = buildApp();
    const res = await app.request('/profile');
    const body: any = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBeDefined();
  });
});

// ─── POST /profile ────────────────────────────────────────────────────────────
describe('POST /profile', () => {
  let upsertSpy: ReturnType<typeof spyOn>;
  let userUpdateSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    upsertSpy = spyOn(prisma.profile, 'upsert');
    userUpdateSpy = spyOn(prisma.user, 'update');
    upsertSpy.mockResolvedValue(existingProfile as never);
    userUpdateSpy.mockResolvedValue({ ...mockUser, name: 'Updated' } as never);
  });

  afterEach(() => {
    upsertSpy?.mockRestore();
    userUpdateSpy?.mockRestore();
  });

  it('returns 200 with success: true on a valid payload', async () => {
    const app = buildApp();
    const res = await postProfile(app, {
      dateOfBirth: '1990-06-15',
      biologicalSex: 'male',
      height: 180,
      heightUnit: 'cm',
      weight: 80,
      weightUnit: 'kg',
      fitnessLevel: 'intermediate',
      goals: ['weight_loss'],
      name: 'Test User',
    });
    const body: any = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.profile).toBeDefined();
  });

  it('calls prisma.profile.upsert with the authenticated userId', async () => {
    const app = buildApp();
    await postProfile(app, { height: 175, heightUnit: 'cm', weight: 70, weightUnit: 'kg' });

    expect(upsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: mockUser.id },
        create: expect.objectContaining({ userId: mockUser.id }),
        update: expect.objectContaining({ userId: mockUser.id }),
      }),
    );
  });

  // ── Unit-conversion math ───────────────────────────────────────────────────

  it('converts feet → centimetres: 6 ft = 183 cm', async () => {
    const app = buildApp();
    await postProfile(app, { height: 6, heightUnit: 'ft', weight: 70, weightUnit: 'kg' });

    const { create } = upsertSpy.mock.calls[0][0] as { create: { height: number } };
    // 6 × 30.48 = 182.88 → Math.round → 183
    expect(create.height).toBe(183);
  });

  it('converts pounds → kilograms: 154 lb ≈ 69.9 kg', async () => {
    const app = buildApp();
    await postProfile(app, { height: 175, heightUnit: 'cm', weight: 154, weightUnit: 'lb' });

    const { create } = upsertSpy.mock.calls[0][0] as { create: { weight: number } };
    // 154 × 0.453592 = 69.853… → ×10 → 698.53 → round → 699 → /10 → 69.9
    expect(create.weight).toBe(69.9);
  });

  it('keeps height in cm unchanged when unit is cm', async () => {
    const app = buildApp();
    await postProfile(app, { height: 175, heightUnit: 'cm', weight: 70, weightUnit: 'kg' });

    const { create } = upsertSpy.mock.calls[0][0] as { create: { height: number } };
    expect(create.height).toBe(175);
  });

  it('keeps weight in kg unchanged when unit is kg', async () => {
    const app = buildApp();
    await postProfile(app, { height: 175, heightUnit: 'cm', weight: 72, weightUnit: 'kg' });

    const { create } = upsertSpy.mock.calls[0][0] as { create: { weight: number } };
    expect(create.weight).toBe(72);
  });

  // ── Null / falsy inputs ────────────────────────────────────────────────────

  it('stores null height when value is 0', async () => {
    const app = buildApp();
    await postProfile(app, { height: 0, heightUnit: 'cm', weight: 70, weightUnit: 'kg' });

    const { create } = upsertSpy.mock.calls[0][0] as { create: { height: null } };
    expect(create.height).toBeNull();
  });

  it('stores null weight when value is 0', async () => {
    const app = buildApp();
    await postProfile(app, { height: 175, heightUnit: 'cm', weight: 0, weightUnit: 'kg' });

    const { create } = upsertSpy.mock.calls[0][0] as { create: { weight: null } };
    expect(create.weight).toBeNull();
  });

  it('defaults all array fields to [] when omitted', async () => {
    const app = buildApp();
    await postProfile(app, { height: 175, heightUnit: 'cm', weight: 70, weightUnit: 'kg' });

    const { create } = upsertSpy.mock.calls[0][0] as {
      create: { goals: []; medicalConditions: []; allergies: []; currentMedications: [] };
    };
    expect(create.goals).toEqual([]);
    expect(create.medicalConditions).toEqual([]);
    expect(create.allergies).toEqual([]);
    expect(create.currentMedications).toEqual([]);
  });

  // ── Name update ────────────────────────────────────────────────────────────

  it('updates the user name when name is provided', async () => {
    const app = buildApp();
    await postProfile(app, {
      name: 'New Name',
      height: 175,
      heightUnit: 'cm',
      weight: 70,
      weightUnit: 'kg',
    });

    expect(userUpdateSpy).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: { name: 'New Name' },
    });
  });

  it('does NOT update the user name when name is omitted', async () => {
    const app = buildApp();
    await postProfile(app, { height: 175, heightUnit: 'cm', weight: 70, weightUnit: 'kg' });

    expect(userUpdateSpy).not.toHaveBeenCalled();
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  it('returns 500 when Prisma upsert throws', async () => {
    upsertSpy.mockImplementation(() => Promise.reject(new Error('Constraint violation')));

    const app = buildApp();
    const res = await postProfile(app, {
      height: 175,
      heightUnit: 'cm',
      weight: 70,
      weightUnit: 'kg',
    });
    const body: any = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBeDefined();
  });
});

// ─── Auth guard integration ───────────────────────────────────────────────────
describe('Profile routes auth guard', () => {
  it('returns 401 when request has no session', async () => {
    // Build app WITHOUT the auth bypass — use the real requireAuth middleware
    const guardedApp = new Hono();

    // Make auth.api.getSession return null for this test
    spyOn(authLib.auth.api, 'getSession').mockResolvedValue(null as never);

    guardedApp.route('/profile', profileRoutes);

    const res = await guardedApp.request('/profile');
    expect(res.status).toBe(401);
  });
});
