import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import { Hono } from 'hono';

import { prisma } from '../../lib/prisma';
import referenceDataRoutes from '../../routes/reference-data.routes';

const buildApp = () => {
  const app = new Hono();
  app.route('/references', referenceDataRoutes);
  return app;
};

describe('GET /references/medications', () => {
  let findManySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    findManySpy = spyOn(prisma.onboardingMedication, 'findMany');
  });

  afterEach(() => {
    findManySpy?.mockRestore();
  });

  it('returns localized medication names from database', async () => {
    findManySpy.mockResolvedValue([
      { name: 'Ibuprofène' },
      { name: 'Paracétamol' },
    ] as never);

    const app = buildApp();
    const res = await app.request('/references/medications', {
      headers: {
        'x-vibehealth-lang': 'fr',
      },
    });

    const body = (await res.json()) as string[];

    expect(res.status).toBe(200);
    expect(body).toEqual(['Ibuprofène', 'Paracétamol']);
    expect(findManySpy).toHaveBeenCalledTimes(1);
    expect(findManySpy).toHaveBeenCalledWith({
      where: {
        locale: 'fr',
        isActive: true,
      },
      orderBy: { name: 'asc' },
      take: 250,
    });
  });

  it('falls back to english medication names when localized data is unavailable', async () => {
    findManySpy
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([{ name: 'Metformin' }] as never);

    const app = buildApp();
    const res = await app.request('/references/medications', {
      headers: {
        'x-vibehealth-lang': 'fr',
      },
    });

    const body = (await res.json()) as string[];

    expect(res.status).toBe(200);
    expect(body).toEqual(['Metformin']);
    expect(findManySpy).toHaveBeenCalledTimes(2);
    expect(findManySpy).toHaveBeenNthCalledWith(1, {
      where: {
        locale: 'fr',
        isActive: true,
      },
      orderBy: { name: 'asc' },
      take: 250,
    });
    expect(findManySpy).toHaveBeenNthCalledWith(2, {
      where: {
        locale: 'en',
        isActive: true,
      },
      orderBy: { name: 'asc' },
      take: 250,
    });
  });

  it('passes query filter to Prisma for case-insensitive search', async () => {
    findManySpy.mockResolvedValue([{ name: 'Metformin' }] as never);

    const app = buildApp();
    const res = await app.request('/references/medications?q=met', {
      headers: {
        'x-vibehealth-lang': 'en',
      },
    });

    const body = (await res.json()) as string[];

    expect(res.status).toBe(200);
    expect(body).toEqual(['Metformin']);
    expect(findManySpy).toHaveBeenCalledTimes(1);
    expect(findManySpy).toHaveBeenCalledWith({
      where: {
        locale: 'en',
        isActive: true,
        name: {
          contains: 'met',
          mode: 'insensitive',
        },
      },
      orderBy: { name: 'asc' },
      take: 250,
    });
  });
});
