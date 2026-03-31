import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.middleware';
import { awardCarrots } from '../services/rewards.service';
import { prisma } from '../lib/prisma';

const LEVEL_THRESHOLDS = [0, 10, 25, 50, 100, 175, 275, 400, 550, 750, 1000];

function getLevelStats(carrotBalance: number) {
  let currentLevel = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (carrotBalance >= LEVEL_THRESHOLDS[i]) {
      currentLevel = i + 1;
      break;
    }
  }

  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel] ?? currentThreshold + 100;

  const levelProgress = Math.floor(((carrotBalance - currentThreshold) / (nextThreshold - currentThreshold)) * 100);

  return {
    level: currentLevel,
    levelProgress: Number.isFinite(levelProgress) ? Math.max(0, Math.min(100, levelProgress)) : 0,
    nextLevelAt: nextThreshold,
  };
}

type AuthContext = {
  Variables: {
    user: import('better-auth').User;
    session: import('better-auth').Session;
  };
};

const rewardsRoutes = new Hono<AuthContext>();
rewardsRoutes.use('*', requireAuth);

// GET /api/v1/rewards
rewardsRoutes.get('/', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: {
      carrotBalance: true,
      currentStreak: true,
      longestStreak: true,
      lastCheckIn: true,
    },
  });

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  const levelStats = getLevelStats(profile.carrotBalance);
  return c.json({ success: true, data: { ...profile, ...levelStats } });
});

// POST /api/v1/rewards/award
rewardsRoutes.post('/award', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const amount = Number(body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return c.json({ error: 'Invalid award amount' }, 400);
  }

  try {
    await awardCarrots(user.id, amount);
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { carrotBalance: true },
    });
    const carrotBalance = profile?.carrotBalance ?? 0;
    const levelStats = getLevelStats(carrotBalance);
    return c.json({ success: true, data: { carrotBalance, ...levelStats } });
  } catch (error) {
    console.error('[Rewards] Error awarding carrots:', error);
    return c.json({ success: false, error: 'Failed to award carrots' }, 500);
  }
});

// POST /api/v1/rewards/daily-checkin
rewardsRoutes.post('/daily-checkin', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const today = new Date();
  const dayDateString = today.toISOString().split('T')[0];

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: {
      carrotBalance: true,
      currentStreak: true,
      longestStreak: true,
      lastCheckIn: true,
    },
  });
  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  const lastCheckIn = profile.lastCheckIn ? new Date(profile.lastCheckIn).toISOString().split('T')[0] : null;

  if (lastCheckIn === dayDateString) {
    return c.json({ success: true, message: 'Already checked in today', data: profile });
  }

  let newStreak = 1;
  if (lastCheckIn) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDateString = yesterday.toISOString().split('T')[0];
    if (lastCheckIn === yesterdayDateString) {
      newStreak = profile.currentStreak + 1;
    }
  }

  const longestStreak = Math.max(profile.longestStreak, newStreak);

  await prisma.$executeRaw`
    UPDATE profiles
    SET current_streak = ${newStreak}, longest_streak = ${longestStreak}, last_check_in = ${today}
    WHERE user_id = ${user.id};
  `;

  // award carrots for daily check-in + possible streak bonus
  await awardCarrots(user.id, 2);
  if (newStreak === 3) await awardCarrots(user.id, 5);
  if (newStreak === 7) await awardCarrots(user.id, 15);
  if (newStreak === 30) await awardCarrots(user.id, 50);

  const updated = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { carrotBalance: true, currentStreak: true, longestStreak: true },
  });

  const levelStats = getLevelStats(updated?.carrotBalance ?? 0);
  return c.json({ success: true, data: { ...updated, ...levelStats } });
});

export { rewardsRoutes };
