/**
 * Bun test preload script.
 *
 * This file is loaded by Bun BEFORE any test file is parsed, so mock.module()
 * calls here intercept every subsequent import of the targeted modules —
 * preventing Prisma from opening a DB connection and BetterAuth from validating
 * its configuration at startup.
 *
 * IMPORTANT: mock.module() keys on the specifier string as supplied, NOT the
 * resolved path. We therefore register mocks under EVERY alias that appears in
 * the codebase so that whichever relative string an importer uses they all hit
 * the same stub.
 */
import { mock } from 'bun:test';
import path from 'path';

// Absolute path to the src/lib directory (stable regardless of caller)
const libDir = path.resolve(import.meta.dir, '../lib');
const prismaAbsPath = path.join(libDir, 'prisma');
const authAbsPath   = path.join(libDir, 'auth');

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

// ── Register under all specifier aliases used across the codebase ─────────────

// 1. Absolute resolved paths (most reliable)
mock.module(prismaAbsPath, () => prismaMock);
mock.module(authAbsPath,   () => authMock);

// 2. Relative from src/tests/setup.ts  (used by setup.ts itself)
mock.module('../lib/prisma', () => prismaMock);
mock.module('../lib/auth',   () => authMock);

// 3. Relative from src/tests/unit/*.test.ts
mock.module('../../lib/prisma', () => prismaMock);
mock.module('../../lib/auth',   () => authMock);

// 4. Relative from src/routes/*.ts  (what the actual route files import)
mock.module('../lib/prisma', () => prismaMock);  // already covered above
mock.module('../lib/auth',   () => authMock);    // already covered above
