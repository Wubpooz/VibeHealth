interface UsesendMailPayload {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
}

const isDev = process.env.NODE_ENV === 'development';

function requiredEnv(name: 'USESEND_API_KEY' | 'USESEND_FROM_EMAIL'): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function usesendBaseUrl(): string {
  return (process.env.USESEND_BASE_URL || 'https://app.usesend.com/api').replace(/\/$/, '');
}

export async function sendTransactionalEmail(payload: UsesendMailPayload): Promise<void> {
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

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  const from = requiredEnv('USESEND_FROM_EMAIL');
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

export async function sendResetPasswordEmail(to: string, resetUrl: string): Promise<void> {
  const from = requiredEnv('USESEND_FROM_EMAIL');
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

export async function sendWithDevFallback(
  label: 'verify' | 'reset',
  recipient: string,
  url: string,
): Promise<void> {
  try {
    if (label === 'verify') {
      await sendVerificationEmail(recipient, url);
      return;
    }
    await sendResetPasswordEmail(recipient, url);
  } catch (error) {
    if (!isDev) {
      throw error;
    }
    const prefix = label === 'verify' ? 'Verify email' : 'Password reset';
    console.log(`\n📧 [DEV] ${prefix} for ${recipient}:\n${url}\n`);
    console.warn('⚠️ useSend delivery unavailable in development. Falling back to console output.');
  }
}
