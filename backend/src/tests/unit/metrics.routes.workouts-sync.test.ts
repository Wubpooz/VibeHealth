import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import { Hono } from 'hono';
import { metricsRoutes } from '../../routes/metrics.routes';
import { prisma } from '../../lib/prisma';
import * as authLib from '../../lib/auth';
import { mockUser, mockSession } from '../helpers/mock-auth';

const buildApp = () => {
  const app = new Hono();
  app.route('/metrics', metricsRoutes);
  return app;
};

const getAuthSpy = () =>
  spyOn(authLib.auth.api, 'getSession').mockResolvedValue({
    user: mockUser,
    session: mockSession,
  } as never);

describe('Workout & sync metrics routes', () => {
  let authGetSessionSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    authGetSessionSpy = getAuthSpy();
  });

  afterEach(() => {
    authGetSessionSpy?.mockRestore();
  });

  it('builds workout suggestions from profile', async () => {
    const profileSpy = spyOn(prisma.profile, 'findUnique').mockResolvedValue({
      fitnessLevel: 'moderate',
      goals: ['strength'],
    } as never);
    const exercisesSpy = spyOn(prisma.exerciseCatalog, 'findMany').mockResolvedValue([] as never);

    const app = buildApp();
    const res = await app.request('/metrics/workouts/suggestions');
    expect(res.status).toBe(200);

    expect(profileSpy).toHaveBeenCalled();
    expect(exercisesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { in: ['STRENGTH'] },
        }),
      }),
    );

    profileSpy.mockRestore();
    exercisesSpy.mockRestore();
  });

  it('creates workout plan with suggested defaults', async () => {
    const profileSpy = spyOn(prisma.profile, 'findUnique').mockResolvedValue({
      fitnessLevel: 'light',
      goals: [],
    } as never);
    const catalogSpy = spyOn(prisma.exerciseCatalog, 'findMany').mockResolvedValue([
      {
        id: 'ex-1',
        defaultSets: 3,
        defaultRepsMin: 8,
        defaultRepsMax: 12,
        defaultRestSeconds: 60,
      },
    ] as never);
    const createSpy = spyOn(prisma.workoutPlan, 'create').mockResolvedValue({
      id: 'plan-1',
      userId: mockUser.id,
      name: 'Starter Plan',
      description: null,
      difficulty: 'BEGINNER',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      exercises: [],
    } as never);

    const app = buildApp();
    const res = await app.request('/metrics/workout-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Starter Plan' }),
    });

    expect(res.status).toBe(201);
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: mockUser.id,
          name: 'Starter Plan',
          exercises: expect.objectContaining({
            create: [
              expect.objectContaining({
                exerciseCatalogId: 'ex-1',
                sets: 3,
                repsMin: 8,
                repsMax: 12,
                restSeconds: 60,
              }),
            ],
          }),
        }),
      }),
    );

    profileSpy.mockRestore();
    catalogSpy.mockRestore();
    createSpy.mockRestore();
  });

  it('connects sync provider with placeholder status', async () => {
    const upsertSpy = spyOn(prisma.healthSyncConnection, 'upsert').mockResolvedValue({
      id: 'sync-1',
      userId: mockUser.id,
      provider: 'GOOGLE_FIT',
      connected: true,
      autoSync: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSyncAt: null,
    } as never);

    const app = buildApp();
    const res = await app.request('/metrics/sync/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'GOOGLE_FIT' }),
    });
    const body = await res.json() as { status: string };

    expect(res.status).toBe(200);
    expect(body.status).toBe('connected_placeholder');
    expect(upsertSpy).toHaveBeenCalled();
    upsertSpy.mockRestore();
  });
});
