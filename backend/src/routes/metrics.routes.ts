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
  type: z.enum(['WALK', 'RUN', 'CYCLE', 'SWIM', 'YOGA', 'STRENGTH', 'HIIT', 'SPORTS', 'DANCE', 'OTHER']),
  name: z.string().min(1).max(100),
  duration: z.number().int().positive().max(1440), // max 24 hours
  calories: z.number().int().positive().optional(),
  distance: z.number().positive().max(1000).optional(), // max 1000 km
  intensity: z.enum(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']).optional(),
  heartRateAvg: z.number().int().positive().max(250).optional(),
  notes: z.string().max(500).optional(),
  source: z.string().max(50).optional(),
  loggedAt: z.string().datetime().optional(),
});

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
});

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

    const totalMl = logs.reduce((sum, log) => sum + log.amount, 0);
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

    const totalMl = todayLogs.reduce((sum, l) => sum + l.amount, 0);
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

  const { type, name, duration, calories, distance, intensity, heartRateAvg, notes, source, loggedAt } = parsed.data;

  try {
    const log = await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: type as ActivityType,
        name,
        duration,
        calories,
        distance,
        intensity: (intensity || 'MODERATE') as Intensity,
        heartRateAvg,
        notes,
        source: source || 'manual',
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
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
      totalMinutes: logs.reduce((sum, l) => sum + l.duration, 0),
      totalCalories: logs.reduce((sum, l) => sum + (l.calories || 0), 0),
      totalDistance: logs.reduce((sum, l) => sum + (l.distance || 0), 0),
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
      totalMinutes: logs.reduce((sum, l) => sum + l.duration, 0),
      totalCalories: logs.reduce((sum, l) => sum + (l.calories || 0), 0),
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

  const { mealType, name, calories, protein, carbs, fat, fiber, sugar, sodium, servingSize, barcode, notes, imageUrl, source, loggedAt } = parsed.data;

  try {
    const log = await prisma.mealLog.create({
      data: {
        userId: user.id,
        mealType: mealType as MealType,
        name,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        sodium,
        servingSize,
        barcode,
        notes,
        imageUrl,
        source: source || 'manual',
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
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
      totalCalories: logs.reduce((sum, l) => sum + (l.calories || 0), 0),
      totalProtein: logs.reduce((sum, l) => sum + (l.protein || 0), 0),
      totalCarbs: logs.reduce((sum, l) => sum + (l.carbs || 0), 0),
      totalFat: logs.reduce((sum, l) => sum + (l.fat || 0), 0),
      totalFiber: logs.reduce((sum, l) => sum + (l.fiber || 0), 0),
      totalSugar: logs.reduce((sum, l) => sum + (l.sugar || 0), 0),
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
      averageCalories: Math.round(logs.reduce((sum, l) => sum + (l.calories || 0), 0) / 7),
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

export { metricsRoutes };
