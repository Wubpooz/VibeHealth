import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP, magicLink } from 'better-auth/plugins';
import { prisma } from './prisma';
import { sendWithDevFallback } from './email';

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

const testAuth = {
  api: {
    getSession: () => Promise.resolve(null),
  },
  handler: () => Promise.resolve(new Response('ok', { status: 200 })),
};

const authSecret = process.env.AUTH_SECRET;
if (!isTest && (!authSecret || authSecret.length < 32)) {
  if (!isDev) {
    throw new Error('AUTH_SECRET must be set and at least 32 characters long in production');
  }
}

export const auth = isTest
  ? testAuth
  : betterAuth({
      database: prismaAdapter(prisma, {
        provider: 'postgresql',
      }),

      secret: authSecret,
      baseURL: process.env.AUTH_URL || 'http://localhost:3000',

      trustedOrigins: [
        'http://localhost:4200',
        'http://127.0.0.1:4200',
        ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
      ],

      emailAndPassword: {
        enabled: true,
        // In dev mode, don't require email verification for easier testing
        requireEmailVerification: !isDev,
      },

      plugins: [
        emailOTP({
          overrideDefaultEmailVerification: true,
          sendVerificationOnSignUp: true,
          async sendVerificationOTP({ email, otp, type }) {
            await sendWithDevFallback({
              kind: 'otp',
              recipient: email,
              otp,
              otpType: type,
            });
          },
        }),
        magicLink({
          async sendMagicLink({ email, url }) {
            await sendWithDevFallback({
              kind: 'magic-link',
              recipient: email,
              url,
            });
          },
        }),
      ],

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
      }
    });

export type Auth = typeof auth;
