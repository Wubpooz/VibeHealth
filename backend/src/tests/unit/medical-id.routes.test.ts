import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import { Hono } from 'hono';

import { prisma } from '../../lib/prisma';
import * as authLib from '../../lib/auth';
import { medicalIdRoutes } from '../../routes/medical-id.routes';
import { mockUser, mockSession } from '../helpers/mock-auth';

const buildApp = () => {
  const app = new Hono();
  app.route('/medical-id', medicalIdRoutes);
  return app;
};

const postMedicalId = (app: Hono, payload: Record<string, unknown>) =>
  app.request('/medical-id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

describe('POST /medical-id', () => {
  let authGetSessionSpy: ReturnType<typeof spyOn>;
  let profileUpdateManySpy: ReturnType<typeof spyOn>;
  let medicalIdUpsertSpy: ReturnType<typeof spyOn>;
  let profileFindUniqueSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    authGetSessionSpy = spyOn(authLib.auth.api, 'getSession').mockResolvedValue({
      user: mockUser,
      session: mockSession,
    } as never);

    profileUpdateManySpy = spyOn(prisma.profile, 'updateMany').mockResolvedValue({ count: 1 } as never);
    medicalIdUpsertSpy = spyOn(prisma.medicalId, 'upsert').mockResolvedValue({
      bloodType: 'A+',
      allergies: ['Peanuts'],
      medications: ['Metformin'],
      emergencyContacts: [],
      qrCode: '{}',
      updatedAt: new Date(),
    } as never);
    profileFindUniqueSpy = spyOn(prisma.profile, 'findUnique').mockResolvedValue({
      dateOfBirth: new Date('1990-06-15'),
      medicalConditions: ['Asthma'],
    } as never);
  });

  afterEach(() => {
    authGetSessionSpy?.mockRestore();
    profileUpdateManySpy?.mockRestore();
    medicalIdUpsertSpy?.mockRestore();
    profileFindUniqueSpy?.mockRestore();
  });

  it('returns 200 with valid payload', async () => {
    const app = buildApp();
    const res = await postMedicalId(app, {
      bloodType: 'A+',
      allergies: ['Peanuts'],
      medications: ['Metformin'],
      medicalConditions: ['Asthma'],
      emergencyContacts: [
        { id: 'c1', name: 'Alice', phone: '+123456', relationship: 'Partner', isPrimary: true },
      ],
    });

    expect(res.status).toBe(200);
    expect(medicalIdUpsertSpy).toHaveBeenCalledTimes(1);
    expect(profileUpdateManySpy).toHaveBeenCalledTimes(1);
  });

  it('returns 400 when emergencyContacts is not an array', async () => {
    const app = buildApp();
    const res = await postMedicalId(app, {
      bloodType: 'A+',
      emergencyContacts: 'not-an-array',
    });
    const body: any = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Invalid medical ID payload');
    expect(medicalIdUpsertSpy).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid bloodType', async () => {
    const app = buildApp();
    const res = await postMedicalId(app, {
      bloodType: 'X+',
      allergies: [],
      medications: [],
      medicalConditions: [],
      emergencyContacts: [],
    });
    const body: any = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Invalid medical ID payload');
    expect(medicalIdUpsertSpy).not.toHaveBeenCalled();
  });

  it('returns 400 when contact name is missing', async () => {
    const app = buildApp();
    const res = await postMedicalId(app, {
      emergencyContacts: [
        { id: 'c1', phone: '+123456' },
      ],
    });
    const body: any = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Invalid medical ID payload');
    expect(medicalIdUpsertSpy).not.toHaveBeenCalled();
  });

  it('does not update profile conditions when medicalConditions is omitted', async () => {
    const app = buildApp();
    const res = await postMedicalId(app, {
      bloodType: 'A+',
      allergies: ['Peanuts'],
      medications: ['Metformin'],
      emergencyContacts: [],
    });

    expect(res.status).toBe(200);
    expect(profileUpdateManySpy).not.toHaveBeenCalled();
    expect(medicalIdUpsertSpy).toHaveBeenCalledTimes(1);
  });
});
