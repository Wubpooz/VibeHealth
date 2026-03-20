import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';
import type { Session as AuthSession, User as AuthUser } from 'better-auth';

// Extend Hono context to include auth info
type AuthContext = {
  Variables: {
    user: AuthUser;
    session: AuthSession;
  };
};

const profileRoutes = new Hono<AuthContext>();

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
  
  try {
    // Transform the incoming data to match the Prisma schema
    const profileData = {
      userId: user.id,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      biologicalSex: body.biologicalSex || null,
      height: convertHeight(body.height, body.heightUnit),
      weight: convertWeight(body.weight, body.weightUnit),
      fitnessLevel: body.fitnessLevel || null,
      goals: body.goals || [],
      medicalConditions: body.medicalConditions || [],
      allergies: body.allergies || [],
      currentMedications: body.currentMedications || [],
      notificationPreferences: body.notificationPreferences || {},
    };
    
    // Upsert profile (create if not exists, update if exists)
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: profileData,
    });
    
    
    // Also update the user's name if provided
    if (body.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: body.name },
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

// Helper functions for unit conversion
function convertHeight(value: number, unit: 'cm' | 'ft'): number | null {
  if (!value) return null;
  if (unit === 'ft') {
    // Convert feet to cm (assuming decimal feet like 5.9)
    return Math.round(value * 30.48);
  }
  return value;
}

function convertWeight(value: number, unit: 'kg' | 'lb'): number | null {
  if (!value) return null;
  if (unit === 'lb') {
    // Convert pounds to kg
    return Math.round(value * 0.453592 * 10) / 10;
  }
  return value;
}

export { profileRoutes };
