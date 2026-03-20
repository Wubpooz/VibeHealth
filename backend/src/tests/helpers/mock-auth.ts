import type { AuthUser, AuthSession } from '../../middleware/auth.middleware';

export const mockUser: AuthUser = {
  id: 'user-test-id-123',
  email: 'test@vibehealth.com',
  name: 'Test User',
  image: null,
  emailVerified: true,
  role: 'USER',
};

export const mockSession: AuthSession = {
  id: 'session-test-id-456',
  userId: mockUser.id,
  token: 'mock-session-token-abc',
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
};
