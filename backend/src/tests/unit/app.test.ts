/**
 * Tests for the top-level Hono app setup (health check, 404, error handler).
 *
 * We build a local mini-app that mirrors the structure of src/index.ts rather
 * than importing it directly, so we avoid triggering the Bun.serve() startup.
 */
import { describe, it, expect } from 'bun:test';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';

// ─── Build a mirrored app (avoids importing the real entry-point) ──────────────
const buildApp = () => {
  const app = new Hono();

  app.use('*', cors({ origin: 'http://localhost:4200', credentials: true }));
  app.use('*', prettyJSON());

  app.get('/health', (c) =>
    c.json({ status: 'ok', timestamp: new Date().toISOString() }),
  );

  app.notFound((c) => c.json({ error: 'Not Found' }, 404));

  app.onError((err, c) => {
    console.error(err.message);
    return c.json({ error: 'Internal Server Error' }, 500);
  });

  return app;
};

// ─── Health Check ─────────────────────────────────────────────────────────────
describe('GET /health', () => {
  it('returns HTTP 200', async () => {
    const res = await buildApp().request('/health');
    expect(res.status).toBe(200);
  });

  it('returns { status: "ok" }', async () => {
    const res = await buildApp().request('/health');
    const body: any = await res.json();
    expect(body.status).toBe('ok');
  });

  it('includes a timestamp field', async () => {
    const res = await buildApp().request('/health');
    const body: any = await res.json();
    expect(body.timestamp).toBeDefined();
  });

  it('timestamp is a valid ISO 8601 date string', async () => {
    const res = await buildApp().request('/health');
    const body: any = await res.json();
    const date = new Date(body.timestamp);
    expect(Number.isNaN(date.getTime())).toBe(false);
  });

  it('timestamp is reasonably close to now (within 5 seconds)', async () => {
    const before = Date.now();
    const res = await buildApp().request('/health');
    const body: any = await res.json();
    const after = Date.now();
    const ts = new Date(body.timestamp).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after + 5000);
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
describe('404 not-found handler', () => {
  it('returns HTTP 404 for unknown routes', async () => {
    const res = await buildApp().request('/this/does/not/exist');
    expect(res.status).toBe(404);
  });

  it('returns JSON body with error field', async () => {
    const res = await buildApp().request('/unknown-route');
    const body: any = await res.json();
    expect(body.error).toBe('Not Found');
  });

  it('returns 404 for unknown POST routes', async () => {
    const res = await buildApp().request('/unknown', { method: 'POST' });
    expect(res.status).toBe(404);
  });
});

// ─── CORS headers ─────────────────────────────────────────────────────────────
describe('CORS middleware', () => {
  it('includes Access-Control-Allow-Origin for the configured origin', async () => {
    const res = await buildApp().request('/health', {
      headers: { Origin: 'http://localhost:4200' },
    });
    const origin = res.headers.get('Access-Control-Allow-Origin');
    expect(origin).toBe('http://localhost:4200');
  });

  it('includes Access-Control-Allow-Credentials', async () => {
    const res = await buildApp().request('/health', {
      headers: { Origin: 'http://localhost:4200' },
    });
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────
describe('global error handler', () => {
  it('returns HTTP 500 when a route throws synchronously', async () => {
    const app = new Hono();
    app.onError((_, c) => c.json({ error: 'Internal Server Error' }, 500));
    app.get('/crash', () => { throw new Error('deliberate crash'); });

    const res = await app.request('/crash');
    expect(res.status).toBe(500);
  });

  it('returns { error: "Internal Server Error" } body', async () => {
    const app = new Hono();
    app.onError((_, c) => c.json({ error: 'Internal Server Error' }, 500));
    app.get('/crash', () => { throw new Error('deliberate crash'); });

    const res = await app.request('/crash');
    const body: any = await res.json();
    expect(body.error).toBe('Internal Server Error');
  });
});
