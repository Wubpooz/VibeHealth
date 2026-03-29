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

const restoreEnvVar = (name: string, value: string | undefined) => {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
};

describe('Workout & sync metrics routes', () => {
  let authGetSessionSpy: ReturnType<typeof spyOn>;
  const originalOAuthEnv = {
    GOOGLE_FIT_OAUTH_CLIENT_ID: process.env.GOOGLE_FIT_OAUTH_CLIENT_ID,
    GOOGLE_FIT_OAUTH_REDIRECT_URI: process.env.GOOGLE_FIT_OAUTH_REDIRECT_URI,
    GOOGLE_FIT_OAUTH_AUTHORIZE_URL: process.env.GOOGLE_FIT_OAUTH_AUTHORIZE_URL,
  };

  beforeEach(() => {
    authGetSessionSpy = getAuthSpy();
  });

  afterEach(() => {
    authGetSessionSpy?.mockRestore();
    restoreEnvVar('GOOGLE_FIT_OAUTH_CLIENT_ID', originalOAuthEnv.GOOGLE_FIT_OAUTH_CLIENT_ID);
    restoreEnvVar('GOOGLE_FIT_OAUTH_REDIRECT_URI', originalOAuthEnv.GOOGLE_FIT_OAUTH_REDIRECT_URI);
    restoreEnvVar('GOOGLE_FIT_OAUTH_AUTHORIZE_URL', originalOAuthEnv.GOOGLE_FIT_OAUTH_AUTHORIZE_URL);
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

  it('adds an exercise to an active workout plan', async () => {
    const findPlanSpy = spyOn(prisma.workoutPlan, 'findFirst')
      .mockResolvedValueOnce({
        id: 'plan-1',
        userId: mockUser.id,
        isActive: true,
        exercises: [{ id: 'plan-ex-1', orderIndex: 1, exerciseCatalogId: 'ex-1' }],
      } as never)
      .mockResolvedValueOnce({
        id: 'plan-1',
        userId: mockUser.id,
        isActive: true,
        exercises: [
          {
            id: 'plan-ex-1',
            workoutPlanId: 'plan-1',
            exerciseCatalogId: 'ex-1',
            orderIndex: 1,
            sets: 3,
            repsMin: 8,
            repsMax: 12,
            restSeconds: 60,
            exercise: {
              id: 'ex-1',
              key: 'EX-1',
              name: 'Existing Exercise',
              category: 'STRENGTH',
              difficulty: 'BEGINNER',
              defaultSets: 3,
              defaultRepsMin: 8,
              defaultRepsMax: 12,
              defaultRestSeconds: 60,
              tags: [],
            },
          },
          {
            id: 'plan-ex-2',
            workoutPlanId: 'plan-1',
            exerciseCatalogId: 'ex-2',
            orderIndex: 2,
            sets: 4,
            repsMin: 6,
            repsMax: 10,
            restSeconds: 90,
            exercise: {
              id: 'ex-2',
              key: 'EX-2',
              name: 'New Exercise',
              category: 'STRENGTH',
              difficulty: 'INTERMEDIATE',
              defaultSets: 4,
              defaultRepsMin: 6,
              defaultRepsMax: 10,
              defaultRestSeconds: 90,
              tags: [],
            },
          },
        ],
      } as never);
    const catalogSpy = spyOn(prisma.exerciseCatalog, 'findFirst').mockResolvedValue({
      id: 'ex-2',
      defaultSets: 4,
      defaultRepsMin: 6,
      defaultRepsMax: 10,
      defaultRestSeconds: 90,
    } as never);
    const createExerciseSpy = spyOn(prisma.workoutPlanExercise, 'create').mockResolvedValue({
      id: 'plan-ex-2',
    } as never);

    const app = buildApp();
    const res = await app.request('/metrics/workout-plans/plan-1/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseCatalogId: 'ex-2' }),
    });

    expect(res.status).toBe(201);
    expect(createExerciseSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workoutPlanId: 'plan-1',
          exerciseCatalogId: 'ex-2',
          orderIndex: 2,
          sets: 4,
          repsMin: 6,
          repsMax: 10,
          restSeconds: 90,
        }),
      }),
    );

    findPlanSpy.mockRestore();
    catalogSpy.mockRestore();
    createExerciseSpy.mockRestore();
  });

  it('removes a workout exercise and reindexes order', async () => {
    const findPlanSpy = spyOn(prisma.workoutPlan, 'findFirst')
      .mockResolvedValueOnce({
        id: 'plan-1',
        userId: mockUser.id,
        isActive: true,
        exercises: [
          { id: 'plan-ex-1' },
          { id: 'plan-ex-2' },
          { id: 'plan-ex-3' },
        ],
      } as never)
      .mockResolvedValueOnce({
        id: 'plan-1',
        userId: mockUser.id,
        isActive: true,
        exercises: [],
      } as never);
    const deleteSpy = spyOn(prisma.workoutPlanExercise, 'delete').mockResolvedValue({ id: 'plan-ex-2' } as never);
    const findManySpy = spyOn(prisma.workoutPlanExercise, 'findMany').mockResolvedValue([
      { id: 'plan-ex-1' },
      { id: 'plan-ex-3' },
    ] as never);
    const updateSpy = spyOn(prisma.workoutPlanExercise, 'update').mockResolvedValue({} as never);

    const app = buildApp();
    const res = await app.request('/metrics/workout-plans/plan-1/exercises/plan-ex-2', {
      method: 'DELETE',
    });

    expect(res.status).toBe(200);
    expect(deleteSpy).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'plan-ex-2' } }));
    expect(updateSpy).toHaveBeenCalledTimes(2);
    expect(updateSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ where: { id: 'plan-ex-1' }, data: { orderIndex: 1 } }),
    );
    expect(updateSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ where: { id: 'plan-ex-3' }, data: { orderIndex: 2 } }),
    );

    findPlanSpy.mockRestore();
    deleteSpy.mockRestore();
    findManySpy.mockRestore();
    updateSpy.mockRestore();
  });

  it('reorders workout exercises in an active plan', async () => {
    const findPlanSpy = spyOn(prisma.workoutPlan, 'findFirst')
      .mockResolvedValueOnce({
        id: 'plan-1',
        userId: mockUser.id,
        isActive: true,
        exercises: [
          { id: 'plan-ex-1' },
          { id: 'plan-ex-2' },
          { id: 'plan-ex-3' },
        ],
      } as never)
      .mockResolvedValueOnce({
        id: 'plan-1',
        userId: mockUser.id,
        isActive: true,
        exercises: [],
      } as never);
    const updateSpy = spyOn(prisma.workoutPlanExercise, 'update').mockResolvedValue({} as never);

    const app = buildApp();
    const res = await app.request('/metrics/workout-plans/plan-1/exercises/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exerciseIds: ['plan-ex-3', 'plan-ex-1', 'plan-ex-2'],
      }),
    });

    expect(res.status).toBe(200);
    expect(updateSpy).toHaveBeenCalledTimes(3);
    expect(updateSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ where: { id: 'plan-ex-3' }, data: { orderIndex: 1 } }),
    );
    expect(updateSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ where: { id: 'plan-ex-1' }, data: { orderIndex: 2 } }),
    );
    expect(updateSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ where: { id: 'plan-ex-2' }, data: { orderIndex: 3 } }),
    );

    findPlanSpy.mockRestore();
    updateSpy.mockRestore();
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

  it('starts oauth placeholder flow when provider config exists', async () => {
    process.env.GOOGLE_FIT_OAUTH_CLIENT_ID = 'client-id';
    process.env.GOOGLE_FIT_OAUTH_REDIRECT_URI = 'https://example.com/oauth/google-fit/callback';
    process.env.GOOGLE_FIT_OAUTH_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

    const app = buildApp();
    const res = await app.request('/metrics/sync/oauth/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'GOOGLE_FIT' }),
    });
    const body = (await res.json()) as { authUrl: string; mode: string };

    expect(res.status).toBe(200);
    expect(body.mode).toBe('oauth_placeholder');
    expect(typeof new URL(body.authUrl).searchParams.get('state')).toBe('string');
  });

  it('finalizes oauth callback by connecting provider in placeholder mode', async () => {
    process.env.GOOGLE_FIT_OAUTH_CLIENT_ID = 'client-id';
    process.env.GOOGLE_FIT_OAUTH_REDIRECT_URI = 'https://example.com/oauth/google-fit/callback';
    process.env.GOOGLE_FIT_OAUTH_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

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
    const start = await app.request('/metrics/sync/oauth/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'GOOGLE_FIT' }),
    });
    const startBody = (await start.json()) as { authUrl: string };
    const state = new URL(startBody.authUrl).searchParams.get('state');
    expect(typeof state).toBe('string');

    const callback = await app.request('/metrics/sync/oauth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, code: 'oauth-code-123' }),
    });
    const callbackBody = (await callback.json()) as { status: string };

    expect(callback.status).toBe(200);
    expect(callbackBody.status).toBe('connected_oauth_placeholder');
    expect(upsertSpy).toHaveBeenCalled();
    upsertSpy.mockRestore();
  });
});
