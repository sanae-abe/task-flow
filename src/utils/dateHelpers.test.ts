/**
 * Date helper functions tests
 * 日付ヘルパー関数の包括的テスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getDateStatus,
  formatDueDate,
  formatDueDateWithYear,
  formatDateTime,
  formatDate,
  toDateTimeLocalString,
  fromDateTimeLocalString,
  getCurrentDateTimeLocal,
} from './dateHelpers';

describe('DateHelpers', () => {
  let mockDate: Date;

  beforeEach(() => {
    // Fix the current date to 2025-01-15 12:00:00 in local timezone for consistent testing
    mockDate = new Date(2025, 0, 15, 12, 0, 0); // Year, Month (0-based), Day, Hour, Minute, Second
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getDateStatus', () => {
    it('should return all false when date is undefined', () => {
      const result = getDateStatus(undefined);

      expect(result).toEqual({
        isOverdue: false,
        isDueToday: false,
        isDueTomorrow: false,
      });
    });

    it('should return isOverdue true for past dates', () => {
      const yesterdayDate = new Date(2025, 0, 14, 10, 0, 0); // January 14, 2025 10:00
      const result = getDateStatus(yesterdayDate);

      expect(result.isOverdue).toBe(true);
      expect(result.isDueToday).toBe(false);
      expect(result.isDueTomorrow).toBe(false);
    });

    it('should return isDueToday true for today dates', () => {
      const todayDate = new Date(2025, 0, 15, 15, 30, 0); // January 15, 2025 15:30 (same day, different time)
      const result = getDateStatus(todayDate);

      expect(result.isOverdue).toBe(false);
      expect(result.isDueToday).toBe(true);
      expect(result.isDueTomorrow).toBe(false);
    });

    it('should return isDueTomorrow true for tomorrow dates', () => {
      const tomorrowDate = new Date(2025, 0, 16, 8, 0, 0); // January 16, 2025 08:00
      const result = getDateStatus(tomorrowDate);

      expect(result.isOverdue).toBe(false);
      expect(result.isDueToday).toBe(false);
      expect(result.isDueTomorrow).toBe(true);
    });

    it('should return all false for future dates beyond tomorrow', () => {
      const futureDate = new Date(2025, 0, 20, 10, 0, 0); // January 20, 2025 10:00
      const result = getDateStatus(futureDate);

      expect(result.isOverdue).toBe(false);
      expect(result.isDueToday).toBe(false);
      expect(result.isDueTomorrow).toBe(false);
    });

    it('should handle edge case of exact midnight', () => {
      const midnightToday = new Date(2025, 0, 15, 0, 0, 0); // January 15, 2025 00:00
      const result = getDateStatus(midnightToday);

      expect(result.isDueToday).toBe(true);
      expect(result.isOverdue).toBe(false);
      expect(result.isDueTomorrow).toBe(false);
    });

    it('should handle timezone differences correctly', () => {
      // Test with date that's clearly today
      const sameDayDifferentTz = new Date(2025, 0, 15, 23, 59, 59); // January 15, 2025 23:59:59
      const result = getDateStatus(sameDayDifferentTz);

      expect(result.isDueToday).toBe(true);
    });
  });

  describe('formatDueDate', () => {
    it('should format date without time when time is 23:59:59', () => {
      const date = new Date(2025, 0, 15, 23, 59, 59); // January 15, 2025 23:59:59
      const result = formatDueDate(date);

      // Should not include time portion
      expect(result).toContain('1月15日');
      expect(result).toContain('（');
      expect(result).toContain('）');
      expect(result).not.toContain('23:59');
    });

    it('should format date with time when time is not 23:59:59', () => {
      const date = new Date(2025, 0, 15, 14, 30, 0); // January 15, 2025 14:30
      const result = formatDueDate(date);

      expect(result).toContain('1月15日');
      expect(result).toContain('（');
      expect(result).toContain('）');
      expect(result).toContain('14:30');
    });

    it('should include weekday in formatted output', () => {
      const date = new Date(2025, 0, 15, 10, 0, 0); // January 15, 2025 (Wednesday) 10:00
      const result = formatDueDate(date);

      expect(result).toContain('（');
      expect(result).toContain('）');
      // Should contain Japanese weekday abbreviation
    });

    it('should handle midnight time (00:00)', () => {
      const date = new Date(2025, 0, 15, 0, 0, 0); // January 15, 2025 00:00
      const result = formatDueDate(date);

      expect(result).toContain('0:00');
    });

    it('should handle edge case of 23:59:58 (should show time)', () => {
      const date = new Date(2025, 0, 15, 23, 59, 58); // January 15, 2025 23:59:58
      const result = formatDueDate(date);

      expect(result).toContain('23:59');
    });
  });

  describe('formatDueDateWithYear', () => {
    it('should format date with year without time when time is 23:59:59', () => {
      const date = new Date(2025, 0, 15, 23, 59, 59); // January 15, 2025 23:59:59
      const result = formatDueDateWithYear(date);

      expect(result).toContain('2025年');
      expect(result).toContain('1月15日');
      expect(result).not.toContain('23:59');
    });

    it('should format date with year and time when time is not 23:59:59', () => {
      const date = new Date(2025, 0, 15, 14, 30, 0); // January 15, 2025 14:30
      const result = formatDueDateWithYear(date);

      expect(result).toContain('2025年');
      expect(result).toContain('1月15日');
      expect(result).toContain('14:30');
    });

    it('should work with different years', () => {
      const date = new Date(2024, 11, 31, 15, 45, 0); // December 31, 2024 15:45
      const result = formatDueDateWithYear(date);

      expect(result).toContain('2024年');
      expect(result).toContain('12月31日');
      expect(result).toContain('15:45');
    });
  });

  describe('formatDateTime', () => {
    it('should format Date object correctly', () => {
      const date = new Date(2025, 0, 15, 14, 30, 0); // January 15, 2025 14:30
      const result = formatDateTime(date);

      expect(result).toContain('2025');
      expect(result).toContain('14:30');
    });

    it('should format date string correctly', () => {
      const dateString = '2025-01-15T14:30:00'; // Local timezone format
      const result = formatDateTime(dateString);

      expect(result).toContain('2025');
      expect(result).toContain('14:30');
    });

    it('should handle invalid date gracefully', () => {
      const result = formatDateTime('invalid-date');

      // Should return some form of invalid date representation
      expect(typeof result).toBe('string');
    });
  });

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date('2025-01-15T14:30:00.000Z');
      const result = formatDate(date);

      expect(result).toContain('2025');
      expect(result).toContain('1');
      expect(result).toContain('15');
    });

    it('should format date with MM/dd format', () => {
      const date = new Date('2025-01-15T14:30:00.000Z');
      const result = formatDate(date, 'MM/dd');

      expect(result).toBe('01/15');
    });

    it('should format date string with MM/dd format', () => {
      const dateString = '2025-01-15T14:30:00.000Z';
      const result = formatDate(dateString, 'MM/dd');

      expect(result).toBe('01/15');
    });

    it('should handle single digit months and days with MM/dd format', () => {
      const date = new Date('2025-03-05T14:30:00.000Z');
      const result = formatDate(date, 'MM/dd');

      expect(result).toBe('03/05');
    });

    it('should use default format for unknown format strings', () => {
      const date = new Date('2025-01-15T14:30:00.000Z');
      const result = formatDate(date, 'unknown-format');

      expect(result).toContain('2025');
      expect(result).toContain('1');
      expect(result).toContain('15');
    });
  });

  describe('toDateTimeLocalString', () => {
    it('should convert Date to datetime-local string format', () => {
      const date = new Date(2025, 0, 15, 14, 30, 45, 123); // January 15, 2025 14:30:45.123
      const result = toDateTimeLocalString(date);

      expect(result).toBe('2025-01-15T14:30');
    });

    it('should pad single digit values correctly', () => {
      const date = new Date(2025, 2, 5, 8, 5, 0); // March 5, 2025 08:05
      const result = toDateTimeLocalString(date);

      expect(result).toBe('2025-03-05T08:05');
    });

    it('should handle midnight correctly', () => {
      const date = new Date(2025, 0, 15, 0, 0, 0); // January 15, 2025 00:00
      const result = toDateTimeLocalString(date);

      expect(result).toBe('2025-01-15T00:00');
    });

    it('should handle end of day correctly', () => {
      const date = new Date(2025, 0, 15, 23, 59, 59, 999); // January 15, 2025 23:59:59.999
      const result = toDateTimeLocalString(date);

      expect(result).toBe('2025-01-15T23:59');
    });

    it('should ignore seconds and milliseconds', () => {
      const date = new Date(2025, 0, 15, 14, 30, 45, 999); // January 15, 2025 14:30:45.999
      const result = toDateTimeLocalString(date);

      expect(result).toBe('2025-01-15T14:30');
      expect(result).not.toContain('45');
      expect(result).not.toContain('999');
    });
  });

  describe('fromDateTimeLocalString', () => {
    it('should convert valid datetime-local string to Date', () => {
      const result = fromDateTimeLocalString('2025-01-15T14:30');

      expect(result).toBeInstanceOf(Date);
      expect(result!.getFullYear()).toBe(2025);
      expect(result!.getMonth()).toBe(0); // January is 0
      expect(result!.getDate()).toBe(15);
      expect(result!.getHours()).toBe(14);
      expect(result!.getMinutes()).toBe(30);
    });

    it('should return null for empty string', () => {
      const result = fromDateTimeLocalString('');

      expect(result).toBeNull();
    });

    it('should return null for invalid date string', () => {
      const result = fromDateTimeLocalString('invalid-date');

      expect(result).toBeNull();
    });

    it('should handle date without time portion', () => {
      const result = fromDateTimeLocalString('2025-01-15');

      expect(result).toBeInstanceOf(Date);
      expect(result!.getFullYear()).toBe(2025);
      expect(result!.getMonth()).toBe(0);
      expect(result!.getDate()).toBe(15);
    });

    it('should handle ISO string format', () => {
      const result = fromDateTimeLocalString('2025-01-15T14:30:00.000Z');

      expect(result).toBeInstanceOf(Date);
      expect(result!.getFullYear()).toBe(2025);
    });

    it('should return null for malformed datetime strings', () => {
      const testCases = [
        // Note: JavaScript Date constructor auto-corrects some invalid dates,
        // so we test with truly invalid formats that cannot be parsed
        'not-a-date',
        'invalid-format',
        '2025-01-15T14:', // Incomplete time
        'abc-def-ghT12:34', // Non-numeric date parts
      ];

      testCases.forEach(testCase => {
        const result = fromDateTimeLocalString(testCase);
        expect(result).toBeNull();
      });
    });
  });

  describe('getCurrentDateTimeLocal', () => {
    it('should return current date in datetime-local format', () => {
      const result = getCurrentDateTimeLocal();

      expect(result).toBe('2025-01-15T12:00');
    });

    it('should return string in correct format', () => {
      const result = getCurrentDateTimeLocal();

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it('should reflect system time changes', () => {
      // Change system time
      const newTime = new Date(2024, 11, 25, 10, 30, 0); // December 25, 2024 10:30
      vi.setSystemTime(newTime);

      const result = getCurrentDateTimeLocal();

      expect(result).toBe('2024-12-25T10:30');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle leap year dates correctly', () => {
      const leapYearDate = new Date(2024, 1, 29, 12, 0, 0); // February 29, 2024 12:00

      const dueDateResult = formatDueDate(leapYearDate);
      expect(dueDateResult).toContain('2月29日');

      const localStringResult = toDateTimeLocalString(leapYearDate);
      expect(localStringResult).toBe('2024-02-29T12:00');
    });

    it('should handle year boundaries correctly', () => {
      const newYearEve = new Date(2024, 11, 31, 23, 59, 59); // December 31, 2024 23:59:59
      const newYearDay = new Date(2025, 0, 1, 0, 0, 0); // January 1, 2025 00:00:00

      expect(formatDate(newYearEve)).toContain('2024');
      expect(formatDate(newYearDay)).toContain('2025');
    });

    it('should handle very old and very future dates', () => {
      const oldDate = new Date('1900-01-01T00:00:00.000Z');
      const futureDate = new Date('2100-12-31T23:59:59.000Z');

      expect(() => formatDate(oldDate)).not.toThrow();
      expect(() => formatDate(futureDate)).not.toThrow();
      expect(() => toDateTimeLocalString(oldDate)).not.toThrow();
      expect(() => toDateTimeLocalString(futureDate)).not.toThrow();
    });

    it('should handle invalid Date objects gracefully', () => {
      const invalidDate = new Date('invalid');

      expect(() => formatDate(invalidDate)).not.toThrow();
      expect(() => toDateTimeLocalString(invalidDate)).not.toThrow();

      // Results should be consistent for invalid dates
      const formatResult = formatDate(invalidDate);
      const localStringResult = toDateTimeLocalString(invalidDate);

      expect(typeof formatResult).toBe('string');
      expect(typeof localStringResult).toBe('string');
    });
  });

  describe('Japanese locale formatting', () => {
    it('should use Japanese locale for date formatting', () => {
      const date = new Date('2025-01-15T14:30:00.000Z');

      const dueDateResult = formatDueDate(date);
      expect(dueDateResult).toContain('月');
      expect(dueDateResult).toContain('日');

      const yearResult = formatDueDateWithYear(date);
      expect(yearResult).toContain('年');
      expect(yearResult).toContain('月');
      expect(yearResult).toContain('日');
    });

    it('should include Japanese weekday abbreviations', () => {
      const monday = new Date('2025-01-13T12:00:00.000Z'); // Monday
      const sunday = new Date('2025-01-19T12:00:00.000Z'); // Sunday

      const mondayResult = formatDueDate(monday);
      const sundayResult = formatDueDate(sunday);

      // Should contain Japanese weekday characters
      expect(mondayResult).toMatch(/[月火水木金土日]/);
      expect(sundayResult).toMatch(/[月火水木金土日]/);
    });
  });
});
