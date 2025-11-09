import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  validateData,
  validateDataOrThrow,
  getValidationErrors,
  getFieldErrors,
  validatePartial,
  validateArray,
  validateDataAsync,
  safeParse,
  formatValidationErrors,
  getNestedFieldErrors,
} from './validation-utils';

describe('validation-utils', () => {
  // Test schemas
  const userSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    age: z.number().min(0, 'Age must be positive'),
  });

  const nestedSchema = z.object({
    user: z.object({
      profile: z.object({
        bio: z.string().min(10, 'Bio must be at least 10 characters'),
      }),
    }),
  });

  describe('validateData', () => {
    it('should return success for valid data', () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 };
      const result = validateData(userSchema, data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
        expect(result.errors).toBeNull();
      }
    });

    it('should return errors for invalid data', () => {
      const data = { name: '', email: 'invalid', age: -5 };
      const result = validateData(userSchema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.data).toBeNull();
        expect(result.errors).toBeInstanceOf(Array);
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('should include field path in error messages', () => {
      const data = { name: '', email: 'invalid', age: -5 };
      const result = validateData(userSchema, data);

      if (!result.success) {
        expect(result.errors.some(err => err.includes('name:'))).toBe(true);
        expect(result.errors.some(err => err.includes('email:'))).toBe(true);
        expect(result.errors.some(err => err.includes('age:'))).toBe(true);
      }
    });

    it('should handle missing required fields', () => {
      const data = {};
      const result = validateData(userSchema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBe(3); // name, email, age
      }
    });

    it('should work with primitive schemas', () => {
      const stringSchema = z.string();
      const result = validateData(stringSchema, 'test');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test');
      }
    });
  });

  describe('validateDataOrThrow', () => {
    it('should return data for valid input', () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 };
      const result = validateDataOrThrow(userSchema, data);

      expect(result).toEqual(data);
    });

    it('should throw error for invalid data', () => {
      const data = { name: '', email: 'invalid', age: -5 };

      expect(() => validateDataOrThrow(userSchema, data)).toThrow(
        'バリデーションエラー:'
      );
    });

    it('should include detailed error messages', () => {
      const data = { name: '', email: 'invalid', age: -5 };

      try {
        validateDataOrThrow(userSchema, data);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain('バリデーションエラー:');
        expect(message).toContain('name:');
        expect(message).toContain('email:');
      }
    });
  });

  describe('getValidationErrors', () => {
    it('should return empty array for valid data', () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 };
      const errors = getValidationErrors(userSchema, data);

      expect(errors).toEqual([]);
    });

    it('should return error messages for invalid data', () => {
      const data = { name: '', email: 'invalid', age: -5 };
      const errors = getValidationErrors(userSchema, data);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.includes('name:'))).toBe(true);
    });

    it('should format errors with field path', () => {
      const data = { name: '', email: 'john@example.com', age: 30 };
      const errors = getValidationErrors(userSchema, data);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatch(/name:/);
    });
  });

  describe('getFieldErrors', () => {
    it('should return empty object for valid data', () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 };
      const errors = getFieldErrors(userSchema, data);

      expect(errors).toEqual({});
    });

    it('should return field-specific errors', () => {
      const data = { name: '', email: 'invalid', age: -5 };
      const errors = getFieldErrors(userSchema, data);

      expect(errors).toHaveProperty('name');
      expect(errors).toHaveProperty('email');
      expect(errors).toHaveProperty('age');
    });

    it('should use field path as key', () => {
      const data = { name: '', email: 'john@example.com', age: 30 };
      const errors = getFieldErrors(userSchema, data);

      expect(errors['name']).toBeTruthy();
      expect(typeof errors['name']).toBe('string');
    });

    it('should not duplicate errors for same field', () => {
      const data = { name: '', email: 'invalid', age: -5 };
      const errors = getFieldErrors(userSchema, data);

      Object.values(errors).forEach(error => {
        expect(typeof error).toBe('string');
      });
    });
  });

  describe('validatePartial', () => {
    it('should validate partial data successfully', () => {
      const partial = { name: 'John' };
      const result = validatePartial(userSchema, partial);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('name', 'John');
      }
    });

    it('should allow missing fields', () => {
      const partial = {};
      const result = validatePartial(userSchema, partial);

      expect(result.success).toBe(true);
    });

    it('should still validate provided fields', () => {
      const partial = { email: 'invalid' };
      const result = validatePartial(userSchema, partial);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(err => err.includes('email:'))).toBe(true);
      }
    });

    it('should work with multiple fields', () => {
      const partial = { name: 'Jane', age: 25 };
      const result = validatePartial(userSchema, partial);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Jane');
        expect(result.data.age).toBe(25);
      }
    });
  });

  describe('validateArray', () => {
    it('should validate array of valid items', () => {
      const items = [
        { name: 'John', email: 'john@example.com', age: 30 },
        { name: 'Jane', email: 'jane@example.com', age: 25 },
      ];
      const result = validateArray(userSchema, items);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(items);
      }
    });

    it('should fail for invalid array items', () => {
      const items = [
        { name: 'John', email: 'john@example.com', age: 30 },
        { name: '', email: 'invalid', age: -5 },
      ];
      const result = validateArray(userSchema, items);

      expect(result.success).toBe(false);
    });

    it('should validate empty array', () => {
      const result = validateArray(userSchema, []);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it('should include array index in error path', () => {
      const items = [
        { name: 'John', email: 'john@example.com', age: 30 },
        { name: '', email: 'invalid', age: -5 },
      ];
      const result = validateArray(userSchema, items);

      if (!result.success) {
        expect(result.errors.some(err => err.includes('1.'))).toBe(true);
      }
    });
  });

  describe('validateDataAsync', () => {
    it('should validate data asynchronously', async () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 };
      const result = await validateDataAsync(userSchema, data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should return errors for invalid data', async () => {
      const data = { name: '', email: 'invalid', age: -5 };
      const result = await validateDataAsync(userSchema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('should handle async schema validation', async () => {
      const asyncSchema = z.string().refine(async val => val.length > 5, {
        message: 'String must be longer than 5 characters',
      });

      const result = await validateDataAsync(asyncSchema, 'test');
      expect(result.success).toBe(false);

      const result2 = await validateDataAsync(asyncSchema, 'testing');
      expect(result2.success).toBe(true);
    });
  });

  describe('safeParse', () => {
    it('should return data for valid input', () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 };
      const result = safeParse(userSchema, data);

      expect(result).toEqual(data);
    });

    it('should return null for invalid input', () => {
      const data = { name: '', email: 'invalid', age: -5 };
      const result = safeParse(userSchema, data);

      expect(result).toBeNull();
    });

    it('should work with primitive types', () => {
      const numberSchema = z.number();
      expect(safeParse(numberSchema, 42)).toBe(42);
      expect(safeParse(numberSchema, 'not a number')).toBeNull();
    });

    it('should handle complex nested objects', () => {
      const data = {
        user: { profile: { bio: 'This is a long enough bio' } },
      };
      const result = safeParse(nestedSchema, data);

      expect(result).toEqual(data);
    });
  });

  describe('formatValidationErrors', () => {
    it('should return empty string for no errors', () => {
      const formatted = formatValidationErrors([]);
      expect(formatted).toBe('');
    });

    it('should return single error as-is', () => {
      const errors = ['name: Name is required'];
      const formatted = formatValidationErrors(errors);

      expect(formatted).toBe('name: Name is required');
    });

    it('should format multiple errors with numbering', () => {
      const errors = [
        'name: Name is required',
        'email: Invalid email',
        'age: Age must be positive',
      ];
      const formatted = formatValidationErrors(errors);

      expect(formatted).toContain('1. name: Name is required');
      expect(formatted).toContain('2. email: Invalid email');
      expect(formatted).toContain('3. age: Age must be positive');
    });

    it('should use newlines to separate errors', () => {
      const errors = ['error1', 'error2', 'error3'];
      const formatted = formatValidationErrors(errors);

      expect(formatted.split('\n')).toHaveLength(3);
    });
  });

  describe('getNestedFieldErrors', () => {
    it('should return empty object for valid data', () => {
      const data = {
        user: { profile: { bio: 'This is a long enough bio' } },
      };
      const errors = getNestedFieldErrors(nestedSchema, data);

      expect(errors).toEqual({});
    });

    it('should return nested field errors with full path', () => {
      const data = { user: { profile: { bio: 'short' } } };
      const errors = getNestedFieldErrors(nestedSchema, data);

      expect(errors).toHaveProperty('user.profile.bio');
      expect(errors['user.profile.bio']).toBeInstanceOf(Array);
      expect(errors['user.profile.bio'].length).toBeGreaterThan(0);
    });

    it('should handle multiple errors for same field', () => {
      const multiErrorSchema = z.object({
        password: z
          .string()
          .min(8, 'Too short')
          .regex(/[A-Z]/, 'Must have uppercase')
          .regex(/[0-9]/, 'Must have number'),
      });

      const data = { password: 'abc' };
      const errors = getNestedFieldErrors(multiErrorSchema, data);

      expect(errors['password']).toBeInstanceOf(Array);
      expect(errors['password'].length).toBeGreaterThan(1);
    });

    it('should handle errors at different nesting levels', () => {
      const complexSchema = z.object({
        name: z.string().min(1),
        user: z.object({
          email: z.string().email(),
          profile: z.object({
            bio: z.string().min(10),
          }),
        }),
      });

      const data = {
        name: '',
        user: { email: 'invalid', profile: { bio: 'short' } },
      };
      const errors = getNestedFieldErrors(complexSchema, data);

      expect(errors).toHaveProperty('name');
      expect(errors).toHaveProperty('user.email');
      expect(errors).toHaveProperty('user.profile.bio');
    });
  });

  describe('Edge cases and complex scenarios', () => {
    it('should handle union types', () => {
      const unionSchema = z.union([z.string(), z.number()]);

      expect(safeParse(unionSchema, 'test')).toBe('test');
      expect(safeParse(unionSchema, 42)).toBe(42);
      expect(safeParse(unionSchema, true)).toBeNull();
    });

    it('should handle optional fields', () => {
      const optionalSchema = z.object({
        name: z.string(),
        email: z.string().email().optional(),
      });

      const result1 = validateData(optionalSchema, { name: 'John' });
      expect(result1.success).toBe(true);

      const result2 = validateData(optionalSchema, {
        name: 'John',
        email: 'john@example.com',
      });
      expect(result2.success).toBe(true);
    });

    it('should handle default values', () => {
      const schemaWithDefault = z.object({
        name: z.string(),
        role: z.string().default('user'),
      });

      const data = { name: 'John' };
      const result = safeParse(schemaWithDefault, data);

      expect(result).toEqual({ name: 'John', role: 'user' });
    });

    it('should handle transform schemas', () => {
      const transformSchema = z.string().transform(val => val.toUpperCase());

      const result = safeParse(transformSchema, 'hello');
      expect(result).toBe('HELLO');
    });

    it('should handle deeply nested objects', () => {
      const deepSchema = z.object({
        level1: z.object({
          level2: z.object({
            level3: z.object({
              value: z.string().min(1),
            }),
          }),
        }),
      });

      const validData = {
        level1: { level2: { level3: { value: 'test' } } },
      };
      expect(safeParse(deepSchema, validData)).toEqual(validData);

      const invalidData = {
        level1: { level2: { level3: { value: '' } } },
      };
      expect(safeParse(deepSchema, invalidData)).toBeNull();
    });

    it('should handle arrays of nested objects', () => {
      const arrayOfObjectsSchema = z.array(
        z.object({
          id: z.number(),
          data: z.object({
            value: z.string(),
          }),
        })
      );

      const data = [
        { id: 1, data: { value: 'test1' } },
        { id: 2, data: { value: 'test2' } },
      ];

      const result = safeParse(arrayOfObjectsSchema, data);
      expect(result).toEqual(data);
    });
  });
});
