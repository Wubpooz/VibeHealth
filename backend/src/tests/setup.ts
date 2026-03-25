/**
 * Bun test preload script.
 *
 * This file is loaded by Bun BEFORE any test file is parsed. We expose shared
 * Prisma/Auth test doubles on globalThis so the real modules can short-circuit
 * to them and the route code + spies always see the same singleton instances.
 */

const prismaMock = {
  prisma: {
    profile: {
      findUnique: () => Promise.resolve(null),
      upsert:     () => Promise.resolve(null),
      create:     () => Promise.resolve(null),
      update:     () => Promise.resolve(null),
      updateMany: () => Promise.resolve({ count: 0 }),
      delete:     () => Promise.resolve(null),
      findMany:   () => Promise.resolve([]),
    },
    medicalId: {
      findUnique: () => Promise.resolve(null),
      upsert:     () => Promise.resolve(null),
      create:     () => Promise.resolve(null),
      update:     () => Promise.resolve(null),
      delete:     () => Promise.resolve(null),
      findMany:   () => Promise.resolve([]),
    },
    activityCatalog: {
      findMany:   () => Promise.resolve([]),
      findFirst:  () => Promise.resolve(null),
      findUnique: () => Promise.resolve(null),
    },
    mealCatalog: {
      findMany:   () => Promise.resolve([]),
      findFirst:  () => Promise.resolve(null),
      findUnique: () => Promise.resolve(null),
    },
    user: {
      findUnique: () => Promise.resolve(null),
      update:     () => Promise.resolve(null),
      create:     () => Promise.resolve(null),
      delete:     () => Promise.resolve(null),
      findMany:   () => Promise.resolve([]),
    },
    session: {
      findUnique: () => Promise.resolve(null),
      create:     () => Promise.resolve(null),
      delete:     () => Promise.resolve(null),
    },
    workoutPlan: {
      findMany:   () => Promise.resolve([]),
      create:     () => Promise.resolve(null),
      findFirst:  () => Promise.resolve(null),
      update:     () => Promise.resolve(null),
    },
    exerciseCatalog: {
      findMany:   () => Promise.resolve([]),
      createMany: () => Promise.resolve({ count: 0 }),
    },
    workoutPlanExercise: {
      findFirst: () => Promise.resolve(null),
    },
    healthSyncConnection: {
      findMany:   () => Promise.resolve([]),
      upsert:     () => Promise.resolve(null),
      update:     () => Promise.resolve(null),
    },
    $disconnect:  () => Promise.resolve(),
    $transaction: (fn: (prisma: unknown) => unknown) => fn({}),
  },
};

const authMock = {
  auth: {
    api: {
      getSession: () => Promise.resolve(null),
    },
    handler: () => Promise.resolve(new Response('ok', { status: 200 })),
  },
};
// Expose test doubles directly so lib modules can pick them up without
// relying on module-specifier matching.
(globalThis as unknown as { __vibehealthPrismaMock?: typeof prismaMock.prisma }).__vibehealthPrismaMock = prismaMock.prisma;
(globalThis as unknown as { __vibehealthAuthMock?: typeof authMock.auth }).__vibehealthAuthMock = authMock.auth;
