import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const isTest = process.env.NODE_ENV === 'test';

const testPrisma = {
  profile: {
    findUnique: () => Promise.resolve(null),
    upsert: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    updateMany: () => Promise.resolve({ count: 0 }),
    delete: () => Promise.resolve(null),
    deleteMany: () => Promise.resolve({ count: 0 }),
    findMany: () => Promise.resolve([]),
  },
  medicalId: {
    findUnique: () => Promise.resolve(null),
    upsert: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
    deleteMany: () => Promise.resolve({ count: 0 }),
    findMany: () => Promise.resolve([]),
  },
  activityCatalog: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    findUnique: () => Promise.resolve(null),
  },
  mealCatalog: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    findUnique: () => Promise.resolve(null),
  },
  user: {
    findUnique: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
  },
  session: {
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
  },
  workoutPlan: {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve(null),
    findFirst: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    updateMany: () => Promise.resolve({ count: 0 }),
    deleteMany: () => Promise.resolve({ count: 0 }),
  },
  exerciseCatalog: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    findUnique: () => Promise.resolve(null),
    upsert: () => Promise.resolve(null),
    createMany: () => Promise.resolve({ count: 0 }),
  },
  workoutPlanExercise: {
    findFirst: () => Promise.resolve(null),
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
  },
  healthSyncConnection: {
    findMany: () => Promise.resolve([]),
    upsert: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    deleteMany: () => Promise.resolve({ count: 0 }),
  },
  vitalLog: {
    findMany: () => Promise.resolve([]),
    deleteMany: () => Promise.resolve({ count: 0 }),
  },
  hydrationLog: {
    findMany: () => Promise.resolve([]),
    deleteMany: () => Promise.resolve({ count: 0 }),
  },
  activityLog: {
    findMany: () => Promise.resolve([]),
    deleteMany: () => Promise.resolve({ count: 0 }),
  },
  mealLog: {
    findMany: () => Promise.resolve([]),
    deleteMany: () => Promise.resolve({ count: 0 }),
  },
  goal: {
    findMany: () => Promise.resolve([]),
    deleteMany: () => Promise.resolve({ count: 0 }),
  },
  moodLog: {
    findMany: () => Promise.resolve([]),
    deleteMany: () => Promise.resolve({ count: 0 }),
  },
  journalEntry: {
    findMany: () => Promise.resolve([]),
    deleteMany: () => Promise.resolve({ count: 0 }),
  },
  $disconnect: () => Promise.resolve(),
  $transaction: (input: unknown) => {
    if (typeof input === 'function') {
      return (input as (prisma: unknown) => unknown)(testPrisma);
    }

    if (Array.isArray(input)) {
      return Promise.all(input);
    }

    return Promise.resolve(input);
  },
};

const runtimePrisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export const prisma: any = isTest ? testPrisma : runtimePrisma;

if (!isTest && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = runtimePrisma;
}
