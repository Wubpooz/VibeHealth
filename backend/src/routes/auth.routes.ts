import { Hono } from 'hono';
import { auth } from '../lib/auth';

const authRoutes = new Hono();

function isAuthProvidersRouteAllowed(req: Request): boolean {
  // Allow same-origin frontend requests and localhost development defaults.
  // This keeps provider discovery usable for login/signup while reducing blind cross-origin probing.
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  const frontendUrl = process.env.FRONTEND_URL;
  const backendPort = process.env.PORT || '3000';

  if (frontendUrl && origin && origin === frontendUrl) {
    return true;
  }

  const isLocalBackendHost = host?.startsWith(`localhost:${backendPort}`) || host?.startsWith(`127.0.0.1:${backendPort}`);
  const isLocalFrontendOrigin = origin === 'http://localhost:4200' || origin === 'http://127.0.0.1:4200';
  if (isLocalBackendHost && (!origin || isLocalFrontendOrigin)) {
    return true;
  }

  return false;
}

function isProviderEnabled(clientId?: string, clientSecret?: string): boolean {
  return !!(clientId && clientSecret);
}

authRoutes.get('/providers', (c) => {
  if (!isAuthProvidersRouteAllowed(c.req.raw)) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const providers = [
    {
      id: 'google',
      enabled: isProviderEnabled(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET),
    },
    {
      id: 'github',
      enabled: isProviderEnabled(process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET),
    },
    {
      id: 'apple',
      enabled: isProviderEnabled(process.env.APPLE_CLIENT_ID, process.env.APPLE_CLIENT_SECRET),
    },
  ].filter((provider) => provider.enabled);

  return c.json({
    providers: providers.map((provider) => provider.id),
  });
});

// Mount BetterAuth handler for all auth endpoints
// BetterAuth handles: /sign-in, /sign-up, /sign-out, /session, /verify-email, etc.
authRoutes.all('/*', async (c) => {
  return auth.handler(c.req.raw);
});

export { authRoutes };
