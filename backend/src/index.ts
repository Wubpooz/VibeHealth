import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { authRoutes } from './routes/auth.routes';
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
