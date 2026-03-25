import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';
import type { Session as AuthSession, User as AuthUser } from 'better-auth';
import { z } from 'zod';
import type { VitalType, ActivityType, Intensity, MealType } from '@prisma/client';

type AuthContext = {
  Variables: {
    user: AuthUser;
    session: AuthSession;
  };
};

const metricsRoutes = new Hono<AuthContext>();
metricsRoutes.use('*', requireAuth);

// =============================================================================
// Validation Schemas
// =============================================================================

const vitalLogSchema = z.object({
  type: z.enum([
    'HEART_RATE',
    'BLOOD_PRESSURE_SYSTOLIC',
    'BLOOD_PRESSURE_DIASTOLIC',
    'SLEEP_HOURS',
    'STEPS',
    'WEIGHT',
    'BODY_TEMPERATURE',
    'OXYGEN_SATURATION',
  ]),
  value: z.number().positive(),
  unit: z.string().min(1).max(20),
  source: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
  loggedAt: z.string().datetime().optional(),
});

const hydrationLogSchema = z.object({
  amount: z.number().positive().max(5000), // max 5L per entry
  unit: z.enum(['ml', 'oz']).optional(),
  source: z.string().max(50).optional(),
  loggedAt: z.string().datetime().optional(),
});

const activityLogSchema = z.object({
  type: z.enum(['WALK', 'RUN', 'CYCLE', 'SWIM', 'YOGA', 'STRENGTH', 'HIIT', 'SPORTS', 'DANCE', 'OTHER', 'ROWING', 'CLIMB', 'MARTIAL_ARTS', 'WINTER_SPORTS', 'WATER_SPORTS', 'RACKET_SPORTS', 'TEAM_SPORTS', 'MINDFULNESS']),
  name: z.string().min(1).max(100),
  duration: z.number().int().positive().max(1440), // max 24 hours
  calories: z.number().int().positive().optional(),
  distance: z.number().positive().max(1000).optional(), // max 1000 km
  intensity: z.enum(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']).optional(),
  heartRateAvg: z.number().int().positive().max(250).optional(),
  notes: z.string().max(500).optional(),
  source: z.string().max(50).optional(),
  loggedAt: z.string().datetime().optional(),
  activityCatalogId: z.string().min(1).optional(),
  activityCatalogKey: z.string().min(1).optional(),
});

async function resolveActivityCalories(params: {
  userId: string;
  duration: number;
  calories?: number;
  activityCatalogId?: string;
  activityCatalogKey?: string;
}): Promise<{ calories: number | null; activityCatalogId?: string | null; metValue?: number | null }> {
  const { userId, duration, calories, activityCatalogId, activityCatalogKey } = params;
  const activityCatalog = prisma.activityCatalog;

  let catalogItem = null;
  if (activityCatalogId) {
    catalogItem = await activityCatalog.findFirst({ where: { id: activityCatalogId, isActive: true } });
  } else if (activityCatalogKey) {
    catalogItem = await activityCatalog.findFirst({ where: { key: activityCatalogKey, isActive: true } });
  }

  if (catalogItem) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { weight: true },
    });

    const weightKg = profile?.weight ?? 70;
    const derivedCalories = Math.round(catalogItem.metValue * weightKg * (duration / 60));

    return {
      calories: derivedCalories,
      activityCatalogId: catalogItem.id,
      metValue: catalogItem.metValue,
    };
  }

  if (calories) {
    return { calories, activityCatalogId: null, metValue: null };
  }

  return { calories: null, activityCatalogId: null, metValue: null };
}

const mealLogSchema = z.object({
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  name: z.string().min(1).max(200),
  calories: z.number().int().positive().max(10000).optional(),
  protein: z.number().positive().max(500).optional(),
  carbs: z.number().positive().max(1000).optional(),
  fat: z.number().positive().max(500).optional(),
  fiber: z.number().positive().max(200).optional(),
  sugar: z.number().positive().max(500).optional(),
  sodium: z.number().positive().max(20000).optional(),
  servingSize: z.string().max(50).optional(),
  barcode: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  source: z.string().max(50).optional(),
  loggedAt: z.string().datetime().optional(),
  mealCatalogId: z.string().min(1).optional(),
  mealCatalogKey: z.string().min(1).optional(),
});

async function resolveMealCatalogNutrition(params: {
  mealType: MealType;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
  mealCatalogId?: string;
  mealCatalogKey?: string;
}): Promise<{
  mealCatalogId: string | null;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string | null;
}> {
  const mealCatalog = prisma.mealCatalog;

  let catalogItem = null;
  if (params.mealCatalogId) {
    catalogItem = await mealCatalog.findFirst({ where: { id: params.mealCatalogId, isActive: true } });
  } else if (params.mealCatalogKey) {
    catalogItem = await mealCatalog.findFirst({ where: { key: params.mealCatalogKey, isActive: true } });
  }

  if (!catalogItem) {
    return {
      mealCatalogId: null,
      calories: params.calories,
      protein: params.protein,
      carbs: params.carbs,
      fat: params.fat,
      fiber: params.fiber,
      sugar: params.sugar,
      sodium: params.sodium,
      servingSize: params.servingSize,
    };
  }

  return {
    mealCatalogId: catalogItem.id,
    calories: params.calories ?? catalogItem.calories,
    protein: params.protein ?? catalogItem.protein ?? undefined,
    carbs: params.carbs ?? catalogItem.carbs ?? undefined,
    fat: params.fat ?? catalogItem.fat ?? undefined,
    fiber: params.fiber ?? catalogItem.fiber ?? undefined,
    sugar: params.sugar ?? catalogItem.sugar ?? undefined,
    sodium: params.sodium ?? catalogItem.sodium ?? undefined,
    servingSize: params.servingSize ?? catalogItem.servingSize ?? undefined,
  };
}

// =============================================================================
// Vital Logs CRUD
// =============================================================================

// Log a vital
metricsRoutes.post('/vitals', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const parsed = vitalLogSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid vital log', details: parsed.error.flatten() }, 400);
  }

  const { type, value, unit, source, notes, loggedAt } = parsed.data;

  try {
    const log = await prisma.vitalLog.create({
      data: {
        userId: user.id,
        type: type as VitalType,
        value,
        unit,
        source: source || 'manual',
        notes,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
      },
    });

    return c.json({ success: true, log }, 201);
  } catch (error) {
    console.error('Error logging vital:', error);
    return c.json({ error: 'Failed to log vital' }, 500);
  }
});

// Get vitals with optional filters
metricsRoutes.get('/vitals', async (c) => {
  const user = c.get('user');
  const { startDate, endDate, type } = c.req.query();

  try {
    const where: {
      userId: string;
      type?: VitalType;
      loggedAt?: { gte?: Date; lte?: Date };
    } = { userId: user.id };

    if (type) {
      where.type = type as VitalType;
    }

    if (startDate || endDate) {
      where.loggedAt = {};
      if (startDate) where.loggedAt.gte = new Date(startDate);
      if (endDate) where.loggedAt.lte = new Date(endDate);
    }

    const logs = await prisma.vitalLog.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
      take: 100,
    });

    return c.json({ logs });
  } catch (error) {
    console.error('Error fetching vitals:', error);
    return c.json({ error: 'Failed to fetch vitals' }, 500);
  }
});

// Get today's vitals summary
metricsRoutes.get('/vitals/today', async (c) => {
  const user = c.get('user');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  try {
    const logs = await prisma.vitalLog.findMany({
      where: {
        userId: user.id,
        loggedAt: { gte: todayStart },
      },
      orderBy: { loggedAt: 'desc' },
    });

    // Group by type and get latest value for each
    const summary: Record<string, { value: number; unit: string; loggedAt: Date }> = {};
    for (const log of logs) {
      summary[log.type] ??= {
        value: log.value,
        unit: log.unit,
        loggedAt: log.loggedAt,
      };
    }

    return c.json({ summary, logs });
  } catch (error) {
    console.error('Error fetching today vitals:', error);
    return c.json({ error: 'Failed to fetch vitals' }, 500);
  }
});

// Delete a vital log
metricsRoutes.delete('/vitals/:id', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  try {
    // Verify ownership
    const log = await prisma.vitalLog.findFirst({
      where: { id, userId: user.id },
    });

    if (!log) {
      return c.json({ error: 'Vital log not found' }, 404);
    }

    await prisma.vitalLog.delete({ where: { id } });
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting vital:', error);
    return c.json({ error: 'Failed to delete vital' }, 500);
  }
});

// =============================================================================
// Hydration Logs CRUD
// =============================================================================

// Log water intake
metricsRoutes.post('/hydration', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const parsed = hydrationLogSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid hydration log', details: parsed.error.flatten() }, 400);
  }

  const { amount, unit, source, loggedAt } = parsed.data;

  // Convert oz to ml for storage
  const amountMl = unit === 'oz' ? amount * 29.5735 : amount;

  try {
    const log = await prisma.hydrationLog.create({
      data: {
        userId: user.id,
        amount: amountMl,
        unit: 'ml', // Always store in ml
        source: source || 'manual',
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
      },
    });

    return c.json({ success: true, log }, 201);
  } catch (error) {
    console.error('Error logging hydration:', error);
    return c.json({ error: 'Failed to log hydration' }, 500);
  }
});

// Get hydration logs
metricsRoutes.get('/hydration', async (c) => {
  const user = c.get('user');
  const { startDate, endDate } = c.req.query();

  try {
    const where: {
      userId: string;
      loggedAt?: { gte?: Date; lte?: Date };
    } = { userId: user.id };

    if (startDate || endDate) {
      where.loggedAt = {};
      if (startDate) where.loggedAt.gte = new Date(startDate);
      if (endDate) where.loggedAt.lte = new Date(endDate);
    }

    const logs = await prisma.hydrationLog.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
      take: 100,
    });

    return c.json({ logs });
  } catch (error) {
    console.error('Error fetching hydration:', error);
    return c.json({ error: 'Failed to fetch hydration' }, 500);
  }
});

// Get today's hydration summary
metricsRoutes.get('/hydration/today', async (c) => {
  const user = c.get('user');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  try {
    const logs = await prisma.hydrationLog.findMany({
      where: {
        userId: user.id,
        loggedAt: { gte: todayStart },
      },
      orderBy: { loggedAt: 'desc' },
    });

    const totalMl = logs.reduce((sum: number, log: { amount: number }) => sum + log.amount, 0);
    const goalMl = 2500; // Default daily goal (can be personalized later)

    return c.json({
      totalMl,
      goalMl,
      percentage: Math.min(100, Math.round((totalMl / goalMl) * 100)),
      glassesCount: logs.length,
      logs,
    });
  } catch (error) {
    console.error('Error fetching today hydration:', error);
    return c.json({ error: 'Failed to fetch hydration' }, 500);
  }
});

// Quick-log hydration (preset amounts)
metricsRoutes.post('/hydration/quick', async (c) => {
  const user = c.get('user');
  const { preset } = await c.req.json();

  const presets: Record<string, number> = {
    glass: 250, // 1 glass = 250ml
    bottle: 500, // 1 bottle = 500ml
    large: 750, // Large bottle = 750ml
  };

  const amount = presets[preset];
  if (!amount) {
    return c.json({ error: 'Invalid preset. Use: glass, bottle, or large' }, 400);
  }

  try {
    const log = await prisma.hydrationLog.create({
      data: {
        userId: user.id,
        amount,
        unit: 'ml',
        source: 'quick-log',
      },
    });

    // Get updated today's total
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayLogs = await prisma.hydrationLog.findMany({
      where: {
        userId: user.id,
        loggedAt: { gte: todayStart },
      },
    });

    const totalMl = todayLogs.reduce((sum: number, l: { amount: number }) => sum + l.amount, 0);
    const goalMl = 2500;

    return c.json({
      success: true,
      log,
      today: {
        totalMl,
        goalMl,
        percentage: Math.min(100, Math.round((totalMl / goalMl) * 100)),
        glassesCount: todayLogs.length,
      },
    }, 201);
  } catch (error) {
    console.error('Error quick-logging hydration:', error);
    return c.json({ error: 'Failed to log hydration' }, 500);
  }
});

// Delete a hydration log
metricsRoutes.delete('/hydration/:id', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  try {
    const log = await prisma.hydrationLog.findFirst({
      where: { id, userId: user.id },
    });

    if (!log) {
      return c.json({ error: 'Hydration log not found' }, 404);
    }

    await prisma.hydrationLog.delete({ where: { id } });
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting hydration:', error);
    return c.json({ error: 'Failed to delete hydration' }, 500);
  }
});

// =============================================================================
// Activity Logs CRUD
// =============================================================================

// Log an activity
metricsRoutes.post('/activities', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const parsed = activityLogSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid activity log', details: parsed.error.flatten() }, 400);
  }

  const { type, name, duration, calories, distance, intensity, heartRateAvg, notes, source, loggedAt, activityCatalogId, activityCatalogKey } = parsed.data;

  try {
    const resolved = await resolveActivityCalories({
      userId: user.id,
      duration,
      calories,
      activityCatalogId,
      activityCatalogKey,
    });

    const log = await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: type as ActivityType,
        name,
        duration,
        calories: resolved.calories ?? calories,
        distance,
        intensity: (intensity || 'MODERATE') as Intensity,
        heartRateAvg,
        notes,
        source: source || 'manual',
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        activityCatalogId: resolved.activityCatalogId ?? null,
        metValue: resolved.metValue ?? null,
      },
    });

    return c.json({ success: true, log }, 201);
  } catch (error) {
    console.error('Error logging activity:', error);
    return c.json({ error: 'Failed to log activity' }, 500);
  }
});

// Get activities with optional filters
metricsRoutes.get('/activities', async (c) => {
  const user = c.get('user');
  const { startDate, endDate, type, limit } = c.req.query();

  try {
    const where: {
      userId: string;
      type?: ActivityType;
      loggedAt?: { gte?: Date; lte?: Date };
    } = { userId: user.id };

    if (type) {
      where.type = type as ActivityType;
    }

    if (startDate || endDate) {
      where.loggedAt = {};
      if (startDate) where.loggedAt.gte = new Date(startDate);
      if (endDate) where.loggedAt.lte = new Date(endDate);
    }

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
      take: Math.min(Number.parseInt(limit || '50'), 100),
    });

    return c.json({ logs });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return c.json({ error: 'Failed to fetch activities' }, 500);
  }
});

// Get today's activity summary
metricsRoutes.get('/activities/today', async (c) => {
  const user = c.get('user');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  try {
    const logs = await prisma.activityLog.findMany({
      where: {
        userId: user.id,
        loggedAt: { gte: todayStart },
      },
      orderBy: { loggedAt: 'desc' },
    });

    const summary = {
      totalMinutes: logs.reduce((sum: number, l: { duration: number }) => sum + l.duration, 0),
      totalCalories: logs.reduce((sum: number, l: { calories?: number | null }) => sum + (l.calories || 0), 0),
      totalDistance: logs.reduce((sum: number, l: { distance?: number | null }) => sum + (l.distance || 0), 0),
      activitiesCount: logs.length,
      byType: {} as Record<string, { count: number; minutes: number; calories: number }>,
    };

    // Group by type
    for (const log of logs) {
      summary.byType[log.type] ??= { count: 0, minutes: 0, calories: 0 };
      summary.byType[log.type].count++;
      summary.byType[log.type].minutes += log.duration;
      summary.byType[log.type].calories += log.calories || 0;
    }

    return c.json({ summary, logs });
  } catch (error) {
    console.error('Error fetching today activities:', error);
    return c.json({ error: 'Failed to fetch activities' }, 500);
  }
});

// Get weekly activity summary
metricsRoutes.get('/activities/week', async (c) => {
  const user = c.get('user');

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6); // Last 7 days
  weekStart.setHours(0, 0, 0, 0);

  try {
    const logs = await prisma.activityLog.findMany({
      where: {
        userId: user.id,
        loggedAt: { gte: weekStart },
      },
      orderBy: { loggedAt: 'asc' },
    });

    // Group by day
    const dailySummary: Record<string, { minutes: number; calories: number; count: number }> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      dailySummary[date.toISOString().split('T')[0]] = { minutes: 0, calories: 0, count: 0 };
    }

    for (const log of logs) {
      const day = log.loggedAt.toISOString().split('T')[0];
      if (dailySummary[day]) {
        dailySummary[day].minutes += log.duration;
        dailySummary[day].calories += log.calories || 0;
        dailySummary[day].count++;
      }
    }

    return c.json({
      dailySummary,
      totalMinutes: logs.reduce((sum: number, l: { duration: number }) => sum + l.duration, 0),
      totalCalories: logs.reduce((sum: number, l: { calories?: number }) => sum + (l.calories || 0), 0),
      activeDays: Object.values(dailySummary).filter((d) => d.count > 0).length,
    });
  } catch (error) {
    console.error('Error fetching weekly activities:', error);
    return c.json({ error: 'Failed to fetch activities' }, 500);
  }
});

// Delete an activity log
metricsRoutes.delete('/activities/:id', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  try {
    const log = await prisma.activityLog.findFirst({
      where: { id, userId: user.id },
    });

    if (!log) {
      return c.json({ error: 'Activity log not found' }, 404);
    }

    await prisma.activityLog.delete({ where: { id } });
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return c.json({ error: 'Failed to delete activity' }, 500);
  }
});

// =============================================================================
// Meal Logs CRUD
// =============================================================================

// Log a meal
metricsRoutes.post('/meals', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const parsed = mealLogSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid meal log', details: parsed.error.flatten() }, 400);
  }

  const { mealType, name, calories, protein, carbs, fat, fiber, sugar, sodium, servingSize, barcode, notes, imageUrl, source, loggedAt, mealCatalogId, mealCatalogKey } = parsed.data;

  try {
    const resolved = await resolveMealCatalogNutrition({
      mealType: mealType as MealType,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      servingSize,
      mealCatalogId,
      mealCatalogKey,
    });

    const log = await prisma.mealLog.create({
      data: {
        userId: user.id,
        mealType: mealType as MealType,
        name,
        calories: resolved.calories,
        protein: resolved.protein,
        carbs: resolved.carbs,
        fat: resolved.fat,
        fiber: resolved.fiber,
        sugar: resolved.sugar,
        sodium: resolved.sodium,
        servingSize: resolved.servingSize ?? undefined,
        barcode,
        notes,
        imageUrl,
        source: source || 'manual',
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        mealCatalogId: resolved.mealCatalogId,
      },
    });

    return c.json({ success: true, log }, 201);
  } catch (error) {
    console.error('Error logging meal:', error);
    return c.json({ error: 'Failed to log meal' }, 500);
  }
});

// Get meals with optional filters
metricsRoutes.get('/meals', async (c) => {
  const user = c.get('user');
  const { startDate, endDate, mealType, limit } = c.req.query();

  try {
    const where: {
      userId: string;
      mealType?: MealType;
      loggedAt?: { gte?: Date; lte?: Date };
    } = { userId: user.id };

    if (mealType) {
      where.mealType = mealType as MealType;
    }

    if (startDate || endDate) {
      where.loggedAt = {};
      if (startDate) where.loggedAt.gte = new Date(startDate);
      if (endDate) where.loggedAt.lte = new Date(endDate);
    }

    const logs = await prisma.mealLog.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
      take: Math.min(Number.parseInt(limit || '50'), 100),
    });

    return c.json({ logs });
  } catch (error) {
    console.error('Error fetching meals:', error);
    return c.json({ error: 'Failed to fetch meals' }, 500);
  }
});

// Get today's nutrition summary
metricsRoutes.get('/meals/today', async (c) => {
  const user = c.get('user');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  try {
    const logs = await prisma.mealLog.findMany({
      where: {
        userId: user.id,
        loggedAt: { gte: todayStart },
      },
      orderBy: { loggedAt: 'desc' },
    });

    const summary = {
      totalCalories: logs.reduce((sum: number, l: { calories?: number }) => sum + (l.calories || 0), 0),
      totalProtein: logs.reduce((sum: number, l: { protein?: number }) => sum + (l.protein || 0), 0),
      totalCarbs: logs.reduce((sum: number, l: { carbs?: number }) => sum + (l.carbs || 0), 0),
      totalFat: logs.reduce((sum: number, l: { fat?: number }) => sum + (l.fat || 0), 0),
      totalFiber: logs.reduce((sum: number, l: { fiber?: number }) => sum + (l.fiber || 0), 0),
      totalSugar: logs.reduce((sum: number, l: { sugar?: number }) => sum + (l.sugar || 0), 0),
      mealsCount: logs.length,
      byMealType: {} as Record<string, { count: number; calories: number }>,
    };

    // Group by meal type
    for (const log of logs) {
      summary.byMealType[log.mealType] ??= { count: 0, calories: 0 };
      summary.byMealType[log.mealType].count++;
      summary.byMealType[log.mealType].calories += log.calories || 0;
    }

    return c.json({ summary, logs });
  } catch (error) {
    console.error('Error fetching today meals:', error);
    return c.json({ error: 'Failed to fetch meals' }, 500);
  }
});

// Get weekly nutrition summary
metricsRoutes.get('/meals/week', async (c) => {
  const user = c.get('user');

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  try {
    const logs = await prisma.mealLog.findMany({
      where: {
        userId: user.id,
        loggedAt: { gte: weekStart },
      },
      orderBy: { loggedAt: 'asc' },
    });

    // Group by day
    const dailySummary: Record<string, { calories: number; protein: number; carbs: number; fat: number; count: number }> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      dailySummary[date.toISOString().split('T')[0]] = { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
    }

    for (const log of logs) {
      const day = log.loggedAt.toISOString().split('T')[0];
      if (dailySummary[day]) {
        dailySummary[day].calories += log.calories || 0;
        dailySummary[day].protein += log.protein || 0;
        dailySummary[day].carbs += log.carbs || 0;
        dailySummary[day].fat += log.fat || 0;
        dailySummary[day].count++;
      }
    }

    return c.json({
      dailySummary,
      averageCalories: Math.round(logs.reduce((sum: number, l: { calories?: number }) => sum + (l.calories || 0), 0) / 7),
      totalMeals: logs.length,
    });
  } catch (error) {
    console.error('Error fetching weekly meals:', error);
    return c.json({ error: 'Failed to fetch meals' }, 500);
  }
});

// Delete a meal log
metricsRoutes.delete('/meals/:id', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  try {
    const log = await prisma.mealLog.findFirst({
      where: { id, userId: user.id },
    });

    if (!log) {
      return c.json({ error: 'Meal log not found' }, 404);
    }

    await prisma.mealLog.delete({ where: { id } });
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting meal:', error);
    return c.json({ error: 'Failed to delete meal' }, 500);
  }
});

// =============================================================================
// Goals CRUD
// =============================================================================

const goalSchema = z.object({
  type: z.enum(['STEPS', 'HYDRATION', 'CALORIES_IN', 'CALORIES_OUT', 'SLEEP', 'ACTIVITY_MINUTES', 'WEIGHT', 'CUSTOM']),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  targetValue: z.number().positive(),
  targetUnit: z.string().min(1).max(30),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const goalUpdateSchema = goalSchema.partial();

const goalProgressSchema = z.object({
  value: z.number().nonnegative(),
  notes: z.string().max(300).optional(),
  date: z.string().datetime().optional(),
});

const WORKOUT_DIFFICULTY_BY_FITNESS_LEVEL: Record<string, WorkoutDifficulty> = {
  sedentary: 'BEGINNER',
  light: 'BEGINNER',
  moderate: 'INTERMEDIATE',
  intermediate: 'INTERMEDIATE',
  active: 'ADVANCED',
  very_active: 'ADVANCED',
};

type ExerciseCategory = 'STRENGTH' | 'CARDIO' | 'MOBILITY' | 'FLEXIBILITY' | 'RECOVERY';
type WorkoutDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

const EXERCISE_CATEGORY_FOR_GOAL: Record<string, ExerciseCategory> = {
  strength: 'STRENGTH',
  cardio: 'CARDIO',
  flexibility: 'FLEXIBILITY',
  mobility: 'MOBILITY',
};

const workoutPlanCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
});

const workoutPlanExerciseLogSchema = z.object({
  workoutPlanExerciseId: z.string().trim().min(1),
  repsCompleted: z.number().int().positive().max(200),
});

const healthSyncConnectSchema = z.object({
  provider: z.enum(['GOOGLE_FIT', 'SAMSUNG_HEALTH']),
});

const healthSyncAutoSchema = z.object({
  autoSync: z.boolean(),
});

type ExerciseDefaults = {
  id: string;
  defaultSets: number;
  defaultRepsMin: number;
  defaultRepsMax: number;
  defaultRestSeconds: number;
};

function acceptedDifficulties(difficulty: WorkoutDifficulty): WorkoutDifficulty[] {
  return difficulty === 'ADVANCED' ? ['INTERMEDIATE', 'ADVANCED'] : [difficulty];
}

function buildWorkoutSuggestionsFromProfile(profile: {
  fitnessLevel: string | null;
  goals: string[];
} | null): {
  categories: ExerciseCategory[];
  difficulty: WorkoutDifficulty;
} {
  const difficulty = profile?.fitnessLevel
    ? (WORKOUT_DIFFICULTY_BY_FITNESS_LEVEL[profile.fitnessLevel] ?? 'BEGINNER')
    : 'BEGINNER';

  const categories = new Set<ExerciseCategory>();
  for (const goal of profile?.goals ?? []) {
    const maybeCategory = EXERCISE_CATEGORY_FOR_GOAL[goal];
    if (maybeCategory) {
      categories.add(maybeCategory);
    }
  }

  if (categories.size === 0) {
    categories.add('CARDIO');
    categories.add('STRENGTH');
  }

  return {
    categories: [...categories],
    difficulty,
  };
}

// List all active goals for the user
metricsRoutes.get('/goals', async (c) => {
  const user = c.get('user');
  const { type, active } = c.req.query();

  try {
    const where: Record<string, unknown> = { userId: user.id };
    if (type) where['type'] = type;
    if (active !== undefined) where['isActive'] = active === 'true';

    const goals = await prisma.goal.findMany({
      where,
      include: {
        progress: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return c.json({ goals });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return c.json({ error: 'Failed to fetch goals' }, 500);
  }
});

// Create a new goal
metricsRoutes.post('/goals', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const parsed = goalSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid goal data', details: parsed.error.flatten() }, 400);
  }

  const { type, title, description, targetValue, targetUnit, frequency, startDate, endDate } = parsed.data;

  try {
    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        type,
        title,
        description,
        targetValue,
        targetUnit,
        frequency: frequency ?? 'DAILY',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
        isActive: true,
      },
    });

    return c.json({ success: true, goal });
  } catch (error) {
    console.error('Error creating goal:', error);
    return c.json({ error: 'Failed to create goal' }, 500);
  }
});

// Get a single goal with progress
metricsRoutes.get('/goals/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  try {
    const goal = await prisma.goal.findFirst({
      where: { id, userId: user.id },
      include: {
        progress: {
          orderBy: { date: 'desc' },
          take: 90,
        },
      },
    });

    if (!goal) {
      return c.json({ error: 'Goal not found' }, 404);
    }

    // Compute progress percentage based on most recent entry
    const latestProgress = goal.progress[0];
    const currentValue = latestProgress?.value ?? 0;
    const progressPercentage = Math.min(
      Math.round((currentValue / goal.targetValue) * 100),
      100,
    );
    const isCompleted = progressPercentage >= 100;

    return c.json({
      goal: {
        ...goal,
        currentValue,
        progressPercentage,
        isCompleted,
      },
    });
  } catch (error) {
    console.error("Error fetching goal:", error);
    return c.json({ error: "Failed to fetch goal" }, 500);
  }
});

// Update a goal
metricsRoutes.patch("/goals/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = goalUpdateSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid update data", details: parsed.error.flatten() }, 400);
  try {
    const existing = await prisma.goal.findFirst({ where: { id, userId: user.id } });
    if (!existing) return c.json({ error: "Goal not found" }, 404);
    const goal = await prisma.goal.update({
      where: { id },
      data: {
        ...parsed.data,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
        endDate:   parsed.data.endDate   ? new Date(parsed.data.endDate)   : undefined,
      },
    });
    return c.json({ success: true, goal });
  } catch (error) {
    console.error("Error updating goal:", error);
    return c.json({ error: "Failed to update goal" }, 500);
  }
});

// Soft-delete a goal
metricsRoutes.delete("/goals/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  try {
    const existing = await prisma.goal.findFirst({ where: { id, userId: user.id } });
    if (!existing) return c.json({ error: "Goal not found" }, 404);
    await prisma.goal.update({ where: { id }, data: { isActive: false } });
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return c.json({ error: "Failed to delete goal" }, 500);
  }
});

// Log progress for a goal
metricsRoutes.post("/goals/:id/progress", async (c) => {
  const user = c.get("user");
  const goalId = c.req.param("id");
  const body = await c.req.json();
  const parsed = goalProgressSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid progress data", details: parsed.error.flatten() }, 400);
  try {
    const goal = await prisma.goal.findFirst({ where: { id: goalId, userId: user.id } });
    if (!goal) return c.json({ error: "Goal not found" }, 404);
    const progressDate = parsed.data.date ? new Date(parsed.data.date) : new Date();
    const progress = await prisma.goalProgress.upsert({
      where: { goalId_date: { goalId, date: progressDate } },
      update: { value: parsed.data.value, notes: parsed.data.notes },
      create: { goalId, date: progressDate, value: parsed.data.value, notes: parsed.data.notes },
    });
    const isCompleted = parsed.data.value >= goal.targetValue;
    return c.json({ success: true, progress, isCompleted });
  } catch (error) {
    console.error("Error logging goal progress:", error);
    return c.json({ error: "Failed to log progress" }, 500);
  }
});

// Get progress history for a goal
metricsRoutes.get("/goals/:id/progress", async (c) => {
  const user = c.get("user");
  const goalId = c.req.param("id");
  const { limit } = c.req.query();
  try {
    const goal = await prisma.goal.findFirst({ where: { id: goalId, userId: user.id } });
    if (!goal) return c.json({ error: "Goal not found" }, 404);
    const progress = await prisma.goalProgress.findMany({
      where: { goalId },
      orderBy: { date: "desc" },
      take: limit ? Number.parseInt(limit, 10) : 30,
    });
    return c.json({ progress });
  } catch (error) {
    console.error("Error fetching goal progress:", error);
    return c.json({ error: "Failed to fetch progress" }, 500);
  }
});

// =============================================================================
// Workout plans and exercise flow
// =============================================================================

metricsRoutes.get('/workouts/suggestions', async (c) => {
  const user = c.get('user');

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { fitnessLevel: true, goals: true },
    });

    const { categories, difficulty } = buildWorkoutSuggestionsFromProfile(profile);
    const exercises = await prisma.exerciseCatalog.findMany({
      where: {
        isActive: true,
        category: { in: categories },
        difficulty: { in: acceptedDifficulties(difficulty) },
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      take: 18,
    });

    return c.json({
      suggestions: {
        categories,
        difficulty,
        exercises,
      },
    });
  } catch (error) {
    console.error('Error building workout suggestions:', error);
    return c.json({ error: 'Failed to load workout suggestions' }, 500);
  }
});

metricsRoutes.get('/workout-plans', async (c) => {
  const user = c.get('user');

  try {
    const plans = await prisma.workoutPlan.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return c.json({ plans });
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return c.json({ error: 'Failed to fetch workout plans' }, 500);
  }
});

metricsRoutes.post('/workout-plans', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = workoutPlanCreateSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Invalid workout plan data', details: parsed.error.flatten() }, 400);
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { fitnessLevel: true, goals: true },
    });
    const { categories, difficulty } = buildWorkoutSuggestionsFromProfile(profile);

    const exercises = await prisma.exerciseCatalog.findMany({
      where: {
        isActive: true,
        category: { in: categories },
        difficulty: { in: acceptedDifficulties(difficulty) },
      },
      select: {
        id: true,
        defaultSets: true,
        defaultRepsMin: true,
        defaultRepsMax: true,
        defaultRestSeconds: true,
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      take: 6,
    });

    const defaultExercises = exercises.map((exercise: ExerciseDefaults, index: number) => ({
      exerciseCatalogId: exercise.id,
      // 1-based ordering keeps UI display aligned with "exercise #1, #2, ..."
      orderIndex: index + 1,
      sets: exercise.defaultSets,
      repsMin: exercise.defaultRepsMin,
      repsMax: exercise.defaultRepsMax,
      restSeconds: exercise.defaultRestSeconds,
    }));

    const plan = await prisma.workoutPlan.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        description: parsed.data.description,
        difficulty,
        exercises: { create: defaultExercises },
      },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return c.json({ success: true, plan }, 201);
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return c.json({ error: 'Failed to create workout plan' }, 500);
  }
});

metricsRoutes.post('/workout-logs', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = workoutPlanExerciseLogSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Invalid workout log data', details: parsed.error.flatten() }, 400);
  }

  try {
    const exerciseEntry = await prisma.workoutPlanExercise.findUnique({
      where: { id: parsed.data.workoutPlanExerciseId },
      include: {
        exercise: true,
        workoutPlan: {
          select: {
            userId: true,
            isActive: true,
          },
        },
      },
    });

    if (!exerciseEntry || exerciseEntry.workoutPlan.userId !== user.id || !exerciseEntry.workoutPlan.isActive) {
      return c.json({ error: 'Workout exercise not found' }, 404);
    }

    return c.json({
      success: true,
      log: {
        workoutPlanExerciseId: exerciseEntry.id,
        repsCompleted: parsed.data.repsCompleted,
        targetReps: { min: exerciseEntry.repsMin, max: exerciseEntry.repsMax },
        exerciseName: exerciseEntry.exercise.name,
      },
      timer: {
        restSeconds: exerciseEntry.restSeconds,
      },
    }, 201);
  } catch (error) {
    console.error('Error logging workout set:', error);
    return c.json({ error: 'Failed to log workout set' }, 500);
  }
});

// =============================================================================
// Health sync (Google Fit / Samsung Health placeholders with safe contracts)
// =============================================================================

metricsRoutes.get('/sync/connections', async (c) => {
  const user = c.get('user');

  try {
    const connections = await prisma.healthSyncConnection.findMany({
      where: { userId: user.id },
      orderBy: { provider: 'asc' },
    });
    return c.json({ connections });
  } catch (error) {
    console.error('Error fetching health sync connections:', error);
    return c.json({ error: 'Failed to fetch health sync connections' }, 500);
  }
});

metricsRoutes.post('/sync/connect', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = healthSyncConnectSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Invalid sync provider', details: parsed.error.flatten() }, 400);
  }

  try {
    const connection = await prisma.healthSyncConnection.upsert({
      where: {
        userId_provider: {
          userId: user.id,
          provider: parsed.data.provider,
        },
      },
      update: {
        connected: true,
      },
      create: {
        userId: user.id,
        provider: parsed.data.provider,
        connected: true,
        autoSync: false,
      },
    });

    return c.json({
      success: true,
      connection,
      status: 'connected_placeholder',
      message: 'Provider connected in placeholder mode. Continuous background sync will be enabled in a future release.',
    });
  } catch (error) {
    console.error('Error connecting provider:', error);
    return c.json({ error: 'Failed to connect provider' }, 500);
  }
});

metricsRoutes.patch('/sync/:provider/auto', async (c) => {
  const user = c.get('user');
  const provider = c.req.param('provider');
  const body = await c.req.json();

  const providerParsed = healthSyncConnectSchema.safeParse({ provider });
  if (!providerParsed.success) {
    return c.json({ error: 'Invalid sync provider', details: providerParsed.error.flatten() }, 400);
  }

  const bodyParsed = healthSyncAutoSchema.safeParse(body);
  if (!bodyParsed.success) {
    return c.json({ error: 'Invalid auto sync payload', details: bodyParsed.error.flatten() }, 400);
  }

  try {
    const updated = await prisma.healthSyncConnection.update({
      where: {
        userId_provider: {
          userId: user.id,
          provider: providerParsed.data.provider,
        },
      },
      data: {
        autoSync: bodyParsed.data.autoSync,
      },
    });

    return c.json({
      success: true,
      connection: updated,
      message: bodyParsed.data.autoSync
        ? 'Auto-sync enabled for placeholder mode.'
        : 'Auto-sync disabled.',
    });
  } catch (error) {
    console.error('Error updating auto sync setting:', error);
    return c.json({ error: 'Failed to update auto sync setting' }, 500);
  }
});

metricsRoutes.post('/sync/:provider/pull', async (c) => {
  const user = c.get('user');
  const provider = c.req.param('provider');

  const providerParsed = healthSyncConnectSchema.safeParse({ provider });
  if (!providerParsed.success) {
    return c.json({ error: 'Invalid sync provider', details: providerParsed.error.flatten() }, 400);
  }

  try {
    const updated = await prisma.healthSyncConnection.update({
      where: {
        userId_provider: {
          userId: user.id,
          provider: providerParsed.data.provider,
        },
      },
      data: {
        lastSyncAt: new Date(),
      },
    });

    return c.json({
      success: true,
      provider: providerParsed.data.provider,
      pulled: {
        vitals: 0,
        activities: 0,
        meals: 0,
        hydration: 0,
      },
      mode: 'placeholder',
      lastSyncAt: updated.lastSyncAt,
    });
  } catch (error) {
    console.error('Error pulling provider sync:', error);
    return c.json({ error: 'Failed to run provider pull sync' }, 500);
  }
});

export { metricsRoutes };
