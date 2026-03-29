import { describe, it, expect, beforeEach } from 'bun:test';
import { calculateNextDueAt } from '../../lib/medication';
import { ReminderRecurrence } from '@prisma/client';

describe('calculateNextDueAt', () => {
  // Mock current time for consistent testing
  const mockNow = new Date('2024-01-15T10:30:00Z'); // Monday, January 15, 2024, 10:30 AM UTC

  describe('DAILY recurrence', () => {
    it('should schedule for today if timeOfDay has not passed', () => {
      const result = calculateNextDueAt('14:00', ReminderRecurrence.DAILY, null, null, null, mockNow);
      expect(result.toISOString()).toBe('2024-01-15T14:00:00.000Z');
    });

    it('should schedule for tomorrow if timeOfDay has already passed', () => {
      const result = calculateNextDueAt('08:00', ReminderRecurrence.DAILY, null, null, null, mockNow);
      expect(result.toISOString()).toBe('2024-01-16T08:00:00.000Z');
    });
  });

  describe('WEEKLY recurrence', () => {
    it('should schedule for later this week if target day is after current day', () => {
      // Current day is Monday (1), target is Wednesday (3)
      const result = calculateNextDueAt('14:00', ReminderRecurrence.WEEKLY, 3, null, null, mockNow);
      expect(result.toISOString()).toBe('2024-01-17T14:00:00.000Z'); // Wednesday
    });

    it('should schedule for next week if target day is before current day', () => {
      // Current day is Monday (1), target is Sunday (7)
      const result = calculateNextDueAt('14:00', ReminderRecurrence.WEEKLY, 7, null, null, mockNow);
      expect(result.toISOString()).toBe('2024-01-21T14:00:00.000Z'); // Next Sunday
    });

    it('should schedule for today if target day is current day and time has not passed', () => {
      // Current day is Monday (1), target is Monday (1), time is later
      const result = calculateNextDueAt('14:00', ReminderRecurrence.WEEKLY, 1, null, null, mockNow);
      expect(result.toISOString()).toBe('2024-01-15T14:00:00.000Z');
    });

    it('should schedule for next week if target day is current day but time has passed', () => {
      // Current day is Monday (1), target is Monday (1), time has passed
      const result = calculateNextDueAt('08:00', ReminderRecurrence.WEEKLY, 1, null, null, mockNow);
      expect(result.toISOString()).toBe('2024-01-22T08:00:00.000Z'); // Next Monday
    });

    it('should throw error if dayOfWeek is not provided', () => {
      expect(() => calculateNextDueAt('14:00', ReminderRecurrence.WEEKLY, null, null, null, mockNow)).toThrow('dayOfWeek is required for WEEKLY recurrence');
    });
  });

  describe('MONTHLY recurrence', () => {
    it('should schedule for this month if dayOfMonth has not passed', () => {
      // Current date is 15th, target is 20th
      const result = calculateNextDueAt('14:00', ReminderRecurrence.MONTHLY, null, 20, null, mockNow);
      expect(result.toISOString()).toBe('2024-01-20T14:00:00.000Z');
    });

    it('should schedule for next month if dayOfMonth has already passed', () => {
      // Current date is 15th, target is 10th (already passed)
      const result = calculateNextDueAt('14:00', ReminderRecurrence.MONTHLY, null, 10, null, mockNow);
      expect(result.toISOString()).toBe('2024-02-10T14:00:00.000Z');
    });

    it('should handle February correctly', () => {
      // Set date to February 15th
      const febNow = new Date('2024-02-15T10:30:00Z');

      const result = calculateNextDueAt('14:00', ReminderRecurrence.MONTHLY, null, 10, null, febNow);
      expect(result.toISOString()).toBe('2024-03-10T14:00:00.000Z');
    });

    it('should throw error if dayOfMonth is not provided', () => {
      expect(() => calculateNextDueAt('14:00', ReminderRecurrence.MONTHLY, null, null, null, mockNow)).toThrow('dayOfMonth is required for MONTHLY recurrence');
    });
  });

  describe('ONE_TIME recurrence', () => {
    it('should schedule for the specified date at the specified time', () => {
      const targetDate = new Date('2024-03-15T00:00:00Z');
      const result = calculateNextDueAt('16:30', ReminderRecurrence.ONE_TIME, null, null, targetDate, mockNow);
      expect(result.toISOString()).toBe('2024-03-15T16:30:00.000Z');
    });

    it('should throw error if date is not provided', () => {
      expect(() => calculateNextDueAt('14:00', ReminderRecurrence.ONE_TIME, null, null, null, mockNow)).toThrow('date is required for ONE_TIME recurrence');
    });
  });

  describe('error handling', () => {
    it('should throw error for unsupported recurrence type', () => {
      expect(() => calculateNextDueAt('14:00', 'INVALID' as any, null, null, null, mockNow)).toThrow('Unsupported recurrence type: INVALID');
    });
  });
});