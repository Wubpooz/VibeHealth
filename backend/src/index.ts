import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { authRoutes } from './routes/auth.routes';
import { profileRoutes } from './routes/profile.routes';
import { medicalIdRoutes } from './routes/medical-id.routes';
import { metricsRoutes } from './routes/metrics.routes';
import referenceDataRoutes from './routes/reference-data.routes';
import wellnessRoutes from './routes/wellness.routes';
import { requireAuth, type AuthUser, type AuthSession } from './middleware/auth.middleware';

// Extend Hono context types for auth
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
    session: AuthSession;
  }
}

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
}));
app.use('*', prettyJSON());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (BetterAuth handles these)
app.route('/api/auth', authRoutes);

// API routes (v1)
const api = new Hono();

api.get('/', (c) => {
  return c.json({
    message: 'VibeHealth API v1',
    version: '0.1.0'
  });
});

// Example protected route
api.get('/me', requireAuth, (c) => {
  const user = c.get('user');
  return c.json({ user });
});

// Profile routes
api.route('/profile', profileRoutes);

// Medical ID routes
api.route('/medical-id', medicalIdRoutes);

// Reference data routes (public)
api.route('/references', referenceDataRoutes);

// Metrics routes (vitals, hydration)
api.route('/metrics', metricsRoutes);

// Wellness routes (mood, journaling, media)
api.route('/wellness', wellnessRoutes);

app.route('/api/v1', api);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 VibeHealth API starting on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
