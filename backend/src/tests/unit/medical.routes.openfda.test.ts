import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import { Hono } from 'hono';
import * as authLib from '../../lib/auth';
import { medicalRoutes } from '../../routes/medical.routes';
import { mockUser, mockSession } from '../helpers/mock-auth';

const buildApp = () => {
  const app = new Hono();
  app.route('/medical', medicalRoutes);
  return app;
};

describe('GET /medical/openfda', () => {
  let getSessionSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    getSessionSpy = spyOn(authLib.auth.api, 'getSession').mockResolvedValue({
      user: mockUser,
      session: mockSession,
    } as never);
  });

  afterEach(() => {
    getSessionSpy?.mockRestore();
  });

  it('returns drug intel from OpenFDA when the drug exists', async () => {
    const fakeFetch = Object.assign(
      async () => ({
        ok: true,
        json: async () => ({
          results: [
            {
              openfda: { generic_name: ['Aspirin'], brand_name: ['Aspirin'] },
              adverse_reactions: ['Nausea', 'Dizziness'],
              drug_interactions: ['Warfarin', 'Ibuprofen'],
              warnings: ['Do not use in children'],
              dosage_and_administration: ['1 tablet every 4-6 hours'],
            },
          ],
        }),
      } as unknown as Response),
      {
        preconnect: async () => undefined,
      }
    ) as unknown as typeof fetch;

    globalThis.fetch = fakeFetch;

    const app = buildApp();
    const response = await app.request('/medical/openfda?name=Aspirin');

    expect(response.status).toBe(200);

    const body = (await response.json()) as any;
    expect(body.name).toBe('Aspirin');
    expect(body.officialName).toBe('Aspirin');
    expect(body.sideEffects).toEqual(['Nausea', 'Dizziness']);
    expect(body.interactions).toEqual(['Warfarin', 'Ibuprofen']);
    expect(body.warnings).toEqual(['Do not use in children']);
    expect(body.dosage).toEqual(['1 tablet every 4-6 hours']);
  });
});
