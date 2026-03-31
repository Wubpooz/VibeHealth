import { sendTransactionalEmail } from './email';
import { prisma } from './prisma';

let webPush: typeof import('web-push') | null = null;
let webPushAvailable = false;

async function initWebPush(): Promise<void> {
  try {
    webPush = await import('web-push');
  } catch (error) {
    console.warn(
      'web-push package is not installed or cannot be resolved. Web push notifications are disabled.',
      error instanceof Error ? error.message : String(error)
    );
    return;
  }

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || 'noreply@vibehealth.app';

  if (vapidPublicKey && vapidPrivateKey) {
    webPush.setVapidDetails('mailto:' + vapidEmail, vapidPublicKey, vapidPrivateKey);
    webPushAvailable = true;
    console.log('✅ web-push has been configured with VAPID keys.');
  } else {
    console.warn('VAPID keys not configured. Web push notifications will be disabled.');
  }
}

// Initialize web-push at module load time
await initWebPush();

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown> | null;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function sendWebPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<void> {
  const webPushClient = webPush;
  if (!webPushAvailable || !webPushClient) {
    console.log('Skipping web push notification: web-push module unavailable.');
    return;
  }

  // Skip if VAPID keys are not configured
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log('Skipping web push notification: VAPID keys not configured');
    return;
  }

  try {
    // Get user's push subscriptions from profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { notificationPreferences: true }
    });

    if (!profile?.notificationPreferences) {
      return;
    }

    const prefs = profile.notificationPreferences as unknown;
    if (typeof prefs !== 'object' || prefs === null) {
      return;
    }

    const prefsRecord = prefs as Record<string, unknown>;
    const pushSubscriptions = prefsRecord.pushSubscriptions;
    if (!Array.isArray(pushSubscriptions)) {
      return;
    }

    const subscriptions: PushSubscription[] = pushSubscriptions
      .filter((item): item is PushSubscription =>
        typeof item === 'object' && item !== null && 'endpoint' in item && 'keys' in item,
      );

    // Send to all subscriptions
    const webPushClient = webPush;
    if (!webPushClient) {
      return;
    }

    const promises = subscriptions.map(async (subscription) => {
      try {
        await webPushClient.sendNotification(subscription, JSON.stringify(payload));
      } catch (error) {
        console.error('Failed to send push notification:', error);
        // In a real app, you might want to remove invalid subscriptions
      }
    });

    await Promise.allSettled(promises);
  } catch (error) {
    console.error('Error sending web push notification:', error);
  }
}

export async function sendEmailNotification(
  userId: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  try {
    // Get user's email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user?.email) {
      return;
    }

    // Check if email is configured
    const hasEmailConfig = process.env.USESEND_API_KEY?.trim() ||
                          process.env.MAILGUN_API_KEY?.trim();

    if (!hasEmailConfig) {
      console.log(`Skipping email notification for ${user.email}: Email provider not configured`);
      return;
    }

    // Use the same from address logic as other emails
    const from = process.env.USESEND_FROM_EMAIL?.trim() ||
                 process.env.MAILGUN_FROM_EMAIL?.trim() ||
                 'VibeHealth <noreply@vibehealth.app>';

    await sendTransactionalEmail({
      to: user.email,
      from,
      subject,
      html,
      text
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

export async function sendMedicationReminder(
  userId: string,
  medicationName: string,
  dosage: string,
  timeOfDay: string
): Promise<void> {
  const title = 'Medication Reminder';
  const body = `Time to take ${dosage} of ${medicationName} at ${timeOfDay}`;

  const pushPayload: NotificationPayload = {
    title,
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'medication-reminder',
    data: {
      type: 'medication-reminder',
      medicationName,
      dosage,
      timeOfDay
    }
  };

  console.log(`Sending medication reminder for ${medicationName} (${dosage}) to user ${userId}`);

  // Send push notification (will skip if VAPID keys not configured)
  await sendWebPushNotification(userId, pushPayload);

  // Send email notification (will skip if email not configured)
  const subject = `Medication Reminder: ${medicationName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Medication Reminder</h2>
      <p>It's time to take your medication:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>${medicationName}</h3>
        <p><strong>Dosage:</strong> ${dosage}</p>
        <p><strong>Time:</strong> ${timeOfDay}</p>
      </div>
      <p>Stay healthy with VibeHealth! 🐰</p>
    </div>
  `;
  const text = `Medication Reminder\n\nIt's time to take your medication:\n\n${medicationName}\nDosage: ${dosage}\nTime: ${timeOfDay}\n\nStay healthy with VibeHealth!`;

  await sendEmailNotification(userId, subject, html, text);
}