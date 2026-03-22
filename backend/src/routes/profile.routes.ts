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

const profileRoutes = new Hono<AuthContext>();

const onboardingProfileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
    (value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)),
    { message: 'Invalid date value' },
  ).optional(),
  biologicalSex: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  height: z.number().nonnegative().max(300).optional(),
  heightUnit: z.enum(['cm', 'ft']).optional(),
  weight: z.number().nonnegative().max(500).optional(),
  weightUnit: z.enum(['kg', 'lb']).optional(),
  fitnessLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active', 'intermediate']).optional(),
  goals: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  medicalConditions: z.array(z.string().trim().min(1).max(120)).max(100).optional(),
  allergies: z.array(z.string().trim().min(1).max(120)).max(100).optional(),
  currentMedications: z.array(z.string().trim().min(1).max(120)).max(100).optional(),
  notificationPreferences: z.record(z.boolean()).optional(),
  preferredActivityKey: z.string().trim().min(1).max(120).optional(),
});

const preferredActivitySchema = z.object({
  preferredActivityKey: z.string().trim().min(1).max(120).nullable(),
});

// All profile routes require authentication
profileRoutes.use('*', requireAuth);

// Get current user's profile
profileRoutes.get('/', async (c) => {
  const user = c.get('user');
  
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    
    if (!profile) {
      return c.json({ profile: null, hasProfile: false });
    }
    
    return c.json({ profile, hasProfile: true });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Create or update profile (from onboarding)
profileRoutes.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const parsed = onboardingProfileSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({
      error: 'Invalid profile payload',
      details: parsed.error.flatten(),
    }, 400);
  }

  const payload = parsed.data;

  if ((payload.height !== undefined && payload.height > 0 && payload.heightUnit === undefined) ||
      (payload.weight !== undefined && payload.weight > 0 && payload.weightUnit === undefined)) {
    return c.json({
      error: 'Invalid profile payload',
      details: 'heightUnit is required when height is provided, and weightUnit is required when weight is provided.',
    }, 400);
  }
  
  try {
    // Transform the incoming data to match the Prisma schema
    const profileData = {
      userId: user.id,
      dateOfBirth: payload.dateOfBirth ? parseDateOnly(payload.dateOfBirth) : null,
      biologicalSex: payload.biologicalSex || null,
      height: convertHeight(payload.height, payload.heightUnit),
      weight: convertWeight(payload.weight, payload.weightUnit),
      fitnessLevel: payload.fitnessLevel || null,
      preferredActivityKey: payload.preferredActivityKey || null,
      goals: payload.goals || [],
      medicalConditions: payload.medicalConditions || [],
      allergies: payload.allergies || [],
      currentMedications: payload.currentMedications || [],
      notificationPreferences: payload.notificationPreferences || {},
    } as any;
    
    // Upsert profile (create if not exists, update if exists)
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: profileData,
    });
    
    
    // Also update the user's name if provided
    if (payload.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: payload.name },
      });
    }
    
    return c.json({ 
      success: true, 
      profile,
      message: 'Profile saved successfully',
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    return c.json({ error: 'Failed to save profile' }, 500);
  }
});

profileRoutes.patch('/preferred-workout', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const parsed = preferredActivitySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({
      error: 'Invalid profile payload',
      details: parsed.error.flatten(),
    }, 400);
  }

  try {
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: { preferredActivityKey: parsed.data.preferredActivityKey },
      create: {
        userId: user.id,
        dateOfBirth: null,
        biologicalSex: null,
        height: null,
        weight: null,
        fitnessLevel: null,
        preferredActivityKey: parsed.data.preferredActivityKey,
        goals: [],
        medicalConditions: [],
        allergies: [],
        currentMedications: [],
        notificationPreferences: {},
      },
    });

    return c.json({ success: true, profile });
  } catch (error) {
    console.error('Error updating preferred workout:', error);
    return c.json({ error: 'Failed to update preferred workout' }, 500);
  }
});

// Helper functions for unit conversion
function convertHeight(value: number | undefined, unit: 'cm' | 'ft' | undefined): number | null {
  if (value === undefined || value === null || value === 0) return null;
  if (unit === 'ft') {
    // Convert feet to cm (assuming decimal feet like 5.9)
    return Math.round(value * 30.48);
  }
  return value;
}

function convertWeight(value: number | undefined, unit: 'kg' | 'lb' | undefined): number | null {
  if (value === undefined || value === null || value === 0) return null;
  if (unit === 'lb') {
    // Convert pounds to kg
    return Math.round(value * 0.453592 * 10) / 10;
  }
  return value;
}

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export { profileRoutes };
