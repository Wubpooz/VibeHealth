import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';
import type { Session as AuthSession, User as AuthUser } from 'better-auth';
import { z } from 'zod';
import { getCycleInsights } from '../services/period';
import { awardCarrots } from '../services/rewards.service';
import { sendWebPushNotification, sendEmailNotification } from '../lib/notifications';

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
// Notification Helpers
// =============================================================================

async function notifyUser(userId: string, title: string, message: string): Promise<void> {
  try {
    await sendWebPushNotification(userId, {
      title,
      body: message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'wellness-notification',
      data: { type: 'wellness', message },
    });

    await sendEmailNotification(
      userId,
      title,
      `<p>${message}</p>`,
      message
    );
  } catch (error) {
    console.error('[Period] notifyUser failed:', error);
  }
}

function computeNextDueAt(timeOfDay: string, dayOfWeekReminders: number[] = []): Date {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(':').map(Number);

  if (dayOfWeekReminders.length > 0) {
    const currentDay = now.getDay(); // 0=Sunday..6=Saturday
    const days = dayOfWeekReminders.map((day) => (day + 7) % 7);

    const head = days
      .map((targetDay) => {
        const delta = (targetDay - currentDay + 7) % 7;
        const candidate = new Date(now);
        candidate.setDate(now.getDate() + (delta === 0 ? 0 : delta));
        candidate.setHours(hours, minutes, 0, 0);

        if (delta === 0 && candidate <= now) {
          candidate.setDate(candidate.getDate() + 7);
        }

        return candidate;
      })
      .sort((a, b) => a.getTime() - b.getTime());

    return head[0];
  }

  const candidate = new Date(now);
  candidate.setHours(hours, minutes, 0, 0);

  if (candidate <= now) {
    candidate.setDate(candidate.getDate() + 1);
  }

  return candidate;
}

async function scheduleContraceptivePillReminder(userId: string, reminder: {
  enabled: boolean;
  timeOfDay: string;
  snoozeDuration: number;
  dayOfWeekReminders: number[];
  notes?: string;
}) {
  const nextDueAt = computeNextDueAt(reminder.timeOfDay, reminder.dayOfWeekReminders);

  const db = prisma as unknown as {
    contraceptivePillReminder: {
      upsert: (args: object) => Promise<unknown>;
    };
  };

  await db.contraceptivePillReminder.upsert({
    where: { userId },
    update: {
      enabled: reminder.enabled,
      timeOfDay: reminder.timeOfDay,
      snoozeDuration: reminder.snoozeDuration,
      dayOfWeekReminders: reminder.dayOfWeekReminders,
      notes: reminder.notes ?? null,
      nextDueAt,
    },
    create: {
      userId,
      enabled: reminder.enabled,
      timeOfDay: reminder.timeOfDay,
      snoozeDuration: reminder.snoozeDuration,
      dayOfWeekReminders: reminder.dayOfWeekReminders,
      notes: reminder.notes ?? null,
      nextDueAt,
    },
  });
}

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
      const isNowEnded = validated.endDate && !existingPeriod.endDate;

      periodLog = await prisma.periodLog.update({
        where: { id: existingPeriod.id },
        data: {
          endDate: validated.endDate ? new Date(validated.endDate) : null,
          flowIntensity: validated.flowIntensity,
          symptoms: validated.symptoms || [],
          notes: validated.notes || null,
        },
      });

      if (isNowEnded) {
        await notifyUser(user.id, 'Period ended', 'Your period log has been completed. Great job keeping track!');
      }
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

      await awardCarrots(user.id, 5);
      await notifyUser(user.id, 'Period logged', 'Your period was successfully logged and 5 carrots were awarded.');
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
    const limit = Math.min(Number.parseInt(limitParam), 24); // Max 24 months
    const offset = Number.parseInt(offsetParam);

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

    let endDate: Date | null | undefined;
    if (validated.endDate === undefined) {
      endDate = undefined;
    } else {
      endDate = validated.endDate ? new Date(validated.endDate) : null;
    }

    const updated = await prisma.periodLog.update({
      where: { id: periodId },
      data: {
        endDate,
        flowIntensity: validated.flowIntensity,
        symptoms: validated.symptoms ?? undefined,
        notes: validated.notes ?? undefined,
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

    const nextDueAt = computeNextDueAt(validated.timeOfDay, validated.dayOfWeekReminders ?? []);

    const db = prisma as unknown as {
      contraceptivePillReminder: {
        upsert: (args: object) => Promise<unknown>;
      };
    };

    const reminder = (await db.contraceptivePillReminder.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        enabled: validated.enabled,
        timeOfDay: validated.timeOfDay,
        snoozeDuration: validated.snoozeDuration,
        dayOfWeekReminders: validated.dayOfWeekReminders ?? [],
        notes: validated.notes ?? null,
        nextDueAt,
      },
      update: {
        enabled: validated.enabled,
        timeOfDay: validated.timeOfDay,
        snoozeDuration: validated.snoozeDuration,
        dayOfWeekReminders: validated.dayOfWeekReminders ?? [],
        notes: validated.notes ?? null,
        nextDueAt,
      },
    })) as {
      enabled: boolean;
      timeOfDay: string;
      snoozeDuration: number;
      dayOfWeekReminders: number[];
      notes: string | null;
      nextDueAt: Date | null;
    };

    if (reminder.enabled) {
      await scheduleContraceptivePillReminder(user.id, {
        enabled: reminder.enabled,
        timeOfDay: reminder.timeOfDay,
        snoozeDuration: reminder.snoozeDuration,
        dayOfWeekReminders: reminder.dayOfWeekReminders,
        notes: reminder.notes ?? undefined,
      });
    }

    return c.json(
      {
        success: true,
        data: {
          ...validated,
          nextDueAt: reminder.nextDueAt,
        },
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
    const db = prisma as unknown as {
      contraceptivePillReminder: {
        findUnique: (args: object) => Promise<unknown>;
      };
    };

    const pillReminder = await db.contraceptivePillReminder.findUnique({
      where: { userId: user.id },
    });

    return c.json({
      success: true,
      data: pillReminder || null,
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
    const db = prisma as unknown as {
      contraceptivePillReminder: {
        findUnique: (args: object) => Promise<unknown>;
        delete: (args: object) => Promise<unknown>;
      };
    };

    const existing = await db.contraceptivePillReminder.findUnique({
      where: { userId: user.id },
    });

    if (!existing) {
      return c.json({ success: false, error: 'Pill reminder not found' }, { status: 404 });
    }

    await db.contraceptivePillReminder.delete({
      where: { userId: user.id },
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
