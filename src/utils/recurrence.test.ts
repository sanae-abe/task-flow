/**
 * Recurrence utility functions tests
 * 繰り返し機能の包括的テスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateNextDueDate,
  calculateNextCreationDate,
  isRecurrenceComplete,
  validateRecurrenceConfig,
  getDayName,
  getRecurrencePatternLabel,
  getRecurrenceDescription,
} from './recurrence';
import type { RecurrenceConfig, RecurrencePattern } from '../types';

describe('Recurrence Utils', () => {
  let mockDate: Date;

  beforeEach(() => {
    // Fix the current date to 2025-01-15 12:00:00 UTC (Wednesday) for consistent testing
    mockDate = new Date('2025-01-15T12:00:00.000Z'); // January 15, 2025 (Wednesday) UTC
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper function to create recurrence config
  const createRecurrenceConfig = (
    pattern: RecurrencePattern,
    interval = 1,
    options: Partial<RecurrenceConfig> = {}
  ): RecurrenceConfig => ({
    enabled: true,
    pattern,
    interval,
    ...options,
  });

  describe('calculateNextDueDate', () => {
    describe('Basic functionality and edge cases', () => {
      it('should return null when recurrence is undefined', () => {
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          undefined
        );
        expect(result).toBeNull();
      });

      it('should return null when recurrence is null', () => {
        const result = calculateNextDueDate('2025-01-15T12:00:00.000Z', null);
        expect(result).toBeNull();
      });

      it('should return null when recurrence is disabled', () => {
        const recurrence = {
          ...createRecurrenceConfig('daily'),
          enabled: false,
        };
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        );
        expect(result).toBeNull();
      });

      it('should return null for invalid date string', () => {
        const recurrence = createRecurrenceConfig('daily');
        const result = calculateNextDueDate('invalid-date', recurrence);
        expect(result).toBeNull();
      });

      it('should return null for unknown pattern', () => {
        const recurrence = {
          ...createRecurrenceConfig('daily'),
          pattern: 'unknown' as any,
        };
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        );
        expect(result).toBeNull();
      });
    });

    describe('Daily recurrence', () => {
      it('should calculate next day for daily interval 1', () => {
        const recurrence = createRecurrenceConfig('daily', 1);
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        );

        const expected = '2025-01-16T12:00:00.000Z';
        expect(result).toBe(expected);
      });

      it('should calculate next occurrence for daily interval 3', () => {
        const recurrence = createRecurrenceConfig('daily', 3);
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        );

        const expected = '2025-01-18T12:00:00.000Z'; // 3 days later
        expect(result).toBe(expected);
      });

      it('should handle month boundary correctly', () => {
        const recurrence = createRecurrenceConfig('daily', 5);
        const result = calculateNextDueDate(
          '2025-01-28T12:00:00.000Z',
          recurrence
        ); // Jan 28 + 5 days = Feb 2

        const expected = '2025-02-02T12:00:00.000Z';
        expect(result).toBe(expected);
      });

      it('should handle year boundary correctly', () => {
        const recurrence = createRecurrenceConfig('daily', 10);
        const result = calculateNextDueDate(
          '2024-12-25T12:00:00.000Z',
          recurrence
        ); // Dec 25 + 10 days = Jan 4

        const expected = '2025-01-04T12:00:00.000Z';
        expect(result).toBe(expected);
      });
    });

    describe('Weekly recurrence', () => {
      it('should calculate next week for weekly interval 1 without specific days', () => {
        const recurrence = createRecurrenceConfig('weekly', 1);
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        ); // Wednesday

        const expected = '2025-01-22T12:00:00.000Z'; // Next Wednesday
        expect(result).toBe(expected);
      });

      it('should calculate next occurrence for weekly interval 2', () => {
        const recurrence = createRecurrenceConfig('weekly', 2);
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        ); // Wednesday

        const expected = '2025-01-29T12:00:00.000Z'; // 2 weeks later
        expect(result).toBe(expected);
      });

      it('should find next weekday in same week', () => {
        const recurrence = createRecurrenceConfig('weekly', 1, {
          daysOfWeek: [5],
        }); // Friday
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        ); // Wednesday -> Friday

        const expected = '2025-01-17T12:00:00.000Z'; // This Friday
        expect(result).toBe(expected);
      });

      it('should find next weekday in following week when no more days in current week', () => {
        const recurrence = createRecurrenceConfig('weekly', 1, {
          daysOfWeek: [1, 2],
        }); // Monday, Tuesday
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        ); // Wednesday -> next Monday

        const expected = '2025-01-20T12:00:00.000Z'; // Next Monday
        expect(result).toBe(expected);
      });

      it('should handle multiple weekdays correctly', () => {
        const recurrence = createRecurrenceConfig('weekly', 1, {
          daysOfWeek: [1, 3, 5],
        }); // Mon, Wed, Fri
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        ); // Wednesday -> Friday

        const expected = '2025-01-17T12:00:00.000Z'; // This Friday
        expect(result).toBe(expected);
      });

      it('should handle weekly with interval and specific days', () => {
        const recurrence = createRecurrenceConfig('weekly', 2, {
          daysOfWeek: [1],
        }); // Every 2 weeks on Monday
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        ); // Wednesday -> Monday in 2 weeks

        const expected = '2025-01-27T12:00:00.000Z'; // Monday in 2 weeks
        expect(result).toBe(expected);
      });

      it('should handle Sunday correctly (day 0)', () => {
        const recurrence = createRecurrenceConfig('weekly', 1, {
          daysOfWeek: [0],
        }); // Sunday
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        ); // Wednesday -> Sunday

        const expected = '2025-01-19T12:00:00.000Z'; // This Sunday
        expect(result).toBe(expected);
      });

      it('should handle unsorted days of week array', () => {
        const recurrence = createRecurrenceConfig('weekly', 1, {
          daysOfWeek: [5, 1, 3],
        }); // Fri, Mon, Wed (unsorted)
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        ); // Wednesday -> Friday

        const expected = '2025-01-17T12:00:00.000Z'; // This Friday
        expect(result).toBe(expected);
      });
    });

    describe('Monthly recurrence', () => {
      it('should calculate next month without specific day', () => {
        const recurrence = createRecurrenceConfig('monthly', 1);
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        );

        const expected = '2025-02-15T12:00:00.000Z'; // February 15
        expect(result).toBe(expected);
      });

      it('should calculate next occurrence with specific day of month', () => {
        const recurrence = createRecurrenceConfig('monthly', 1, {
          dayOfMonth: 25,
        });
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        );

        const expected = '2025-02-25T12:00:00.000Z'; // February 25
        expect(result).toBe(expected);
      });

      it('should handle invalid day of month by adjusting to month end', () => {
        const recurrence = createRecurrenceConfig('monthly', 1, {
          dayOfMonth: 31,
        });
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        ); // February only has 28 days

        const expected = '2025-02-28T12:00:00.000Z'; // February 28 (end of month)
        expect(result).toBe(expected);
      });

      it('should handle February 29 in non-leap year', () => {
        const recurrence = createRecurrenceConfig('monthly', 1, {
          dayOfMonth: 29,
        });
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        ); // 2025 is not a leap year

        const expected = '2025-02-28T12:00:00.000Z'; // February 28
        expect(result).toBe(expected);
      });

      it('should handle February 29 in leap year', () => {
        const recurrence = createRecurrenceConfig('monthly', 1, {
          dayOfMonth: 29,
        });
        const result = calculateNextDueDate(
          '2024-01-15T12:00:00.000Z',
          recurrence
        ); // 2024 is a leap year

        const expected = '2024-02-29T12:00:00.000Z'; // February 29
        expect(result).toBe(expected);
      });

      it('should calculate next occurrence for monthly interval 3', () => {
        const recurrence = createRecurrenceConfig('monthly', 3, {
          dayOfMonth: 10,
        });
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        );

        const expected = '2025-04-10T12:00:00.000Z'; // April 10 (3 months later)
        expect(result).toBe(expected);
      });

      it('should handle year boundary correctly', () => {
        const recurrence = createRecurrenceConfig('monthly', 6, {
          dayOfMonth: 15,
        });
        const result = calculateNextDueDate(
          '2024-10-15T12:00:00.000Z',
          recurrence
        ); // October + 6 months = April

        const expected = '2025-04-15T12:00:00.000Z'; // April 15, 2025
        expect(result).toBe(expected);
      });
    });

    describe('Yearly recurrence', () => {
      it('should calculate next year for yearly interval 1', () => {
        const recurrence = createRecurrenceConfig('yearly', 1);
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        );

        const expected = '2026-01-15T12:00:00.000Z'; // January 15, 2026
        expect(result).toBe(expected);
      });

      it('should calculate next occurrence for yearly interval 2', () => {
        const recurrence = createRecurrenceConfig('yearly', 2);
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        );

        const expected = '2027-01-15T12:00:00.000Z'; // January 15, 2027
        expect(result).toBe(expected);
      });

      it('should handle leap year correctly', () => {
        const recurrence = createRecurrenceConfig('yearly', 1);
        const result = calculateNextDueDate(
          '2024-02-29T12:00:00.000Z',
          recurrence
        ); // Leap day

        const expected = '2025-03-01T12:00:00.000Z'; // JavaScript auto-corrects Feb 29 in non-leap year to March 1
        expect(result).toBe(expected);
      });
    });

    describe('End date constraints', () => {
      it('should return null when next date exceeds end date', () => {
        const recurrence = createRecurrenceConfig('daily', 1, {
          endDate: '2025-01-16T00:00:00.000Z',
        });
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        ); // Next would be Jan 16, but end date is Jan 16 start

        // Since next date (Jan 16 12:00) > end date (Jan 16 00:00), should return null
        expect(result).toBeNull();
      });

      it('should return next date when it is before end date', () => {
        const recurrence = createRecurrenceConfig('daily', 1, {
          endDate: '2025-01-20T23:59:59.000Z',
        });
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        );

        const expected = '2025-01-16T12:00:00.000Z';
        expect(result).toBe(expected);
      });

      it('should handle invalid end date', () => {
        const recurrence = createRecurrenceConfig('daily', 1, {
          endDate: 'invalid-date',
        });
        const result = calculateNextDueDate(
          '2025-01-15T12:00:00.000Z',
          recurrence
        );

        // Should still calculate next date when end date is invalid
        const expected = '2025-01-16T12:00:00.000Z';
        expect(result).toBe(expected);
      });
    });

    describe('Time preservation', () => {
      it('should preserve original time when calculating next date', () => {
        const recurrence = createRecurrenceConfig('daily', 1);
        const result = calculateNextDueDate(
          '2025-01-15T08:30:45.123Z',
          recurrence
        );

        const expected = '2025-01-16T08:30:45.123Z';
        expect(result).toBe(expected);
      });

      it('should preserve time for all recurrence patterns', () => {
        const originalTime = '2025-01-15T15:45:30.555Z';

        const dailyRecurrence = createRecurrenceConfig('daily', 1);
        const weeklyRecurrence = createRecurrenceConfig('weekly', 1);
        const monthlyRecurrence = createRecurrenceConfig('monthly', 1);
        const yearlyRecurrence = createRecurrenceConfig('yearly', 1);

        const dailyResult = calculateNextDueDate(originalTime, dailyRecurrence);
        const weeklyResult = calculateNextDueDate(
          originalTime,
          weeklyRecurrence
        );
        const monthlyResult = calculateNextDueDate(
          originalTime,
          monthlyRecurrence
        );
        const yearlyResult = calculateNextDueDate(
          originalTime,
          yearlyRecurrence
        );

        expect(dailyResult).toContain('15:45:30.555Z');
        expect(weeklyResult).toContain('15:45:30.555Z');
        expect(monthlyResult).toContain('15:45:30.555Z');
        expect(yearlyResult).toContain('15:45:30.555Z');
      });
    });
  });

  describe('calculateNextCreationDate', () => {
    it('should have same logic as calculateNextDueDate', () => {
      const recurrence = createRecurrenceConfig('daily', 2);
      const baseDate = '2025-01-15T12:00:00.000Z';

      const dueResult = calculateNextDueDate(baseDate, recurrence);
      const creationResult = calculateNextCreationDate(baseDate, recurrence);

      expect(creationResult).toBe(dueResult);
    });

    it('should return null for same conditions as calculateNextDueDate', () => {
      expect(
        calculateNextCreationDate('2025-01-15T12:00:00.000Z', null)
      ).toBeNull();
      expect(
        calculateNextCreationDate('2025-01-15T12:00:00.000Z', undefined)
      ).toBeNull();
      expect(
        calculateNextCreationDate(
          'invalid-date',
          createRecurrenceConfig('daily')
        )
      ).toBeNull();
    });

    it('should handle all recurrence patterns correctly', () => {
      const baseDate = '2025-01-15T12:00:00.000Z';

      const dailyResult = calculateNextCreationDate(
        baseDate,
        createRecurrenceConfig('daily', 1)
      );
      const weeklyResult = calculateNextCreationDate(
        baseDate,
        createRecurrenceConfig('weekly', 1)
      );
      const monthlyResult = calculateNextCreationDate(
        baseDate,
        createRecurrenceConfig('monthly', 1)
      );
      const yearlyResult = calculateNextCreationDate(
        baseDate,
        createRecurrenceConfig('yearly', 1)
      );

      expect(dailyResult).toBe('2025-01-16T12:00:00.000Z');
      expect(weeklyResult).toBe('2025-01-22T12:00:00.000Z');
      expect(monthlyResult).toBe('2025-02-15T12:00:00.000Z');
      expect(yearlyResult).toBe('2026-01-15T12:00:00.000Z');
    });
  });

  describe('isRecurrenceComplete', () => {
    it('should return true when recurrence is undefined', () => {
      const result = isRecurrenceComplete(undefined, 5);
      expect(result).toBe(true);
    });

    it('should return true when recurrence is null', () => {
      const result = isRecurrenceComplete(null, 5);
      expect(result).toBe(true);
    });

    it('should return true when max occurrences is reached', () => {
      const recurrence = createRecurrenceConfig('daily', 1, {
        maxOccurrences: 5,
      });
      const result = isRecurrenceComplete(recurrence, 5);
      expect(result).toBe(true);
    });

    it('should return false when max occurrences is not reached', () => {
      const recurrence = createRecurrenceConfig('daily', 1, {
        maxOccurrences: 5,
      });
      const result = isRecurrenceComplete(recurrence, 3);
      expect(result).toBe(false);
    });

    it('should return true when current date exceeds end date', () => {
      const recurrence = createRecurrenceConfig('daily', 1, {
        endDate: '2025-01-10T00:00:00.000Z',
      });
      const result = isRecurrenceComplete(
        recurrence,
        3,
        '2025-01-15T12:00:00.000Z'
      );
      expect(result).toBe(true);
    });

    it('should return false when current date is before end date', () => {
      const recurrence = createRecurrenceConfig('daily', 1, {
        endDate: '2025-01-20T00:00:00.000Z',
      });
      const result = isRecurrenceComplete(
        recurrence,
        3,
        '2025-01-15T12:00:00.000Z'
      );
      expect(result).toBe(false);
    });

    it('should return false when no end constraints are set', () => {
      const recurrence = createRecurrenceConfig('daily', 1);
      const result = isRecurrenceComplete(recurrence, 100);
      expect(result).toBe(false);
    });

    it('should handle missing current date when end date is set', () => {
      const recurrence = createRecurrenceConfig('daily', 1, {
        endDate: '2025-01-10T00:00:00.000Z',
      });
      const result = isRecurrenceComplete(recurrence, 3); // No current date provided
      expect(result).toBe(false);
    });

    it('should handle edge case where occurrence count equals max occurrences', () => {
      const recurrence = createRecurrenceConfig('daily', 1, {
        maxOccurrences: 5,
      });
      const result = isRecurrenceComplete(recurrence, 5);
      expect(result).toBe(true);
    });

    it('should handle edge case where current date equals end date', () => {
      const endDate = '2025-01-15T12:00:00.000Z';
      const recurrence = createRecurrenceConfig('daily', 1, { endDate });
      const result = isRecurrenceComplete(recurrence, 3, endDate);
      expect(result).toBe(false); // Equal dates are not considered "exceeded"
    });
  });

  describe('validateRecurrenceConfig', () => {
    it('should return empty array for undefined recurrence', () => {
      const errors = validateRecurrenceConfig(undefined);
      expect(errors).toEqual([]);
    });

    it('should return empty array for null recurrence', () => {
      const errors = validateRecurrenceConfig(null);
      expect(errors).toEqual([]);
    });

    it('should return empty array for disabled recurrence', () => {
      const recurrence = { ...createRecurrenceConfig('daily'), enabled: false };
      const errors = validateRecurrenceConfig(recurrence);
      expect(errors).toEqual([]);
    });

    it('should validate interval is positive', () => {
      const recurrence = createRecurrenceConfig('daily', 0);
      const errors = validateRecurrenceConfig(recurrence);
      expect(errors).toContain('間隔は1以上の数値を指定してください');
    });

    it('should validate negative interval', () => {
      const recurrence = createRecurrenceConfig('daily', -1);
      const errors = validateRecurrenceConfig(recurrence);
      expect(errors).toContain('間隔は1以上の数値を指定してください');
    });

    it('should validate weekly recurrence requires days of week', () => {
      const recurrence = createRecurrenceConfig('weekly', 1, {
        daysOfWeek: [],
      });
      const errors = validateRecurrenceConfig(recurrence);
      expect(errors).toContain('週次繰り返しの場合は曜日を選択してください');
    });

    it('should validate weekly recurrence with undefined days of week', () => {
      const recurrence = createRecurrenceConfig('weekly', 1);
      const errors = validateRecurrenceConfig(recurrence);
      expect(errors).toContain('週次繰り返しの場合は曜日を選択してください');
    });

    it('should validate days of week are in valid range', () => {
      const recurrence = createRecurrenceConfig('weekly', 1, {
        daysOfWeek: [0, 7, -1],
      });
      const errors = validateRecurrenceConfig(recurrence);
      expect(errors).toContain('曜日は0-6の範囲で指定してください');
    });

    it('should accept valid days of week', () => {
      const recurrence = createRecurrenceConfig('weekly', 1, {
        daysOfWeek: [0, 1, 6],
      });
      const errors = validateRecurrenceConfig(recurrence);
      expect(errors).not.toContain('曜日は0-6の範囲で指定してください');
    });

    it('should validate monthly recurrence requires day of month', () => {
      const recurrence = createRecurrenceConfig('monthly', 1);
      const errors = validateRecurrenceConfig(recurrence);
      expect(errors).toContain(
        '月次繰り返しの場合は日付（1-31）を指定してください'
      );
    });

    it('should validate day of month is in valid range', () => {
      const recurrence = createRecurrenceConfig('monthly', 1, {
        dayOfMonth: 0,
      });
      const errors = validateRecurrenceConfig(recurrence);
      expect(errors).toContain(
        '月次繰り返しの場合は日付（1-31）を指定してください'
      );

      const recurrence2 = createRecurrenceConfig('monthly', 1, {
        dayOfMonth: 32,
      });
      const errors2 = validateRecurrenceConfig(recurrence2);
      expect(errors2).toContain(
        '月次繰り返しの場合は日付（1-31）を指定してください'
      );
    });

    it('should accept valid day of month', () => {
      const recurrence = createRecurrenceConfig('monthly', 1, {
        dayOfMonth: 15,
      });
      const errors = validateRecurrenceConfig(recurrence);
      expect(errors).not.toContain(
        '月次繰り返しの場合は日付（1-31）を指定してください'
      );
    });

    it('should validate end date and max occurrences are mutually exclusive', () => {
      const recurrence = createRecurrenceConfig('daily', 1, {
        endDate: '2025-01-20T00:00:00.000Z',
        maxOccurrences: 10,
      });
      const errors = validateRecurrenceConfig(recurrence);
      expect(errors).toContain(
        '終了日と最大回数の両方を指定することはできません'
      );
    });

    it('should allow either end date or max occurrences', () => {
      const recurrenceWithEndDate = createRecurrenceConfig('daily', 1, {
        endDate: '2025-01-20T00:00:00.000Z',
      });
      const errorsWithEndDate = validateRecurrenceConfig(recurrenceWithEndDate);
      expect(errorsWithEndDate).not.toContain(
        '終了日と最大回数の両方を指定することはできません'
      );

      const recurrenceWithMaxOccurrences = createRecurrenceConfig('daily', 1, {
        maxOccurrences: 10,
      });
      const errorsWithMaxOccurrences = validateRecurrenceConfig(
        recurrenceWithMaxOccurrences
      );
      expect(errorsWithMaxOccurrences).not.toContain(
        '終了日と最大回数の両方を指定することはできません'
      );
    });

    it('should return multiple errors when multiple validations fail', () => {
      const recurrence = createRecurrenceConfig('weekly', 0, {
        daysOfWeek: [8],
        endDate: '2025-01-20T00:00:00.000Z',
        maxOccurrences: 10,
      });
      const errors = validateRecurrenceConfig(recurrence);

      expect(errors).toHaveLength(3);
      expect(errors).toContain('間隔は1以上の数値を指定してください');
      expect(errors).toContain('曜日は0-6の範囲で指定してください');
      expect(errors).toContain(
        '終了日と最大回数の両方を指定することはできません'
      );
    });

    it('should return no errors for valid configurations', () => {
      const validConfigs = [
        createRecurrenceConfig('daily', 1),
        createRecurrenceConfig('weekly', 2, { daysOfWeek: [1, 3, 5] }),
        createRecurrenceConfig('monthly', 1, { dayOfMonth: 15 }),
        createRecurrenceConfig('yearly', 1),
        createRecurrenceConfig('daily', 1, {
          endDate: '2025-01-20T00:00:00.000Z',
        }),
        createRecurrenceConfig('daily', 1, { maxOccurrences: 10 }),
      ];

      validConfigs.forEach(config => {
        const errors = validateRecurrenceConfig(config);
        expect(errors).toEqual([]);
      });
    });
  });

  describe('getDayName', () => {
    it('should return correct Japanese day names', () => {
      expect(getDayName(0)).toBe('日'); // Sunday
      expect(getDayName(1)).toBe('月'); // Monday
      expect(getDayName(2)).toBe('火'); // Tuesday
      expect(getDayName(3)).toBe('水'); // Wednesday
      expect(getDayName(4)).toBe('木'); // Thursday
      expect(getDayName(5)).toBe('金'); // Friday
      expect(getDayName(6)).toBe('土'); // Saturday
    });

    it('should return empty string for invalid day numbers', () => {
      expect(getDayName(-1)).toBe('');
      expect(getDayName(7)).toBe('');
      expect(getDayName(100)).toBe('');
    });
  });

  describe('getRecurrencePatternLabel', () => {
    it('should return correct Japanese pattern labels', () => {
      expect(getRecurrencePatternLabel('daily')).toBe('毎日');
      expect(getRecurrencePatternLabel('weekly')).toBe('毎週');
      expect(getRecurrencePatternLabel('monthly')).toBe('毎月');
      expect(getRecurrencePatternLabel('yearly')).toBe('毎年');
    });
  });

  describe('getRecurrenceDescription', () => {
    it('should return no recurrence message for undefined', () => {
      const description = getRecurrenceDescription(undefined);
      expect(description).toBe('繰り返しなし');
    });

    it('should return no recurrence message for null', () => {
      const description = getRecurrenceDescription(null);
      expect(description).toBe('繰り返しなし');
    });

    it('should return no recurrence message for disabled', () => {
      const recurrence = { ...createRecurrenceConfig('daily'), enabled: false };
      const description = getRecurrenceDescription(recurrence);
      expect(description).toBe('繰り返しなし');
    });

    describe('Daily descriptions', () => {
      it('should generate daily description for interval 1', () => {
        const recurrence = createRecurrenceConfig('daily', 1);
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('毎日繰り返す');
      });

      it('should generate daily description for interval > 1', () => {
        const recurrence = createRecurrenceConfig('daily', 3);
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('3 日ごとに繰り返す');
      });
    });

    describe('Weekly descriptions', () => {
      it('should generate weekly description without specific days for interval 1', () => {
        const recurrence = createRecurrenceConfig('weekly', 1);
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('毎週繰り返す');
      });

      it('should generate weekly description without specific days for interval > 1', () => {
        const recurrence = createRecurrenceConfig('weekly', 2);
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('2 週ごとに繰り返す');
      });

      it('should generate weekly description with specific days for interval 1', () => {
        const recurrence = createRecurrenceConfig('weekly', 1, {
          daysOfWeek: [1, 3, 5],
        });
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('毎週 月、水、金曜日に繰り返す');
      });

      it('should generate weekly description with specific days for interval > 1', () => {
        const recurrence = createRecurrenceConfig('weekly', 2, {
          daysOfWeek: [1, 5],
        });
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('2 週ごとの 月、金曜日に繰り返す');
      });

      it('should handle single day of week', () => {
        const recurrence = createRecurrenceConfig('weekly', 1, {
          daysOfWeek: [0],
        });
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('毎週 日曜日に繰り返す');
      });
    });

    describe('Monthly descriptions', () => {
      it('should generate monthly description without specific day for interval 1', () => {
        const recurrence = createRecurrenceConfig('monthly', 1);
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('毎月繰り返す');
      });

      it('should generate monthly description without specific day for interval > 1', () => {
        const recurrence = createRecurrenceConfig('monthly', 3);
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('3 ヶ月ごとに繰り返す');
      });

      it('should generate monthly description with specific day for interval 1', () => {
        const recurrence = createRecurrenceConfig('monthly', 1, {
          dayOfMonth: 15,
        });
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('毎月の 15 日に繰り返す');
      });

      it('should generate monthly description with specific day for interval > 1', () => {
        const recurrence = createRecurrenceConfig('monthly', 2, {
          dayOfMonth: 25,
        });
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('2 ヶ月ごとの 25 日に繰り返す');
      });

      it('should generate description for week of month patterns', () => {
        const recurrence = createRecurrenceConfig('monthly', 1, {
          weekOfMonth: 2,
          dayOfWeekInMonth: 1,
        });
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('毎月の 第 2 月曜日に繰り返す');
      });

      it('should generate description for last week of month', () => {
        const recurrence = createRecurrenceConfig('monthly', 1, {
          weekOfMonth: -1,
          dayOfWeekInMonth: 5,
        });
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('毎月の 最終 金曜日に繰り返す');
      });

      it('should generate description for week of month with interval > 1', () => {
        const recurrence = createRecurrenceConfig('monthly', 3, {
          weekOfMonth: 1,
          dayOfWeekInMonth: 0,
        });
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('3 ヶ月ごとの 第 1 日曜日に繰り返す');
      });
    });

    describe('Yearly descriptions', () => {
      it('should generate yearly description for interval 1', () => {
        const recurrence = createRecurrenceConfig('yearly', 1);
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('1 年ごとに繰り返す');
      });

      it('should generate yearly description for interval > 1', () => {
        const recurrence = createRecurrenceConfig('yearly', 2);
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('2 年ごとに繰り返す');
      });
    });

    describe('End conditions', () => {
      it('should append end date to description', () => {
        const recurrence = createRecurrenceConfig('daily', 1, {
          endDate: '2025-12-31T23:59:59.000Z',
        });
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('毎日繰り返す (2025-12-31T23:59:59.000Zまで)');
      });

      it('should append max occurrences to description', () => {
        const recurrence = createRecurrenceConfig('weekly', 1, {
          maxOccurrences: 10,
        });
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('毎週繰り返す (10回まで)');
      });

      it('should not append end conditions when neither is set', () => {
        const recurrence = createRecurrenceConfig('monthly', 1);
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('毎月繰り返す');
      });
    });

    describe('Error handling', () => {
      it('should handle unknown pattern', () => {
        const recurrence = {
          ...createRecurrenceConfig('daily'),
          pattern: 'unknown' as any,
        };
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('繰り返し設定エラー');
      });

      it('should handle missing dayOfWeekInMonth when weekOfMonth is set', () => {
        const recurrence = createRecurrenceConfig('monthly', 1, {
          weekOfMonth: 2,
          // dayOfWeekInMonth is undefined
        });
        const description = getRecurrenceDescription(recurrence);
        expect(description).toBe('毎月繰り返す'); // Falls back to simple monthly description when dayOfWeekInMonth is missing
      });
    });
  });

  describe('Edge cases and complex scenarios', () => {
    it('should handle leap year February 29 correctly across years', () => {
      const recurrence = createRecurrenceConfig('yearly', 1);

      // Starting on leap day 2024
      const result2024 = calculateNextDueDate(
        '2024-02-29T12:00:00.000Z',
        recurrence
      );
      expect(result2024).toBe('2025-03-01T12:00:00.000Z'); // JavaScript auto-corrects to March 1 in non-leap year

      // Starting on Feb 28 in non-leap year, going to leap year
      const result2025 = calculateNextDueDate(
        '2023-02-28T12:00:00.000Z',
        recurrence
      );
      expect(result2025).toBe('2024-02-28T12:00:00.000Z'); // Same date in leap year
    });

    it('should handle monthly recurrence across year boundaries', () => {
      const recurrence = createRecurrenceConfig('monthly', 1, {
        dayOfMonth: 15,
      });
      const result = calculateNextDueDate(
        '2024-12-15T12:00:00.000Z',
        recurrence
      );

      expect(result).toBe('2025-01-15T12:00:00.000Z'); // January 15, 2025
    });

    it('should handle very large intervals', () => {
      const recurrence = createRecurrenceConfig('yearly', 100);
      const result = calculateNextDueDate(
        '2025-01-15T12:00:00.000Z',
        recurrence
      );

      expect(result).toBe('2125-01-15T12:00:00.000Z'); // Year 2125
    });

    it('should handle weekly recurrence with all 7 days', () => {
      const recurrence = createRecurrenceConfig('weekly', 1, {
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      });
      const result = calculateNextDueDate(
        '2025-01-15T12:00:00.000Z',
        recurrence
      ); // Wednesday

      expect(result).toBe('2025-01-16T12:00:00.000Z'); // Next day (Thursday)
    });

    it('should handle performance with complex weekly patterns', () => {
      const recurrence = createRecurrenceConfig('weekly', 4, {
        daysOfWeek: [1, 3, 5], // Multiple days with large interval
      });

      const start = performance.now();
      const result = calculateNextDueDate(
        '2025-01-15T12:00:00.000Z',
        recurrence
      ); // Wednesday
      const duration = performance.now() - start;

      expect(result).toBe('2025-01-17T12:00:00.000Z'); // This Friday
      expect(duration).toBeLessThan(10); // Should be fast
    });
  });
});
