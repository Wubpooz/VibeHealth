/**
 * Re-exports types for the mocked Prisma shape.
 * The actual mock instance is registered in setup.ts.
 * Tests import `prisma` directly from `../lib/prisma` and spyOn its methods.
 */
export type PrismaModelStub = {
  findUnique: () => Promise<unknown>;
  upsert: () => Promise<unknown>;
  create: () => Promise<unknown>;
  update: () => Promise<unknown>;
  delete: () => Promise<unknown>;
  findMany: () => Promise<unknown[]>;
};
