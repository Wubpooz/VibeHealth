import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';
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

const medicationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  standardName: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
});

const medicationUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  standardName: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
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
      },
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
      },
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

export { medicalRoutes };
