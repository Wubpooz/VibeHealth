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

app.get('/practitioners', async (c) => {
  const family = c.req.query('family');
  const given = c.req.query('given');
  const name = c.req.query('name');
  const identifier = c.req.query('identifier');
  const active = c.req.query('active');
  const _count = c.req.query('_count') ?? '30';
  const _revinclude = c.req.query('_revinclude') ?? 'PractitionerRole:practitioner';

  const fhirBase = process.env.SANTE_FHIR_BASE || 'https://gateway.api.esante.gouv.fr/fhir/v2/Practitioner';
  const apiKey = process.env.SANTE_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'Missing ESANTE_API_KEY environment variable' }, 500);
  }

  const params = new URLSearchParams();
  if (family) params.set('family', family);
  if (given) params.set('given', given);
  if (name) params.set('name', name);
  if (identifier) params.set('identifier', identifier);
  if (active) params.set('active', active);
  params.set('_count', String(_count));
  params.set('_revinclude', _revinclude);

  const apiUrl = `${fhirBase}?${params.toString()}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/fhir+json',
        'ESANTE-API-KEY': apiKey,
      },
    });

    if (!response.ok) {
      console.error('FHIR Practitioner API returned', response.status, await response.text());
      return c.json({ error: 'Failed to fetch practitioners from FHIR service' }, 502);
    }

    const bundle = (await response.json()) as { entry?: Array<{ resource?: unknown }> };
    const entries = Array.isArray(bundle.entry) ? bundle.entry : [];

    const practitioners = entries
      .map((entry, index) => {
        const res = (entry as { resource?: unknown }).resource as Record<string, unknown> | undefined;
        if (res?.resourceType !== 'Practitioner') {
          return null;
        }

        const nameArr = Array.isArray(res.name) ? (res.name as unknown[]) : undefined;
        const nameObj = nameArr && nameArr.length > 0 ? (nameArr[0] as { prefix?: string[]; given?: string[]; family?: string; text?: string }) : undefined;
        const displayName =
          nameObj?.text ||
          [nameObj?.prefix?.[0], ...(nameObj?.given || []), nameObj?.family].filter(Boolean).join(' ') ||
          (res.id as string | undefined) ||
          'Dr. UNKNOWN';

        const qualificationArr = Array.isArray(res.qualification) ? (res.qualification as unknown[]) : [];
        const qualification0 = qualificationArr[0] as Record<string, unknown> | undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const specialtyCode = ((qualification0?.code as any)?.coding?.[0]?.display as string | undefined) || '';

        const practitionerRoleArr = Array.isArray(res.practitionerRole) ? (res.practitionerRole as unknown[]) : [];
        const practitionerRole0 = practitionerRoleArr[0] as { code?: unknown } | undefined;
        const roleCode = practitionerRole0?.code;
        const role = ((roleCode as { [index: number]: unknown } | undefined)?.[0] as { text?: string } | undefined)?.text || 'Practitioner';

        let category: 'GP' | 'Dentist' | 'Therapist' | 'Pediatrician' = 'GP';
        if (/dent/i.test(specialtyCode)) category = 'Dentist';
        else if (/pédi|pedi/i.test(specialtyCode)) category = 'Pediatrician';
        else if (/psych|thérapeute|therapist/i.test(specialtyCode)) category = 'Therapist';

        const addressArr = Array.isArray(res.address) ? res.address : undefined;
        const address = addressArr ? (addressArr[0] as { extension?: unknown[] }) : undefined;
        const extArr = Array.isArray(address?.extension)
          ? (address.extension as Array<{ url?: string; valueDecimal?: number | string }>)
          : [];
        const latExt = extArr.find((ext) => ext.url?.includes('latitude'));
        const lngExt = extArr.find((ext) => ext.url?.includes('longitude'));
        const lat = Number(latExt?.valueDecimal) || 48.8566;
        const lng = Number(lngExt?.valueDecimal) || 2.3522;

        const colors = ['#7f9cf5', '#f97316', '#2dd4bf', '#f43f5e', '#10b981'];

        return {
          id: res.id || `practitioner-${index}`,
          name: displayName,
          role,
          category,
          rating: Number((4.5 + (index % 5) * 0.1).toFixed(1)),
          distanceKm: (index + 1) * 0.5,
          location: {
            lat,
            lng,
          },
          avatarColor: colors[index % colors.length],
        };
      })
      .filter(Boolean);

    return c.json(practitioners);
  } catch (error) {
    console.error('Failed to fetch practitioners', error);
    return c.json({ error: 'Unable to fetch practitioners' }, 502);
  }
});

export default app;
