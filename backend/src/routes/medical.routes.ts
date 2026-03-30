import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';
import { calculateNextDueAt } from '../lib/medication';
import type { Session as AuthSession, User as AuthUser } from 'better-auth';
import { z } from 'zod';

// Extend Hono context to include auth info
type AuthContext = {
  Variables: {
    user: AuthUser;
    session: AuthSession;
  };
};

const medicalRoutes = new Hono<AuthContext>();

const openFdaQuerySchema = z.object({
  name: z.string().trim().min(1),
});

const medicationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  standardName: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
  duration: z.number().int().positive().max(365).optional(), // Duration in days
});

const medicationUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  standardName: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
  duration: z.number().int().positive().max(365).optional(),
});

const reminderSchema = z.object({
  timeOfDay: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  dosage: z.string().trim().min(1).max(100),
  recurrence: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'ONE_TIME']),
  dayOfWeek: z.coerce.number().int().min(1).max(7).optional(),
  dayOfMonth: z.coerce.number().int().min(1).max(31).optional(),
  date: z.string().optional(),
}).superRefine((data, ctx) => {
  const hasDayOfWeek = data.dayOfWeek !== undefined && data.dayOfWeek !== null;
  const hasDayOfMonth = data.dayOfMonth !== undefined && data.dayOfMonth !== null;
  const hasDate = data.date !== undefined && data.date !== null;

  switch (data.recurrence) {
    case 'DAILY':
      if (hasDayOfWeek) ctx.addIssue({ path: ['dayOfWeek'], code: z.ZodIssueCode.custom, message: 'dayOfWeek must not be set for DAILY recurrence' });
      if (hasDayOfMonth) ctx.addIssue({ path: ['dayOfMonth'], code: z.ZodIssueCode.custom, message: 'dayOfMonth must not be set for DAILY recurrence' });
      if (hasDate) ctx.addIssue({ path: ['date'], code: z.ZodIssueCode.custom, message: 'date must not be set for DAILY recurrence' });
      break;
    case 'WEEKLY':
      if (!hasDayOfWeek) ctx.addIssue({ path: ['dayOfWeek'], code: z.ZodIssueCode.custom, message: 'dayOfWeek is required for WEEKLY recurrence' });
      if (hasDayOfMonth) ctx.addIssue({ path: ['dayOfMonth'], code: z.ZodIssueCode.custom, message: 'dayOfMonth must not be set for WEEKLY recurrence' });
      if (hasDate) ctx.addIssue({ path: ['date'], code: z.ZodIssueCode.custom, message: 'date must not be set for WEEKLY recurrence' });
      break;
    case 'MONTHLY':
      if (!hasDayOfMonth) ctx.addIssue({ path: ['dayOfMonth'], code: z.ZodIssueCode.custom, message: 'dayOfMonth is required for MONTHLY recurrence' });
      if (hasDayOfWeek) ctx.addIssue({ path: ['dayOfWeek'], code: z.ZodIssueCode.custom, message: 'dayOfWeek must not be set for MONTHLY recurrence' });
      if (hasDate) ctx.addIssue({ path: ['date'], code: z.ZodIssueCode.custom, message: 'date must not be set for MONTHLY recurrence' });
      break;
    case 'ONE_TIME':
      if (!hasDate) ctx.addIssue({ path: ['date'], code: z.ZodIssueCode.custom, message: 'date is required for ONE_TIME recurrence' });
      else if (Number.isNaN(Date.parse(data.date!))) ctx.addIssue({ path: ['date'], code: z.ZodIssueCode.custom, message: 'date must be a valid ISO date string' });
      if (hasDayOfWeek) ctx.addIssue({ path: ['dayOfWeek'], code: z.ZodIssueCode.custom, message: 'dayOfWeek must not be set for ONE_TIME recurrence' });
      if (hasDayOfMonth) ctx.addIssue({ path: ['dayOfMonth'], code: z.ZodIssueCode.custom, message: 'dayOfMonth must not be set for ONE_TIME recurrence' });
      break;
  }
});

medicalRoutes.get('/openfda', async (c) => {
  const name = c.req.query('name')?.trim();

  if (!name) {
    return c.json({ error: 'Missing required query parameter: name' }, 400);
  }

  const validated = openFdaQuerySchema.safeParse({ name });
  if (!validated.success) {
    return c.json({ error: 'Invalid name query parameter', details: validated.error.flatten() }, 400);
  }

  const encodedQuery = encodeURIComponent(`openfda.generic_name.exact:"${name}" OR openfda.brand_name.exact:"${name}"`);
  const openFdaUrl = `https://api.fda.gov/drug/label.json?search=${encodedQuery}&limit=1`;

  try {
    const res = await fetch(openFdaUrl, { method: 'GET' });
    if (!res.ok) {
      const payload = await res.text();
      console.error('OpenFDA request failed', res.status, payload);
      return c.json({ error: 'OpenFDA service unavailable' }, 502);
    }

    type OpenFdaResponse = {
      results?: Array<Record<string, unknown>>;
    };

    const data = (await res.json()) as OpenFdaResponse | null;
    const drug = data?.results?.[0];

    if (!drug?.openfda) {
      return c.json({ error: 'Drug not found in OpenFDA', name }, 404);
    }

    type OpenFdaDrug = {
      generic_name?: string[];
      brand_name?: string[];
    };
    const openfda = drug.openfda as OpenFdaDrug;
    const sideEffects = Array.isArray(drug.adverse_reactions) ? drug.adverse_reactions : [];
    const interactions = Array.isArray(drug.drug_interactions) ? drug.drug_interactions : [];
    const warnings = Array.isArray(drug.warnings) ? drug.warnings : [];
    const dosage = Array.isArray(drug.dosage_and_administration) ? drug.dosage_and_administration : [];

    return c.json({
      name,
      officialName: openfda.generic_name?.[0] ?? openfda.brand_name?.[0] ?? name,
      openfda,
      sideEffects,
      interactions,
      warnings,
      dosage,
    });
  } catch (error) {
    console.error('Error calling OpenFDA:', error);
    return c.json({ error: 'Failed to fetch OpenFDA data' }, 502);
  }
});

medicalRoutes.use('*', requireAuth);

medicalRoutes.get('/', async (c) => {
  const user = c.get('user');

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return c.json({ medications: [] });
    }

    const medications = await prisma.medication.findMany({
      where: { profileId: profile.id },
      include: { reminders: true },
      orderBy: { name: 'asc' },
    });

    return c.json({ medications });
  } catch (error) {
    console.error('Error fetching medications:', error);
    return c.json({ error: 'Failed to fetch medications' }, 500);
  }
});

medicalRoutes.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const parsed = medicationSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({
      error: 'Invalid payload',
      details: parsed.error.flatten(),
    }, 400);
  }

  try {
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        goals: [],
        medicalConditions: [],
        allergies: [],
        currentMedications: [],
        notificationPreferences: {},
      },
      update: {},
    });

    const medication = await prisma.medication.create({
      data: {
        profileId: profile.id,
        name: parsed.data.name,
        standardName: parsed.data.standardName || null,
        notes: parsed.data.notes || null,
        duration: parsed.data.duration || null,
      },
      include: { reminders: true },
    });

    return c.json({ success: true, medication }, 201);
  } catch (error) {
    console.error('Error creating medication:', error);
    return c.json({ error: 'Failed to create medication' }, 500);
  }
});

medicalRoutes.put('/:id', async (c) => {
  const user = c.get('user');
  const medId = c.req.param('id');
  const body = await c.req.json();

  const parsed = medicationUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({
      error: 'Invalid payload',
      details: parsed.error.flatten(),
    }, 400);
  }

  try {
    const existingMedication = await prisma.medication.findUnique({
      where: { id: medId },
      include: { profile: true },
    });

    if (!existingMedication) {
      return c.json({ error: 'Medication not found' }, 404);
    }

    if (existingMedication.profile.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const medication = await prisma.medication.update({
      where: { id: medId },
      data: {
        name: parsed.data.name ?? existingMedication.name,
        standardName: parsed.data.standardName ?? existingMedication.standardName,
        notes: parsed.data.notes ?? existingMedication.notes,
        duration: parsed.data.duration ?? existingMedication.duration,
      },
      include: { reminders: true },
    });

    return c.json({ success: true, medication });
  } catch (error) {
    console.error('Error updating medication:', error);
    return c.json({ error: 'Failed to update medication' }, 500);
  }
});

medicalRoutes.delete('/:id', async (c) => {
  const user = c.get('user');
  const medId = c.req.param('id');

  try {
    const existingMedication = await prisma.medication.findUnique({
      where: { id: medId },
      include: { profile: true },
    });

    if (!existingMedication) {
      return c.json({ error: 'Medication not found' }, 404);
    }

    if (existingMedication.profile.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await prisma.medication.delete({ where: { id: medId } });
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting medication:', error);
    return c.json({ error: 'Failed to delete medication' }, 500);
  }
});

// Reminder routes
medicalRoutes.post('/:medicationId/reminders', async (c) => {
  const user = c.get('user');
  const medId = c.req.param('medicationId');
  const body = await c.req.json();

  const parsed = reminderSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({
      error: 'Invalid reminder payload',
      details: parsed.error.flatten(),
    }, 400);
  }

  try {
    // Verify medication ownership
    const medication = await prisma.medication.findUnique({
      where: { id: medId },
      include: { profile: true },
    });

    if (!medication) {
      return c.json({ error: 'Medication not found' }, 404);
    }

    if (medication.profile.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const nextDueAt = calculateNextDueAt(
      parsed.data.timeOfDay,
      parsed.data.recurrence,
      parsed.data.recurrence === 'WEEKLY' ? parsed.data.dayOfWeek ?? null : null,
      parsed.data.recurrence === 'MONTHLY' ? parsed.data.dayOfMonth ?? null : null,
      parsed.data.recurrence === 'ONE_TIME' ? new Date(parsed.data.date!) : null
    );
    console.log('Calculated nextDueAt:', nextDueAt);

    const reminder = await prisma.medicationReminder.create({
      data: {
        medicationId: medId,
        timeOfDay: parsed.data.timeOfDay,
        dosage: parsed.data.dosage,
        recurrence: parsed.data.recurrence,
        dayOfWeek: parsed.data.recurrence === 'WEEKLY' ? parsed.data.dayOfWeek ?? null : null,
        dayOfMonth: parsed.data.recurrence === 'MONTHLY' ? parsed.data.dayOfMonth ?? null : null,
        date: parsed.data.recurrence === 'ONE_TIME' ? new Date(parsed.data.date!) : null,
        nextDueAt,
      },
    });

    return c.json({ success: true, reminder }, 201);
  } catch (error) {
    console.error('Error creating reminder:', error);
    return c.json({ error: 'Failed to create reminder' }, 500);
  }
});

medicalRoutes.put('/:medicationId/reminders/:reminderId', async (c) => {
  const user = c.get('user');
  const medId = c.req.param('medicationId');
  const reminderId = c.req.param('reminderId');
  const body = await c.req.json();

  const parsed = reminderSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({
      error: 'Invalid reminder payload',
      details: parsed.error.flatten(),
    }, 400);
  }

  try {
    // Verify medication ownership
    const medication = await prisma.medication.findUnique({
      where: { id: medId },
      include: { profile: true },
    });

    if (!medication) {
      return c.json({ error: 'Medication not found' }, 404);
    }

    if (medication.profile.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const nextDueAt = calculateNextDueAt(
      parsed.data.timeOfDay,
      parsed.data.recurrence,
      parsed.data.recurrence === 'WEEKLY' ? parsed.data.dayOfWeek ?? null : null,
      parsed.data.recurrence === 'MONTHLY' ? parsed.data.dayOfMonth ?? null : null,
      parsed.data.recurrence === 'ONE_TIME' ? new Date(parsed.data.date!) : null
    );
    console.log('Calculated nextDueAt for update:', nextDueAt);

    const reminder = await prisma.medicationReminder.update({
      where: { id: reminderId },
      data: {
        timeOfDay: parsed.data.timeOfDay,
        dosage: parsed.data.dosage,
        recurrence: parsed.data.recurrence,
        dayOfWeek: parsed.data.recurrence === 'WEEKLY' ? parsed.data.dayOfWeek ?? null : null,
        dayOfMonth: parsed.data.recurrence === 'MONTHLY' ? parsed.data.dayOfMonth ?? null : null,
        date: parsed.data.recurrence === 'ONE_TIME' ? new Date(parsed.data.date!) : null,
        nextDueAt,
      },
    });

    return c.json({ success: true, reminder });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return c.json({ error: 'Failed to update reminder' }, 500);
  }
});

medicalRoutes.delete('/:medicationId/reminders/:reminderId', async (c) => {
  const user = c.get('user');
  const medId = c.req.param('medicationId');
  const reminderId = c.req.param('reminderId');

  try {
    // Verify medication ownership
    const medication = await prisma.medication.findUnique({
      where: { id: medId },
      include: { profile: true },
    });

    if (!medication) {
      return c.json({ error: 'Medication not found' }, 404);
    }

    if (medication.profile.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await prisma.medicationReminder.delete({ where: { id: reminderId } });
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return c.json({ error: 'Failed to delete reminder' }, 500);
  }
});

export { medicalRoutes };
