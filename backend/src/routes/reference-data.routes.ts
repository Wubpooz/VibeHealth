import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import type { ActivityType, MealType } from '@prisma/client';
import { localeMiddleware, getLocale } from '../middleware/locale.middleware';

const app = new Hono();

app.use('*', localeMiddleware);

app.get('/conditions', async (c) => {
  const locale = getLocale(c);
  const query = c.req.query('q');

  const where = {
    locale,
    isActive: true,
    ...(query
      ? {
          name: {
            contains: query,
            mode: 'insensitive' as const,
          },
        }
      : {}),
  };

  let conditions = await prisma.onboardingCondition.findMany({
    where,
    orderBy: { name: 'asc' },
    take: 250,
  });

  if (conditions.length === 0 && locale !== 'en') {
    conditions = await prisma.onboardingCondition.findMany({
      where: {
        locale: 'en',
        isActive: true,
        ...(query
          ? {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      orderBy: { name: 'asc' },
      take: 250,
    });
  }

  return c.json(conditions.map((item: { name: string }) => item.name));
});

app.get('/allergies', async (c) => {
  const locale = getLocale(c);
  const query = c.req.query('q');

  const where = {
    locale,
    isActive: true,
    ...(query
      ? {
          name: {
            contains: query,
            mode: 'insensitive' as const,
          },
        }
      : {}),
  };

  let allergies = await prisma.onboardingAllergy.findMany({
    where,
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
    take: 250,
  });

  if (allergies.length === 0 && locale !== 'en') {
    allergies = await prisma.onboardingAllergy.findMany({
      where: {
        locale: 'en',
        isActive: true,
        ...(query
          ? {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      take: 250,
    });
  }

  return c.json(allergies.map((item: { name: string }) => item.name));
});

app.get('/medications', async (c) => {
  const locale = getLocale(c);
  const query = c.req.query('q');

  const where = {
    locale,
    isActive: true,
    ...(query
      ? {
          name: {
            contains: query,
            mode: 'insensitive' as const,
          },
        }
      : {}),
  };

  let medications = await prisma.onboardingMedication.findMany({
    where,
    orderBy: { name: 'asc' },
    take: 250,
  });

  if (medications.length === 0 && locale !== 'en') {
    medications = await prisma.onboardingMedication.findMany({
      where: {
        locale: 'en',
        isActive: true,
        ...(query
          ? {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      orderBy: { name: 'asc' },
      take: 250,
    });
  }

  return c.json(medications.map((item: { name: string }) => item.name));
});

app.get('/activities', async (c) => {
  const query = c.req.query('q')?.toLowerCase();
  const category = c.req.query('category')?.toUpperCase();
  const activityCatalog = prisma.activityCatalog;

  const activities = await activityCatalog.findMany({
    where: {
      isActive: true,
      ...(category ? { category: category as ActivityType } : {}),
      ...(query
        ? {
            OR: [
              { key: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { tags: { hasSome: [query] } },
            ],
          }
        : {}),
    },
    orderBy: [{ category: 'asc' }, { metValue: 'desc' }, { name: 'asc' }],
    take: 250,
  });

  return c.json(activities);
});

app.get('/meals', async (c) => {
  const query = c.req.query('q')?.toLowerCase();
  const mealType = c.req.query('mealType')?.toUpperCase();
  const mealCatalog = prisma.mealCatalog;

  const meals = await mealCatalog.findMany({
    where: {
      isActive: true,
      ...(mealType ? { mealType: mealType as MealType } : {}),
      ...(query
        ? {
            OR: [
              { key: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
              { tags: { hasSome: [query] } },
            ],
          }
        : {}),
    },
    orderBy: [{ mealType: 'asc' }, { calories: 'asc' }, { name: 'asc' }],
    take: 200,
  });

  return c.json(meals);
});

export default app;
