import { prisma } from '../lib/prisma';
import { sendMedicationReminder, sendWebPushNotification, sendEmailNotification } from '../lib/notifications';
import { calculateNextDueAt } from '../lib/medication';

function computePillNextDueAt(timeOfDay: string, dayOfWeekReminders: number[] = []): Date {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(':').map(Number);

  if (dayOfWeekReminders.length > 0) {
    const currentDay = now.getDay(); // 0=Sunday..6=Saturday
    const days = dayOfWeekReminders.map((d) => (d + 7) % 7);

    const candidates = days.map((target) => {
      const delta = (target - currentDay + 7) % 7;
      const dt = new Date(now);
      dt.setDate(now.getDate() + (delta === 0 ? 0 : delta));
      dt.setHours(hours, minutes, 0, 0);
      if (delta === 0 && dt <= now) {
        dt.setDate(dt.getDate() + 7);
      }
      return dt;
    });

    return candidates.sort((a, b) => a.getTime() - b.getTime())[0];
  }

  const dt = new Date(now);
  dt.setHours(hours, minutes, 0, 0);
  if (dt <= now) dt.setDate(dt.getDate() + 1);
  return dt;
}

/**
 * Medication Reminder Worker
 * Runs every minute to check for due medication reminders
 * and dispatch notifications via web push and email
 */

async function processDueReminders(): Promise<void> {
  const now = new Date();

  try {
    // Find all reminders that are due (nextDueAt <= now)
    const dueReminders = await prisma.medicationReminder.findMany({
      where: {
        nextDueAt: {
          lte: now
        }
      },
      include: {
        medication: {
          include: {
            profile: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    console.log(`Found ${dueReminders.length} due medication reminders`);

    for (const reminder of dueReminders) {
      try {
        const { medication } = reminder;
        const { profile } = medication;
        const { user } = profile;

        // Send notification
        await sendMedicationReminder(
          user.id,
          medication.name,
          reminder.dosage,
          reminder.timeOfDay
        );

        // Handle ONE_TIME reminders differently - remove them after processing
        if (reminder.recurrence === 'ONE_TIME') {
          await prisma.medicationReminder.delete({
            where: { id: reminder.id }
          });
          console.log(`Processed and removed ONE_TIME reminder for ${medication.name} (${reminder.dosage}) for user ${user.email}`);
        } else {
          // Calculate next due date for recurring reminders
          const nextDueAt = calculateNextDueAt(
            reminder.timeOfDay,
            reminder.recurrence,
            reminder.dayOfWeek,
            reminder.dayOfMonth,
            reminder.date,
            now // Use the time when we processed the reminder
          );

          // Update the reminder with new nextDueAt
          await prisma.medicationReminder.update({
            where: { id: reminder.id },
            data: { nextDueAt }
          });

          console.log(`Processed reminder for ${medication.name} (${reminder.dosage}) for user ${user.email}, next due: ${nextDueAt.toISOString()}`);
        }
      } catch (error) {
        console.error(`Failed to process reminder ${reminder.id}:`, error);
        // Continue processing other reminders even if one fails
      }
    }

    // Process due contraceptive pill reminders as well
    const db = prisma as unknown as {
      contraceptivePillReminder: {
        findMany: (args: object) => Promise<any[]>;
        update: (args: object) => Promise<any>;
      };
    };

    const pillReminders = await db.contraceptivePillReminder.findMany({
      where: {
        enabled: true,
        nextDueAt: {
          lte: now,
        },
      },
      include: {
        user: true,
      },
    });

    for (const pill of pillReminders) {
      try {
        await sendWebPushNotification(pill.userId, {
          title: 'Pill reminder',
          body: `Take your contraceptive pill at ${pill.timeOfDay}`,
          data: { type: 'pill-reminder' },
        });

        await sendEmailNotification(
          pill.userId,
          'Pill reminder',
          `<p>It is time to take your contraceptive pill at ${pill.timeOfDay}.</p>`,
          `It is time to take your contraceptive pill at ${pill.timeOfDay}.`
        );

        const nextDueAt = computePillNextDueAt(pill.timeOfDay, pill.dayOfWeekReminders || []);
        await db.contraceptivePillReminder.update({
          where: { userId: pill.userId },
          data: { nextDueAt },
        });

        console.log(`Processed pill reminder for user ${pill.userId}, next due at ${nextDueAt.toISOString()}`);
      } catch (error) {
        console.error(`Failed to process pill reminder ${pill.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error processing due reminders:', error);
  }
}

async function startWorker(): Promise<void> {
  console.log('🚀 Starting Medication Reminder Worker...');

  // Process immediately on start
  await processDueReminders();

  // Then process every minute
  setInterval(async () => {
    await processDueReminders();
  }, 60 * 1000); // 60 seconds * 1000ms

  console.log('✅ Medication Reminder Worker started successfully');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down Medication Reminder Worker...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down Medication Reminder Worker...');
  process.exit(0);
});

// Start the worker
try {
  await startWorker();
} catch (error) {
  console.error('Failed to start Medication Reminder Worker:', error);
  process.exit(1);
}