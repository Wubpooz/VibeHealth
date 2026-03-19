import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';

const isDev = process.env.NODE_ENV === 'development';

// Validate AUTH_SECRET at startup
const authSecret = process.env.AUTH_SECRET;
if (!authSecret || authSecret.length < 32) {
  if (isDev && !authSecret) {
    console.warn('⚠️  AUTH_SECRET not set. Using insecure default for development.');
  } else if (!isDev) {
    throw new Error('AUTH_SECRET must be set and at least 32 characters long in production');
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  secret: authSecret || 'INSECURE_DEV_SECRET_DO_NOT_USE_IN_PRODUCTION',
  baseURL: process.env.AUTH_URL || 'http://localhost:3000',

  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:4200',
  ],

  emailAndPassword: {
    enabled: true,
    // In dev mode, don't require email verification for easier testing
    requireEmailVerification: !isDev,
    sendResetPassword: async ({ user, url }) => {
      if (isDev) {
        console.log(`\n📧 [DEV] Password reset for ${user.email}:\n${url}\n`);
      }
      // TODO: Integrate with email service (Phase 0 - later)
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (isDev) {
        console.log(`\n📧 [DEV] Verify email for ${user.email}:\n${url}\n`);
      }
      // TODO: Integrate with email service (Phase 0 - later)
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_CLIENT_SECRET || '',
      enabled: !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET),
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'USER',
        input: false,
      },
    },
  },
});

export type Auth = typeof auth;
