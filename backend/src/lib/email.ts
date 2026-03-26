import FormData from 'form-data';
import Mailgun from 'mailgun.js';

interface UsesendMailPayload {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
}

type AuthEmailDelivery =
  | {
      kind: 'otp';
      recipient: string;
      otp: string;
      otpType: string;
    }
  | {
      kind: 'magic-link';
      recipient: string;
      url: string;
    }
  | {
      kind: 'verify-link' | 'reset-link';
      recipient: string;
      url: string;
    };

const isDev = process.env.NODE_ENV === 'development';

type EmailProvider = 'mailgun' | 'usesend';

function selectedProvider(): EmailProvider {
  const configured = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (configured === 'usesend') {
    return 'usesend';
  }
  if (configured === 'mailgun') {
    return 'mailgun';
  }
  return process.env.MAILGUN_API_KEY?.trim() ? 'mailgun' : 'usesend';
}

function requiredEnv(name: 'USESEND_API_KEY' | 'USESEND_FROM_EMAIL'): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function requiredMailgunEnv(name: 'MAILGUN_API_KEY' | 'MAILGUN_SANDBOX_DOMAIN'): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function usesendBaseUrl(): string {
  return (process.env.USESEND_BASE_URL || 'https://app.usesend.com/api').replace(/\/$/, '');
}

function mailgunBaseUrl(): string {
  return (process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net').replace(/\/$/, '');
}

function mailgunFromAddress(): string {
  const explicitFrom = process.env.MAILGUN_FROM_EMAIL?.trim();
  if (explicitFrom) {
    return explicitFrom;
  }

  const fallbackUsesendFrom = process.env.USESEND_FROM_EMAIL?.trim();
  if (fallbackUsesendFrom) {
    return fallbackUsesendFrom;
  }

  const domain = requiredMailgunEnv('MAILGUN_SANDBOX_DOMAIN');
  return `Mailgun Sandbox <postmaster@${domain}>`;
}

async function sendWithUseSend(payload: UsesendMailPayload): Promise<void> {
  const apiKey = requiredEnv('USESEND_API_KEY');
  const response = await fetch(`${usesendBaseUrl()}/v1/emails`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`useSend request failed (${response.status}): ${details}`);
  }
}

async function sendWithMailgun(payload: UsesendMailPayload): Promise<void> {
  const mailgun = new Mailgun(FormData);
  const client = mailgun.client({
    username: 'api',
    key: requiredMailgunEnv('MAILGUN_API_KEY'),
    url: mailgunBaseUrl(),
  });

  const domain = requiredMailgunEnv('MAILGUN_SANDBOX_DOMAIN');
  await client.messages.create(domain, {
    from: payload.from,
    to: [payload.to],
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}

export async function sendTransactionalEmail(payload: UsesendMailPayload): Promise<void> {
  if (selectedProvider() === 'mailgun') {
    await sendWithMailgun(payload);
    return;
  }

  await sendWithUseSend(payload);
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  const from = selectedProvider() === 'mailgun' ? mailgunFromAddress() : requiredEnv('USESEND_FROM_EMAIL');
  const subject = 'Verify your VibeHealth email';
  const html = `
    <p>Hello,</p>
    <p>Please verify your email to continue using VibeHealth.</p>
    <p><a href="${verifyUrl}">Verify my email</a></p>
    <p>If you did not create this account, you can ignore this message.</p>
  `;
  const text = `Hello,\n\nPlease verify your email to continue using VibeHealth.\n${verifyUrl}\n\nIf you did not create this account, you can ignore this message.`;

  await sendTransactionalEmail({ to, from, subject, html, text });
}

export async function sendOtpEmail(to: string, otp: string, type: string): Promise<void> {
  const from = selectedProvider() === 'mailgun' ? mailgunFromAddress() : requiredEnv('USESEND_FROM_EMAIL');

  const contentByType: Record<string, { subject: string; intro: string }> = {
    'sign-in': {
      subject: 'Your VibeHealth sign-in code',
      intro: 'Use this one-time code to sign in to your VibeHealth account.',
    },
    'email-verification': {
      subject: 'Verify your VibeHealth email',
      intro: 'Use this one-time code to verify your VibeHealth email address.',
    },
    'forget-password': {
      subject: 'Reset your VibeHealth password',
      intro: 'Use this one-time code to reset your VibeHealth password.',
    },
  };

  const content = contentByType[type] ?? {
    subject: 'Your VibeHealth verification code',
    intro: 'Use this one-time code to continue your VibeHealth authentication flow.',
  };

  const html = `
    <p>Hello,</p>
    <p>${content.intro}</p>
    <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${otp}</p>
    <p>This code will expire soon.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;
  const text = `Hello,\n\n${content.intro}\n\nCode: ${otp}\n\nThis code will expire soon.\nIf you did not request this, you can ignore this email.`;

  await sendTransactionalEmail({ to, from, subject: content.subject, html, text });
}

export async function sendResetPasswordEmail(to: string, resetUrl: string): Promise<void> {
  const from = selectedProvider() === 'mailgun' ? mailgunFromAddress() : requiredEnv('USESEND_FROM_EMAIL');
  const subject = 'Reset your VibeHealth password';
  const html = `
    <p>Hello,</p>
    <p>We received a request to reset your VibeHealth password.</p>
    <p><a href="${resetUrl}">Reset my password</a></p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;
  const text = `Hello,\n\nWe received a request to reset your VibeHealth password.\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`;

  await sendTransactionalEmail({ to, from, subject, html, text });
}

export async function sendMagicLinkEmail(to: string, magicUrl: string): Promise<void> {
  const from = selectedProvider() === 'mailgun' ? mailgunFromAddress() : requiredEnv('USESEND_FROM_EMAIL');
  const subject = 'Your VibeHealth magic sign-in link';
  const html = `
    <p>Hello,</p>
    <p>Use this secure magic link to sign in to your VibeHealth account:</p>
    <p><a href="${magicUrl}">Sign in to VibeHealth</a></p>
    <p>This link expires soon and can only be used a limited number of times.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;
  const text = `Hello,\n\nUse this secure magic link to sign in to your VibeHealth account:\n${magicUrl}\n\nThis link expires soon and can only be used a limited number of times.\nIf you did not request this, you can ignore this email.`;

  await sendTransactionalEmail({ to, from, subject, html, text });
}

function linkLabel(kind: 'verify-link' | 'reset-link' | 'magic-link'): string {
  if (kind === 'verify-link') {
    return 'Verify email link';
  }
  if (kind === 'reset-link') {
    return 'Password reset link';
  }
  return 'Magic link';
}

async function deliverAuthEmail(delivery: AuthEmailDelivery): Promise<void> {
  if (delivery.kind === 'otp') {
    await sendOtpEmail(delivery.recipient, delivery.otp, delivery.otpType);
    return;
  }

  if (delivery.kind === 'magic-link') {
    await sendMagicLinkEmail(delivery.recipient, delivery.url);
    return;
  }

  if (delivery.kind === 'verify-link') {
    await sendVerificationEmail(delivery.recipient, delivery.url);
    return;
  }

  await sendResetPasswordEmail(delivery.recipient, delivery.url);
}

function logDevFallback(delivery: AuthEmailDelivery): void {
  if (delivery.kind === 'otp') {
    console.log(
      `\n📧 [DEV] OTP (${delivery.otpType}) for ${delivery.recipient}:\n${delivery.otp}\n`,
    );
    return;
  }

  console.log(`\n📧 [DEV] ${linkLabel(delivery.kind)} for ${delivery.recipient}:\n${delivery.url}\n`);
}

export async function sendWithDevFallback(delivery: AuthEmailDelivery): Promise<void> {
  try {
    await deliverAuthEmail(delivery);
  } catch (error) {
    if (!isDev) {
      throw error;
    }
    logDevFallback(delivery);
    console.warn(
      `⚠️ Email delivery via ${selectedProvider()} is unavailable in development. Falling back to console output.`,
    );
  }
}
