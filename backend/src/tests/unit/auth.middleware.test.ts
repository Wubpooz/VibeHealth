/**
 * Unit tests for auth middleware.
 *
 * The preload script (setup.ts) has already replaced lib/auth and lib/prisma
 * with stubs, so we can safely import the middleware and override the auth stub
 * per-test using jest.spyOn().
 */
import { describe, it, expect, beforeEach, afterEach, jest, spyOn } from 'bun:test';
import type { Context, Next } from 'hono';

import * as authLib from '../../lib/auth';
import {
  requireAuth,
  optionalAuth,
  requireRole,
  requireVerifiedEmail,
} from '../../middleware/auth.middleware';
import { mockUser, mockSession } from '../helpers/mock-auth';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeContext = (ctxVars: Record<string, unknown> = {}) => {
  const store = new Map<string, unknown>(Object.entries(ctxVars));

  return {
    req: {
      raw: { headers: new Headers({ cookie: 'session=mock-token' }) },
    },
    json: jest.fn((body: unknown, status = 200) => ({ body, status })),
    set: jest.fn((key: string, value: unknown) => { store.set(key, value); }),
    get: jest.fn((key: string) => store.get(key)),
  } as unknown as Context;
};

const makeNext = (): Next =>
  jest.fn().mockResolvedValue(undefined) as unknown as Next;

// ─── requireAuth ──────────────────────────────────────────────────────────────
describe('requireAuth', () => {
  let getSessionSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    getSessionSpy = spyOn(authLib.auth.api, 'getSession');
  });

  afterEach(() => {
    getSessionSpy?.mockRestore();
  });

  it('calls next() and sets user+session when session is valid', async () => {
    getSessionSpy.mockResolvedValue({ user: mockUser, session: mockSession });

    const ctx = makeContext();
    const next = makeNext();

    await requireAuth(ctx, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.set).toHaveBeenCalledWith('user', mockUser);
    expect(ctx.set).toHaveBeenCalledWith('session', mockSession);
  });

  it('returns 401 and does NOT call next() when session is null', async () => {
    getSessionSpy.mockResolvedValue(null);

    const ctx = makeContext();
    const next = makeNext();

    await requireAuth(ctx, next);

    expect(next).not.toHaveBeenCalled();
    expect(ctx.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' }),
      401,
    );
  });
});

// ─── optionalAuth ─────────────────────────────────────────────────────────────
describe('optionalAuth', () => {
  let getSessionSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    getSessionSpy = spyOn(authLib.auth.api, 'getSession');
  });

  afterEach(() => {
    getSessionSpy?.mockRestore();
  });

  it('calls next() even when no session exists', async () => {
    getSessionSpy.mockResolvedValue(null);

    const ctx = makeContext();
    const next = makeNext();

    await optionalAuth(ctx, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.set).not.toHaveBeenCalled();
  });

  it('sets user+session on context when authenticated', async () => {
    getSessionSpy.mockResolvedValue({ user: mockUser, session: mockSession });

    const ctx = makeContext();
    const next = makeNext();

    await optionalAuth(ctx, next);

    expect(ctx.set).toHaveBeenCalledWith('user', mockUser);
    expect(ctx.set).toHaveBeenCalledWith('session', mockSession);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('still calls next() when getSession throws', async () => {
    getSessionSpy.mockImplementation(() => Promise.reject(new Error('Network error')));

    const ctx = makeContext();
    const next = makeNext();

    await optionalAuth(ctx, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.set).not.toHaveBeenCalled();
  });
});

// ─── requireRole ──────────────────────────────────────────────────────────────
describe('requireRole', () => {
  it('returns 401 when no user is set on context', async () => {
    const ctx = makeContext(); // no user in store
    const next = makeNext();

    await requireRole('ADMIN')(ctx, next);

    expect(ctx.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' }),
      401,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when user role does not match', async () => {
    const ctx = makeContext({ user: { ...mockUser, role: 'USER' } });
    const next = makeNext();

    await requireRole('ADMIN')(ctx, next);

    expect(ctx.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Forbidden' }),
      403,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when user has the exact required role', async () => {
    const ctx = makeContext({ user: { ...mockUser, role: 'ADMIN' } });
    const next = makeNext();

    await requireRole('ADMIN')(ctx, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('calls next() when user matches one of multiple allowed roles', async () => {
    const ctx = makeContext({ user: { ...mockUser, role: 'CAREGIVER' } });
    const next = makeNext();

    await requireRole('ADMIN', 'CAREGIVER')(ctx, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 403 when user has no role field', async () => {
    const ctx = makeContext({ user: { ...mockUser, role: undefined } });
    const next = makeNext();

    await requireRole('ADMIN')(ctx, next);

    expect(ctx.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Forbidden' }),
      403,
    );
  });
});

// ─── requireVerifiedEmail ─────────────────────────────────────────────────────
describe('requireVerifiedEmail', () => {
  it('returns 401 when no user on context', async () => {
    const ctx = makeContext();
    const next = makeNext();

    await requireVerifiedEmail(ctx, next);

    expect(ctx.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' }),
      401,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when email is not verified', async () => {
    const ctx = makeContext({ user: { ...mockUser, emailVerified: false } });
    const next = makeNext();

    await requireVerifiedEmail(ctx, next);

    expect(ctx.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Forbidden' }),
      403,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when email is verified', async () => {
    const ctx = makeContext({ user: { ...mockUser, emailVerified: true } });
    const next = makeNext();

    await requireVerifiedEmail(ctx, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
