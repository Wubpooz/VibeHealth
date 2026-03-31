/**
 * Localized Content Routes
 * Provides API endpoints for all hardcoded data migrated to database
 * Supports Accept-Language header and x-vibehealth-lang override
 */

import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { localeMiddleware, getLocale } from '../middleware/locale.middleware';

const localizedRoutes = new Hono();

// Apply locale middleware to all routes
localizedRoutes.use('*', localeMiddleware);

// =============== FIRST AID ROUTES ===============

/**
 * GET /api/v1/localized/first-aid/categories
 * Returns first aid categories in requested locale
 */
localizedRoutes.get('/first-aid/categories', async (c) => {
  const locale = getLocale(c);

  try {
    const categories = await prisma.firstAidCategory.findMany({
      where: {
        locale,
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });

    return c.json({
      locale,
      data: categories,
    });
  } catch (error) {
    console.error('Failed to fetch first aid categories:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

/**
 * GET /api/v1/localized/first-aid/cards
 * Optional query: ?categoryKey=CPR
 */
localizedRoutes.get('/first-aid/cards', async (c) => {
  const locale = getLocale(c);
  const categoryKey = c.req.query('categoryKey');

  try {
    let cards;

    if (categoryKey) {
      cards = await prisma.firstAidCard.findMany({
        where: {
          locale,
          isActive: true,
          category: {
            key: categoryKey,
            locale,
          },
        },
        include: {
          category: true,
        },
        orderBy: { category: { order: 'asc' } },
      });
    } else {
      cards = await prisma.firstAidCard.findMany({
        where: {
          locale,
          isActive: true,
        },
        include: {
          category: true,
        },
        orderBy: { category: { order: 'asc' } },
      });
    }

    // Parse JSON fields and return typed data
    const parsedCards = cards.map((card: {
      stepsJson: string;
      warningsJson: string;
      doNotJson: string;
      whenToCallEmergencyJson: string;
      relatedCardsJson: string | null;
    } & Record<string, unknown>) => ({
      ...card,
      steps: JSON.parse(card.stepsJson),
      warnings: JSON.parse(card.warningsJson),
      doNot: JSON.parse(card.doNotJson),
      whenToCallEmergency: JSON.parse(card.whenToCallEmergencyJson),
      relatedCards: card.relatedCardsJson ? JSON.parse(card.relatedCardsJson) : [],
    }));

    return c.json({
      locale,
      data: parsedCards,
    });
  } catch (error) {
    console.error('Failed to fetch first aid cards:', error);
    return c.json({ error: 'Failed to fetch cards' }, 500);
  }
});

/**
 * GET /api/v1/localized/first-aid/cards/:key
 * Get a single card by key
 */
localizedRoutes.get('/first-aid/cards/:key', async (c) => {
  const locale = getLocale(c);
  const key = c.req.param('key');

  try {
    const card = await prisma.firstAidCard.findFirst({
      where: {
        key,
        locale,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    if (!card) {
      return c.json({ error: 'Card not found' }, 404);
    }

    const parsed = {
      ...card,
      steps: JSON.parse(card.stepsJson),
      warnings: JSON.parse(card.warningsJson),
      doNot: JSON.parse(card.doNotJson),
      whenToCallEmergency: JSON.parse(card.whenToCallEmergencyJson),
      relatedCards: card.relatedCardsJson ? JSON.parse(card.relatedCardsJson) : [],
    };

    return c.json({
      locale,
      data: parsed,
    });
  } catch (error) {
    console.error('Failed to fetch first aid card:', error);
    return c.json({ error: 'Failed to fetch card' }, 500);
  }
});

// =============== EMERGENCY NUMBERS & HELPLINES ===============

/**
 * GET /api/v1/localized/emergency-numbers/:countryCode
 * Returns emergency numbers for a country in requested locale
 */
localizedRoutes.get('/emergency-numbers/:countryCode', async (c) => {
  const locale = getLocale(c);
  const countryCode = c.req.param('countryCode').toUpperCase();

  try {
    const numbers = await prisma.emergencyNumber.findMany({
      where: {
        countryCode,
        locale,
        isActive: true,
      },
    });

    return c.json({
      locale,
      countryCode,
      data: numbers,
    });
  } catch (error) {
    console.error('Failed to fetch emergency numbers:', error);
    return c.json({ error: 'Failed to fetch emergency numbers' }, 500);
  }
});

/**
 * GET /api/v1/localized/helplines/:countryCode
 * Optional query: ?category=SUICIDE
 */
localizedRoutes.get('/helplines/:countryCode', async (c) => {
  const locale = getLocale(c);
  const countryCode = c.req.param('countryCode').toUpperCase();
  const category = c.req.query('category');

  try {
    let helplines;

    if (category) {
      helplines = await prisma.helpline.findMany({
        where: {
          countryCode,
          locale,
          isActive: true,
          category,
        },
      });
    } else {
      helplines = await prisma.helpline.findMany({
        where: {
          countryCode,
          locale,
          isActive: true,
        },
      });
    }

    return c.json({
      locale,
      countryCode,
      data: helplines,
    });
  } catch (error) {
    console.error('Failed to fetch helplines:', error);
    return c.json({ error: 'Failed to fetch helplines' }, 500);
  }
});

// =============== WIKI CONDITIONS ===============

/**
 * GET /api/v1/localized/wiki/conditions
 * Optional query: ?search=hypertension, ?tag=cardiovascular
 */
localizedRoutes.get('/wiki/conditions', async (c) => {
  const locale = getLocale(c);
  const search = c.req.query('search')?.toLowerCase();
  const tag = c.req.query('tag');

  try {
    const conditions = await prisma.wikiCondition.findMany({
      where: {
        locale,
        isActive: true,
      },
    });

    // Parse tags and filter
    const filtered = conditions
      .map((cond: {
        tagsJson: string;
        title: string;
        subtitle: string;
        summary: string;
      } & Record<string, unknown>) => ({
        ...cond,
        tags: JSON.parse(cond.tagsJson) as string[],
      }))
      .filter((c: { title: string; subtitle: string; summary: string; tags: string[] }) => {
        const matchesSearch = !search || (
          c.title.toLowerCase().includes(search) ||
          c.subtitle.toLowerCase().includes(search) ||
          c.summary.toLowerCase().includes(search)
        );
        const matchesTag = !tag || c.tags.includes(tag);
        return matchesSearch && matchesTag;
      });

    return c.json({
      locale,
      data: filtered,
    });
  } catch (error) {
    console.error('Failed to fetch wiki conditions:', error);
    return c.json({ error: 'Failed to fetch conditions' }, 500);
  }
});

/**
 * GET /api/v1/localized/wiki/conditions/:key
 */
localizedRoutes.get('/wiki/conditions/:key', async (c) => {
  const locale = getLocale(c);
  const key = c.req.param('key');

  try {
    const condition = await prisma.wikiCondition.findFirst({
      where: {
        key,
        locale,
        isActive: true,
      },
    });

    if (!condition) {
      return c.json({ error: 'Condition not found' }, 404);
    }

    const parsed = {
      ...condition,
      tags: JSON.parse(condition.tagsJson),
    };

    return c.json({
      locale,
      data: parsed,
    });
  } catch (error) {
    console.error('Failed to fetch wiki condition:', error);
    return c.json({ error: 'Failed to fetch condition' }, 500);
  }
});

// =============== ONBOARDING REFERENCE DATA ===============

/**
 * GET /api/v1/localized/onboarding/goals
 */
localizedRoutes.get('/onboarding/goals', async (c) => {
  const locale = getLocale(c);

  try {
    const goals = await prisma.onboardingGoal.findMany({
      where: {
        locale,
        isActive: true,
      },
    });

    return c.json({
      locale,
      data: goals,
    });
  } catch (error) {
    console.error('Failed to fetch goals:', error);
    return c.json({ error: 'Failed to fetch goals' }, 500);
  }
});

/**
 * GET /api/v1/localized/onboarding/fitness-levels
 */
localizedRoutes.get('/onboarding/fitness-levels', async (c) => {
  const locale = getLocale(c);

  try {
    const levels = await prisma.onboardingFitnessLevel.findMany({
      where: {
        locale,
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });

    return c.json({
      locale,
      data: levels,
    });
  } catch (error) {
    console.error('Failed to fetch fitness levels:', error);
    return c.json({ error: 'Failed to fetch fitness levels' }, 500);
  }
});

/**
 * GET /api/v1/localized/onboarding/conditions
 */
localizedRoutes.get('/onboarding/conditions', async (c) => {
  const locale = getLocale(c);

  try {
    const conditions = await prisma.onboardingCondition.findMany({
      where: {
        locale,
        isActive: true,
      },
    });

    return c.json({
      locale,
      data: conditions,
    });
  } catch (error) {
    console.error('Failed to fetch conditions:', error);
    return c.json({ error: 'Failed to fetch conditions' }, 500);
  }
});

/**
 * GET /api/v1/localized/onboarding/allergies
 * Optional query: ?category=FOOD
 */
localizedRoutes.get('/onboarding/allergies', async (c) => {
  const locale = getLocale(c);
  const category = c.req.query('category');

  try {
    let allergies;

    if (category) {
      allergies = await prisma.onboardingAllergy.findMany({
        where: {
          locale,
          isActive: true,
          category,
        },
      });
    } else {
      allergies = await prisma.onboardingAllergy.findMany({
        where: {
          locale,
          isActive: true,
        },
      });
    }

    return c.json({
      locale,
      data: allergies,
    });
  } catch (error) {
    console.error('Failed to fetch allergies:', error);
    return c.json({ error: 'Failed to fetch allergies' }, 500);
  }
});

export default localizedRoutes;
