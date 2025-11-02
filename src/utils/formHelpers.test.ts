/**
 * formHelpers utility tests
 * フォームヘルパー関数の包括的テスト
 */

import { describe, it, expect } from 'vitest';
import {
  toStringValue,
  isEmptyValue,
  shouldShowError,
  getValidationStatus,
} from './formHelpers';

describe('formHelpers', () => {
  describe('toStringValue', () => {
    it('should convert null to empty string', () => {
      expect(toStringValue(null)).toBe('');
    });

    it('should convert undefined to empty string', () => {
      expect(toStringValue(undefined)).toBe('');
    });

    it('should convert number to string', () => {
      expect(toStringValue(123)).toBe('123');
      expect(toStringValue(0)).toBe('0');
      expect(toStringValue(-456)).toBe('-456');
      expect(toStringValue(3.14)).toBe('3.14');
    });

    it('should convert boolean to string', () => {
      expect(toStringValue(true)).toBe('true');
      expect(toStringValue(false)).toBe('false');
    });

    it('should keep string as is', () => {
      expect(toStringValue('hello')).toBe('hello');
      expect(toStringValue('')).toBe('');
      expect(toStringValue('  spaces  ')).toBe('  spaces  ');
    });

    it('should convert object to string representation', () => {
      const obj = { key: 'value' };
      expect(toStringValue(obj)).toBe('[object Object]');
    });

    it('should convert array to string', () => {
      expect(toStringValue([1, 2, 3])).toBe('1,2,3');
      expect(toStringValue([])).toBe('');
    });

    it('should handle special number values', () => {
      expect(toStringValue(NaN)).toBe('NaN');
      expect(toStringValue(Infinity)).toBe('Infinity');
      expect(toStringValue(-Infinity)).toBe('-Infinity');
    });

    it('should convert Date to string', () => {
      const date = new Date('2025-01-01T00:00:00.000Z');
      const result = toStringValue(date);
      expect(typeof result).toBe('string');
      expect(result).toContain('2025');
    });

    it('should handle symbol type', () => {
      const sym = Symbol('test');
      const result = toStringValue(sym);
      expect(result).toBe('Symbol(test)');
    });
  });

  describe('isEmptyValue', () => {
    it('should return true for null', () => {
      expect(isEmptyValue(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isEmptyValue(undefined)).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(isEmptyValue('')).toBe(true);
    });

    it('should return true for whitespace-only string', () => {
      expect(isEmptyValue('   ')).toBe(true);
      expect(isEmptyValue('\t')).toBe(true);
      expect(isEmptyValue('\n')).toBe(true);
      expect(isEmptyValue('  \n\t  ')).toBe(true);
    });

    it('should return false for non-empty string', () => {
      expect(isEmptyValue('hello')).toBe(false);
      expect(isEmptyValue('  text  ')).toBe(false);
      expect(isEmptyValue('0')).toBe(false);
    });

    it('should return true for empty array', () => {
      expect(isEmptyValue([])).toBe(true);
    });

    it('should return false for non-empty array', () => {
      expect(isEmptyValue([1])).toBe(false);
      expect(isEmptyValue([1, 2, 3])).toBe(false);
      expect(isEmptyValue([''])).toBe(false); // Array with empty string is not empty
    });

    it('should return false for number values', () => {
      expect(isEmptyValue(0)).toBe(false);
      expect(isEmptyValue(123)).toBe(false);
      expect(isEmptyValue(-1)).toBe(false);
    });

    it('should return false for boolean values', () => {
      expect(isEmptyValue(true)).toBe(false);
      expect(isEmptyValue(false)).toBe(false);
    });

    it('should return false for object', () => {
      expect(isEmptyValue({})).toBe(false);
      expect(isEmptyValue({ key: 'value' })).toBe(false);
    });

    it('should return false for Date', () => {
      expect(isEmptyValue(new Date())).toBe(false);
    });

    it('should handle special cases', () => {
      expect(isEmptyValue(NaN)).toBe(false);
      expect(isEmptyValue(Infinity)).toBe(false);
    });
  });

  describe('shouldShowError', () => {
    it('should return true when touched is true and error exists', () => {
      expect(shouldShowError(true, 'Error message')).toBe(true);
    });

    it('should return false when touched is false', () => {
      expect(shouldShowError(false, 'Error message')).toBe(false);
    });

    it('should return false when error is null', () => {
      expect(shouldShowError(true, null)).toBe(false);
    });

    it('should return false when error is undefined', () => {
      expect(shouldShowError(true, undefined)).toBe(false);
    });

    it('should return false when error is empty string', () => {
      expect(shouldShowError(true, '')).toBe(false);
    });

    it('should return false when both touched and error are falsy', () => {
      expect(shouldShowError(false, null)).toBe(false);
      expect(shouldShowError(false, undefined)).toBe(false);
      expect(shouldShowError(undefined, null)).toBe(false);
    });

    it('should return false when touched is undefined', () => {
      expect(shouldShowError(undefined, 'Error message')).toBe(false);
    });

    it('should handle various truthy error values', () => {
      expect(shouldShowError(true, 'Required')).toBe(true);
      expect(shouldShowError(true, 'Invalid format')).toBe(true);
      expect(shouldShowError(true, 'Too long')).toBe(true);
    });
  });

  describe('getValidationStatus', () => {
    it('should return "error" when hasError is true', () => {
      expect(getValidationStatus(true)).toBe('_error');
    });

    it('should return undefined when hasError is false', () => {
      expect(getValidationStatus(false)).toBe(undefined);
    });

    it('should handle truthy values as error', () => {
      expect(getValidationStatus(true)).toBe('_error');
      expect(getValidationStatus(false)).toBe(undefined);
    });

    it('should return correct type', () => {
      const result = getValidationStatus(true);
      expect(typeof result === 'string' || result === undefined).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should work together for form validation flow', () => {
      const value = '  ';
      const touched = true;
      const error = isEmptyValue(value) ? 'Field is required' : null;

      expect(shouldShowError(touched, error)).toBe(true);
      expect(getValidationStatus(shouldShowError(touched, error))).toBe(
        '_error'
      );
    });

    it('should handle untouched field with error', () => {
      const touched = false;
      const error = 'Some validation error';

      expect(shouldShowError(touched, error)).toBe(false);
      expect(getValidationStatus(shouldShowError(touched, error))).toBe(
        undefined
      );
    });

    it('should handle valid field conversion', () => {
      const value = 123;
      const stringValue = toStringValue(value);
      const isEmpty = isEmptyValue(stringValue);

      expect(stringValue).toBe('123');
      expect(isEmpty).toBe(false);
    });
  });
});
