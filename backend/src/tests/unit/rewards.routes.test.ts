/**
 * Unit tests for rewards routes.
 */
import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import { Hono } from 'hono';

import { prisma } from '../../lib/prisma';
import * as authLib from '../../lib/auth';
import * as rewardsService from '../../services/rewards.service';
import { rewardsRoutes } from '../../routes/rewards.routes';
import { mockUser, mockSession } from '../helpers/mock-auth';

const buildApp = () => {
  const app = new Hono();
  app.use('*', async (c, next) => {
    c.set('user', mockUser);
    c.set('session', mockSession);
    await next();
  });
  app.route('/rewards', rewardsRoutes);
  return app;
};

describe('POST /rewards/daily-checkin', () => {
  let authGetSessionSpy: ReturnType<typeof spyOn>;
  let profileFindUniqueSpy: ReturnType<typeof spyOn>;
  let profileUpdateSpy: ReturnType<typeof spyOn>;
  let awardCarrotsSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    authGetSessionSpy = spyOn(authLib.auth.api, 'getSession').mockResolvedValue({
      user: mockUser,
      session: mockSession,
    } as never);

    profileFindUniqueSpy = spyOn(prisma.profile, 'findUnique');
    profileUpdateSpy = spyOn(prisma.profile, 'update').mockResolvedValue({} as never);
    awardCarrotsSpy = spyOn(rewardsService, 'awardCarrots').mockResolvedValue();
  });

  afterEach(() => {
    authGetSessionSpy?.mockRestore();
    profileFindUniqueSpy?.mockRestore();
    profileUpdateSpy?.mockRestore();
    awardCarrotsSpy?.mockRestore();
  });

  it('updates streak and last check-in using prisma.profile.update', async () => {
    const fetchedProfile = {
      userId: mockUser.id,
      carrotBalance: 5,
      currentStreak: 0,
      longestStreak: 0,
      lastCheckIn: null,
    };
    const afterUpdateProfile = {
      userId: mockUser.id,
      carrotBalance: 7,
      currentStreak: 1,
      longestStreak: 1,
    };

    profileFindUniqueSpy
      .mockResolvedValueOnce(fetchedProfile as never)
      .mockResolvedValueOnce(afterUpdateProfile as never);

    const app = buildApp();
    const res = await app.request('/rewards/daily-checkin', { method: 'POST' });
    const body = (await res.json()) as { success: boolean; data: { currentStreak: number; longestStreak: number } };

    expect(res.status).toBe(200);
    expect(profileUpdateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: mockUser.id },
        data: expect.objectContaining({
          currentStreak: 1,
          longestStreak: 1,
          lastCheckIn: expect.any(Date),
        }),
      }),
    );
    expect(awardCarrotsSpy).toHaveBeenCalledWith(mockUser.id, 2);
    expect(body.success).toBe(true);
    expect(body.data.currentStreak).toBe(1);
    expect(body.data.longestStreak).toBe(1);
  });
});
