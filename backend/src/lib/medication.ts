import { ReminderRecurrence } from '@prisma/client';

/**
 * Calculate the next due date for a medication reminder based on its recurrence pattern
 */
export function calculateNextDueAt(
  timeOfDay: string, // HH:MM format
  recurrence: ReminderRecurrence,
  dayOfWeek?: number | null, // 1=Monday..7=Sunday
  dayOfMonth?: number | null, // 1..31
  date?: Date | null, // for ONE_TIME
  currentTime?: Date // for testing purposes
): Date {
  const now = currentTime || new Date();
  const [hours, minutes] = timeOfDay.split(':').map(Number);

  switch (recurrence) {
    case 'DAILY': {
      const todayAtTime = new Date(now);
      todayAtTime.setHours(hours, minutes, 0, 0);

      // If the time has already passed today, schedule for tomorrow
      if (todayAtTime <= now) {
        todayAtTime.setDate(todayAtTime.getDate() + 1);
      }

      return todayAtTime;
    }

    case 'WEEKLY': {
      if (!dayOfWeek) throw new Error('dayOfWeek is required for WEEKLY recurrence');

      const targetDay = dayOfWeek; // 1=Monday, 7=Sunday
      const currentDay = now.getDay() || 7; // Convert Sunday (0) to 7

      let daysUntilTarget = targetDay - currentDay;
      if (daysUntilTarget < 0) {
        daysUntilTarget += 7; // Next week
      } else if (daysUntilTarget === 0) {
        // Same day - check if time has passed
        const todayAtTime = new Date(now);
        todayAtTime.setHours(hours, minutes, 0, 0);
        if (todayAtTime <= now) {
          daysUntilTarget += 7; // Next week
        }
        // If time hasn't passed, daysUntilTarget remains 0 (today)
      }

      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + daysUntilTarget);
      nextDate.setHours(hours, minutes, 0, 0);

      return nextDate;
    }

    case 'MONTHLY': {
      if (!dayOfMonth) throw new Error('dayOfMonth is required for MONTHLY recurrence');

      const nextDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth, hours, minutes, 0, 0);

      // If the date has already passed this month, move to next month
      if (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }

      return nextDate;
    }

    case 'ONE_TIME': {
      if (!date) throw new Error('date is required for ONE_TIME recurrence');

      const nextDate = new Date(date);
      nextDate.setHours(hours, minutes, 0, 0);

      return nextDate;
    }

    default:
      throw new Error(`Unsupported recurrence type: ${recurrence}`);
  }
}