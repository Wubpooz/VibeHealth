import type { Context, Next } from 'hono';
import { auth } from '../lib/auth';

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  emailVerified: boolean;
  role?: string;
};

export type AuthSession = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
};

// Response helpers for consistent error formatting
const unauthorized = (c: Context) =>
  c.json({ error: 'Unauthorized', message: 'Authentication required' }, 401);

const forbidden = (c: Context, message: string) =>
  c.json({ error: 'Forbidden', message }, 403);

// Middleware to require authentication
export const requireAuth = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return unauthorized(c);
  }

  // Attach user and session to context for use in route handlers
  c.set('user', session.user as AuthUser);
  c.set('session', session.session as AuthSession);

  await next();
};

// Middleware to optionally get session (doesn't block if not authenticated)
export const optionalAuth = async (c: Context, next: Next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (session) {
      c.set('user', session.user as AuthUser);
      c.set('session', session.session as AuthSession);
    }
  } catch {
    // Ignore errors - user is simply not authenticated
  }

  await next();
};

// Middleware to require specific role(s)
export const requireRole = (...roles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as AuthUser | undefined;

    if (!user) {
      return unauthorized(c);
    }

    if (!user.role || !roles.includes(user.role)) {
      return forbidden(c, 'Insufficient permissions');
    }

    await next();
  };
};

// Middleware to require email verification
export const requireVerifiedEmail = async (c: Context, next: Next) => {
  const user = c.get('user') as AuthUser | undefined;

  if (!user) {
    return unauthorized(c);
  }

  if (!user.emailVerified) {
    return forbidden(c, 'Email verification required');
  }

  await next();
};
