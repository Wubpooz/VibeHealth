import { prisma } from '../lib/prisma';
import { sendMedicationReminder } from '../lib/notifications';
import { calculateNextDueAt } from '../lib/medication';

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
startWorker().catch((error) => {
  console.error('Failed to start Medication Reminder Worker:', error);
  process.exit(1);
});