import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';
import type { Session as AuthSession, User as AuthUser } from 'better-auth';
import { z } from 'zod';
import type { VitalType } from '@prisma/client';

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
      if (!summary[log.type]) {
        summary[log.type] = {
          value: log.value,
          unit: log.unit,
          loggedAt: log.loggedAt,
        };
      }
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

export { metricsRoutes };
