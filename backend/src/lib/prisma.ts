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
    findMany: () => Promise.resolve([]),
  },
  medicalId: {
    findUnique: () => Promise.resolve(null),
    upsert: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
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
  $disconnect: () => Promise.resolve(),
  $transaction: (fn: (prisma: unknown) => unknown) => fn({}),
};

const runtimePrisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export const prisma: any = isTest ? testPrisma : runtimePrisma;

if (!isTest && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = runtimePrisma;
}
