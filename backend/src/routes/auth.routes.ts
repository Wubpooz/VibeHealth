import { Hono } from 'hono';
import { auth } from '../lib/auth';

const authRoutes = new Hono();

// Mount BetterAuth handler for all auth endpoints
// BetterAuth handles: /sign-in, /sign-up, /sign-out, /session, /verify-email, etc.
authRoutes.all('/*', async (c) => {
  return auth.handler(c.req.raw);
});

export { authRoutes };
