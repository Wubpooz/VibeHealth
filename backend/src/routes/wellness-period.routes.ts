import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware';
import type { Session as AuthSession, User as AuthUser } from 'better-auth';
import { z } from 'zod';
import { getCycleInsights } from '../services/period';

// =============================================================================
// Types
// =============================================================================

type AuthContext = {
  Variables: {
    user: AuthUser;
    session: AuthSession;
  };
};

// =============================================================================
// Validation Schemas
// =============================================================================

const flowIntensityEnum = ['LIGHT', 'MEDIUM', 'HEAVY'] as const;

const symptomsEnum = [
  'CRAMPS',
  'BLOATING',
  'HEADACHE',
  'FATIGUE',
  'MOOD_SWINGS',
  'BACK_PAIN',
  'BREAST_TENDERNESS',
  'NAUSEA',
  'ACNE',
  'APPETITE_CHANGES',
] as const;

const periodLogCreateSchema = z
  .object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD format'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD format')
      .optional()
      .nullable(),
    flowIntensity: z.enum(flowIntensityEnum).default('MEDIUM'),
    symptoms: z.array(z.enum(symptomsEnum)).max(20).optional(),
    notes: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    // Validate that end date is after start date if provided
    if (data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'End date must be after start date',
        });
      }
    }
  });

const periodLogUpdateSchema = z.object({
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD format')
    .optional()
    .nullable(),
  flowIntensity: z.enum(flowIntensityEnum).optional(),
  symptoms: z.array(z.enum(symptomsEnum)).max(20).optional(),
  notes: z.string().max(500).optional(),
});

const contraceptivePillReminderSchema = z.object({
  enabled: z.boolean().default(true),
  timeOfDay: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
  snoozeDuration: z.number().int().min(1).max(120).default(5), // minutes
  dayOfWeekReminders: z.array(z.number().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday
  notes: z.string().max(200).optional(),
});

// Schema for list validation (kept for reference, unused in query params)
// const listPeriodsSchema = z.object({
//   limit: z.coerce.number().int().min(1).max(24).default(12),
//   offset: z.coerce.number().int().min(0).default(0),
// });

// =============================================================================
// Response Types
// =============================================================================

interface PeriodLogResponse {
  id: string;
  startDate: string; // ISO date string
  endDate: string | null;
  flowIntensity: string;
  symptoms: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CycleInsightsResponse {
  lastPeriodStart: string | null;
  averageCycleLength: number | null;
  averagePeriodDuration: number | null;
  predictedNextPeriodStart: string | null;
  fertilityWindow: {
    start: string;
    end: string;
  } | null;
  dataPoints: number;
}

// =============================================================================
// Notification Helpers (Stubs for future integration)
// =============================================================================

// TODO: Implement actual notification scheduling functions:
// - notifyScheduled(userId: string, title: string)
// - notifyPeriodUpcoming(userId: string, daysUntilPeriod: number)
// - notifyPillReminder(userId: string, timeOfDay: string)
// These will integrate with service worker or notification service

// =============================================================================
// Route Definitions
// =============================================================================

const periodRoutes = new Hono<AuthContext>();
periodRoutes.use('*', requireAuth);

// =============================================================================
// POST /api/v1/wellness/period/log
// Create or update a period log entry
// =============================================================================

periodRoutes.post('/log', async (c) => {
  const user = c.get('user');

  try {
    const body = await c.req.json();
    const validated = periodLogCreateSchema.parse(body);

    // Check if period already exists for this start date
    const existingPeriod = await prisma.periodLog.findUnique({
      where: {
        userId_startDate: {
          userId: user.id,
          startDate: new Date(validated.startDate),
        },
      },
    });

    let periodLog;

    if (existingPeriod) {
      // Update existing period
      periodLog = await prisma.periodLog.update({
        where: { id: existingPeriod.id },
        data: {
          endDate: validated.endDate ? new Date(validated.endDate) : null,
          flowIntensity: validated.flowIntensity,
          symptoms: validated.symptoms || [],
          notes: validated.notes || null,
        },
      });
    } else {
      // Create new period
      periodLog = await prisma.periodLog.create({
        data: {
          userId: user.id,
          startDate: new Date(validated.startDate),
          endDate: validated.endDate ? new Date(validated.endDate) : null,
          flowIntensity: validated.flowIntensity,
          symptoms: validated.symptoms || [],
          notes: validated.notes || null,
        },
      });

      // Award carrots for tracking
      // TODO: Integrate with RewardsService
      console.log(`[Rewards] Award 5 carrots to user ${user.id} for period tracking`);
    }

    // Trigger notifications if needed
    // TODO: Check if period is starting or ending, send appropriate reminders

    const response: PeriodLogResponse = {
      id: periodLog.id,
      startDate: periodLog.startDate.toISOString().split('T')[0],
      endDate: periodLog.endDate ? periodLog.endDate.toISOString().split('T')[0] : null,
      flowIntensity: periodLog.flowIntensity,
      symptoms: periodLog.symptoms,
      notes: periodLog.notes,
      createdAt: periodLog.createdAt.toISOString(),
      updatedAt: periodLog.updatedAt.toISOString(),
    };

    return c.json(
      {
        success: true,
        data: response,
        message: existingPeriod ? 'Period log updated' : 'Period log created',
      },
      { status: existingPeriod ? 200 : 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('[Period] POST /log error:', error);
    return c.json({ success: false, error: 'Failed to create or update period log' }, { status: 500 });
  }
});

// =============================================================================
// GET /api/v1/wellness/period/logs
// List recent period logs
// =============================================================================

periodRoutes.get('/logs', async (c) => {
  const user = c.get('user');

  try {
    const limitParam = c.req.query('limit') || '12';
    const offsetParam = c.req.query('offset') || '0';
    const limit = Math.min(parseInt(limitParam), 24); // Max 24 months
    const offset = parseInt(offsetParam);

    const [logs, total] = await Promise.all([
      prisma.periodLog.findMany({
        where: { userId: user.id },
        orderBy: { startDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.periodLog.count({
        where: { userId: user.id },
      }),
    ]);

    type PeriodLogRecord = typeof logs[number];
    const response: PeriodLogResponse[] = logs.map((log: PeriodLogRecord) => ({
      id: log.id,
      startDate: log.startDate.toISOString().split('T')[0],
      endDate: log.endDate ? log.endDate.toISOString().split('T')[0] : null,
      flowIntensity: log.flowIntensity,
      symptoms: log.symptoms,
      notes: log.notes,
      createdAt: log.createdAt.toISOString(),
      updatedAt: log.updatedAt.toISOString(),
    }));

    return c.json({
      success: true,
      data: response,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[Period] GET /logs error:', error);
    return c.json({ success: false, error: 'Failed to fetch period logs' }, { status: 500 });
  }
});

// =============================================================================
// GET /api/v1/wellness/period/:id
// Get a specific period log
// =============================================================================

periodRoutes.get('/:id', async (c) => {
  const user = c.get('user');
  const periodId = c.req.param('id');

  try {
    const log = await prisma.periodLog.findFirst({
      where: {
        id: periodId,
        userId: user.id,
      },
    });

    if (!log) {
      return c.json({ success: false, error: 'Period log not found' }, { status: 404 });
    }

    const response: PeriodLogResponse = {
      id: log.id,
      startDate: log.startDate.toISOString().split('T')[0],
      endDate: log.endDate ? log.endDate.toISOString().split('T')[0] : null,
      flowIntensity: log.flowIntensity,
      symptoms: log.symptoms,
      notes: log.notes,
      createdAt: log.createdAt.toISOString(),
      updatedAt: log.updatedAt.toISOString(),
    };

    return c.json({ success: true, data: response });
  } catch (error) {
    console.error('[Period] GET /:id error:', error);
    return c.json({ success: false, error: 'Failed to fetch period log' }, { status: 500 });
  }
});

// =============================================================================
// PATCH /api/v1/wellness/period/:id
// Update a specific period log
// =============================================================================

periodRoutes.patch('/:id', async (c) => {
  const user = c.get('user');
  const periodId = c.req.param('id');

  try {
    // Verify ownership
    const existing = await prisma.periodLog.findFirst({
      where: {
        id: periodId,
        userId: user.id,
      },
    });

    if (!existing) {
      return c.json({ success: false, error: 'Period log not found' }, { status: 404 });
    }

    const body = await c.req.json();
    const validated = periodLogUpdateSchema.parse(body);

    const updated = await prisma.periodLog.update({
      where: { id: periodId },
      data: {
        endDate: validated.endDate !== undefined ? (validated.endDate ? new Date(validated.endDate) : null) : undefined,
        flowIntensity: validated.flowIntensity,
        symptoms: validated.symptoms !== undefined ? validated.symptoms : undefined,
        notes: validated.notes !== undefined ? (validated.notes || null) : undefined,
      },
    });

    const response: PeriodLogResponse = {
      id: updated.id,
      startDate: updated.startDate.toISOString().split('T')[0],
      endDate: updated.endDate ? updated.endDate.toISOString().split('T')[0] : null,
      flowIntensity: updated.flowIntensity,
      symptoms: updated.symptoms,
      notes: updated.notes,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };

    return c.json({
      success: true,
      data: response,
      message: 'Period log updated',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('[Period] PATCH /:id error:', error);
    return c.json({ success: false, error: 'Failed to update period log' }, { status: 500 });
  }
});

// =============================================================================
// DELETE /api/v1/wellness/period/:id
// Delete a period log
// =============================================================================

periodRoutes.delete('/:id', async (c) => {
  const user = c.get('user');
  const periodId = c.req.param('id');

  try {
    // Verify ownership
    const existing = await prisma.periodLog.findFirst({
      where: {
        id: periodId,
        userId: user.id,
      },
    });

    if (!existing) {
      return c.json({ success: false, error: 'Period log not found' }, { status: 404 });
    }

    await prisma.periodLog.delete({
      where: { id: periodId },
    });

    return c.json({
      success: true,
      message: 'Period log deleted',
    });
  } catch (error) {
    console.error('[Period] DELETE /:id error:', error);
    return c.json({ success: false, error: 'Failed to delete period log' }, { status: 500 });
  }
});

// =============================================================================
// GET /api/v1/wellness/period/prediction/next
// Get next period prediction and fertile window
// =============================================================================

periodRoutes.get('/prediction/next', async (c) => {
  const user = c.get('user');

  try {
    const logs = await prisma.periodLog.findMany({
      where: { userId: user.id },
      orderBy: { startDate: 'desc' },
      take: 12, // Use last 12 periods for prediction
    });

    if (logs.length === 0) {
      return c.json(
        {
          success: true,
          data: {
            lastPeriodStart: null,
            averageCycleLength: null,
            averagePeriodDuration: null,
            predictedNextPeriodStart: null,
            fertilityWindow: null,
            dataPoints: 0,
          },
        },
        { status: 200 }
      );
    }

    // Convert to service format and predict
    type PeriodLogRecord = typeof logs[number];
    const logsForPrediction = logs.map((log: PeriodLogRecord) => ({
      startDate: log.startDate,
      endDate: log.endDate,
    }));

    const insights = getCycleInsights(logsForPrediction);

    const response: CycleInsightsResponse = {
      lastPeriodStart: insights.lastPeriodStart
        ? insights.lastPeriodStart.toISOString().split('T')[0]
        : null,
      averageCycleLength: insights.averageCycleLength ?? null,
      averagePeriodDuration: insights.averagePeriodDuration ?? null,
      predictedNextPeriodStart: insights.predictedNextPeriodStart
        ? insights.predictedNextPeriodStart.toISOString().split('T')[0]
        : null,
      fertilityWindow: insights.fertilityWindow
        ? {
            start: insights.fertilityWindow.start.toISOString().split('T')[0],
            end: insights.fertilityWindow.end.toISOString().split('T')[0],
          }
        : null,
      dataPoints: insights.dataPoints ?? 0,
    };

    return c.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('[Period] GET /prediction/next error:', error);
    return c.json(
      { success: false, error: 'Failed to generate cycle prediction' },
      { status: 500 }
    );
  }
});

// =============================================================================
// POST /api/v1/wellness/period/reminder/pill
// Create or update contraceptive pill reminder settings
// =============================================================================

periodRoutes.post('/reminder/pill', async (c) => {
  const user = c.get('user');

  try {
    const body = await c.req.json();
    const validated = contraceptivePillReminderSchema.parse(body);

    // For now, store in a simple JSON field or create a new model
    // TODO: Create ContraceptivePillReminder model in Prisma
    // For this example, we'll store in profile as a JSON blob

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return c.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Update profile with pill reminder settings
    const existingPreferences = (profile.notificationPreferences as Prisma.JsonObject | null) ?? {};
    const updatedPreferences: Prisma.JsonObject = {
      ...existingPreferences,
      contraceptivePillReminder: validated,
    };

    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        notificationPreferences: updatedPreferences,
      },
    });

    // TODO: Schedule recurring notifications based on settings
    // if (validated.enabled) {
    //   await scheduleContraceptivePillReminder(user.id, validated.timeOfDay);
    // }

    return c.json(
      {
        success: true,
        data: validated,
        message: 'Contraceptive pill reminder updated',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('[Period] POST /reminder/pill error:', error);
    return c.json(
      { success: false, error: 'Failed to save pill reminder settings' },
      { status: 500 }
    );
  }
});

// =============================================================================
// GET /api/v1/wellness/period/reminder/pill
// Get contraceptive pill reminder settings
// =============================================================================

periodRoutes.get('/reminder/pill', async (c) => {
  const user = c.get('user');

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return c.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const pillReminder = (profile.notificationPreferences as Record<string, unknown>)
      ?.contraceptivePillReminder || null;

    return c.json({
      success: true,
      data: pillReminder,
    });
  } catch (error) {
    console.error('[Period] GET /reminder/pill error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch pill reminder settings' },
      { status: 500 }
    );
  }
});

// =============================================================================
// DELETE /api/v1/wellness/period/reminder/pill
// Delete contraceptive pill reminder settings
// =============================================================================

periodRoutes.delete('/reminder/pill', async (c) => {
  const user = c.get('user');

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return c.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const preferences = { ...(profile.notificationPreferences as Prisma.JsonObject | null) ?? {} } as Prisma.JsonObject;
    delete preferences.contraceptivePillReminder;

    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        notificationPreferences: Object.keys(preferences).length ? preferences : Prisma.DbNull,
      },
    });

    return c.json({
      success: true,
      message: 'Contraceptive pill reminder deleted',
    });
  } catch (error) {
    console.error('[Period] DELETE /reminder/pill error:', error);
    return c.json(
      { success: false, error: 'Failed to delete pill reminder settings' },
      { status: 500 }
    );
  }
});

export { periodRoutes };
