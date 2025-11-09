/**
 * Task Schema tests
 * タスク関連スキーマの包括的テスト
 */

import { describe, it, expect } from 'vitest';
import {
  prioritySchema,
  recurrencePatternSchema,
  labelSchema,
  subTaskSchema,
  fileAttachmentSchema,
  recurrenceConfigSchema,
  taskSchema,
  taskCreateInputSchema,
  taskUpdateInputSchema,
} from './task';

describe('Task Schemas', () => {
  describe('prioritySchema', () => {
    it('should accept valid priority values', () => {
      expect(prioritySchema.parse('low')).toBe('low');
      expect(prioritySchema.parse('medium')).toBe('medium');
      expect(prioritySchema.parse('high')).toBe('high');
      expect(prioritySchema.parse('critical')).toBe('critical');
    });

    it('should reject invalid priority values', () => {
      expect(() => prioritySchema.parse('invalid')).toThrow();
      expect(() => prioritySchema.parse('')).toThrow();
      expect(() => prioritySchema.parse(null)).toThrow();
    });
  });

  describe('recurrencePatternSchema', () => {
    it('should accept valid recurrence patterns', () => {
      expect(recurrencePatternSchema.parse('daily')).toBe('daily');
      expect(recurrencePatternSchema.parse('weekly')).toBe('weekly');
      expect(recurrencePatternSchema.parse('monthly')).toBe('monthly');
      expect(recurrencePatternSchema.parse('yearly')).toBe('yearly');
    });

    it('should reject invalid recurrence patterns', () => {
      expect(() => recurrencePatternSchema.parse('hourly')).toThrow();
      expect(() => recurrencePatternSchema.parse('')).toThrow();
    });
  });

  describe('labelSchema', () => {
    const validLabel = {
      id: 'label-1',
      name: 'Test Label',
      color: '#FF0000',
    };

    it('should accept valid label', () => {
      const result = labelSchema.parse(validLabel);
      expect(result).toEqual(validLabel);
    });

    it('should reject label with missing id', () => {
      expect(() => labelSchema.parse({ ...validLabel, id: '' })).toThrow();
    });

    it('should reject label with missing name', () => {
      expect(() => labelSchema.parse({ ...validLabel, name: '' })).toThrow();
    });

    it('should reject label with name too long', () => {
      expect(() =>
        labelSchema.parse({ ...validLabel, name: 'a'.repeat(51) })
      ).toThrow();
    });

    it('should reject label with invalid color format', () => {
      expect(() =>
        labelSchema.parse({ ...validLabel, color: 'red' })
      ).toThrow();
      expect(() =>
        labelSchema.parse({ ...validLabel, color: '#FF' })
      ).toThrow();
      expect(() =>
        labelSchema.parse({ ...validLabel, color: '#GGGGGG' })
      ).toThrow();
    });

    it('should accept valid hex color codes', () => {
      const validColors = ['#000000', '#FFFFFF', '#ff00AA', '#123abc'];
      validColors.forEach(color => {
        expect(() => labelSchema.parse({ ...validLabel, color })).not.toThrow();
      });
    });
  });

  describe('subTaskSchema', () => {
    const validSubTask = {
      id: 'subtask-1',
      title: 'Test SubTask',
      completed: false,
      createdAt: new Date().toISOString(),
    };

    it('should accept valid subtask', () => {
      const result = subTaskSchema.parse(validSubTask);
      expect(result).toEqual(validSubTask);
    });

    it('should reject subtask with missing id', () => {
      expect(() => subTaskSchema.parse({ ...validSubTask, id: '' })).toThrow();
    });

    it('should reject subtask with missing title', () => {
      expect(() =>
        subTaskSchema.parse({ ...validSubTask, title: '' })
      ).toThrow();
    });

    it('should reject subtask with title too long', () => {
      expect(() =>
        subTaskSchema.parse({ ...validSubTask, title: 'a'.repeat(201) })
      ).toThrow();
    });

    it('should accept both completed states', () => {
      expect(() =>
        subTaskSchema.parse({ ...validSubTask, completed: true })
      ).not.toThrow();
      expect(() =>
        subTaskSchema.parse({ ...validSubTask, completed: false })
      ).not.toThrow();
    });
  });

  describe('fileAttachmentSchema', () => {
    const validFile = {
      id: 'file-1',
      name: 'test.pdf',
      type: 'application/pdf',
      size: 1024 * 1024, // 1MB
      data: 'base64encodeddata',
      uploadedAt: new Date().toISOString(),
    };

    it('should accept valid file attachment', () => {
      const result = fileAttachmentSchema.parse(validFile);
      expect(result).toEqual(validFile);
    });

    it('should reject file with missing required fields', () => {
      expect(() =>
        fileAttachmentSchema.parse({ ...validFile, id: '' })
      ).toThrow();
      expect(() =>
        fileAttachmentSchema.parse({ ...validFile, name: '' })
      ).toThrow();
      expect(() =>
        fileAttachmentSchema.parse({ ...validFile, type: '' })
      ).toThrow();
      expect(() =>
        fileAttachmentSchema.parse({ ...validFile, data: '' })
      ).toThrow();
    });

    it('should reject file with name too long', () => {
      expect(() =>
        fileAttachmentSchema.parse({ ...validFile, name: 'a'.repeat(256) })
      ).toThrow();
    });

    it('should reject file with negative size', () => {
      expect(() =>
        fileAttachmentSchema.parse({ ...validFile, size: -1 })
      ).toThrow();
    });

    it('should reject file exceeding 5MB limit', () => {
      expect(() =>
        fileAttachmentSchema.parse({
          ...validFile,
          size: 6 * 1024 * 1024,
        })
      ).toThrow();
    });

    it('should accept file at exactly 5MB', () => {
      expect(() =>
        fileAttachmentSchema.parse({
          ...validFile,
          size: 5 * 1024 * 1024,
        })
      ).not.toThrow();
    });
  });

  describe('recurrenceConfigSchema', () => {
    const validDailyRecurrence = {
      enabled: true,
      pattern: 'daily' as const,
      interval: 1,
    };

    const validWeeklyRecurrence = {
      enabled: true,
      pattern: 'weekly' as const,
      interval: 1,
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    };

    it('should accept valid daily recurrence', () => {
      const result = recurrenceConfigSchema.parse(validDailyRecurrence);
      expect(result).toEqual(validDailyRecurrence);
    });

    it('should accept valid weekly recurrence', () => {
      const result = recurrenceConfigSchema.parse(validWeeklyRecurrence);
      expect(result).toEqual(validWeeklyRecurrence);
    });

    it('should reject interval less than 1', () => {
      expect(() =>
        recurrenceConfigSchema.parse({ ...validDailyRecurrence, interval: 0 })
      ).toThrow();
    });

    it('should reject interval greater than 365', () => {
      expect(() =>
        recurrenceConfigSchema.parse({ ...validDailyRecurrence, interval: 366 })
      ).toThrow();
    });

    it('should reject weekly recurrence without daysOfWeek', () => {
      expect(() =>
        recurrenceConfigSchema.parse({
          enabled: true,
          pattern: 'weekly' as const,
          interval: 1,
          daysOfWeek: [],
        })
      ).toThrow();
    });

    it('should accept monthly recurrence with dayOfMonth', () => {
      expect(() =>
        recurrenceConfigSchema.parse({
          enabled: true,
          pattern: 'monthly' as const,
          interval: 1,
          dayOfMonth: 15,
        })
      ).not.toThrow();
    });

    it('should accept recurrence with endDate', () => {
      expect(() =>
        recurrenceConfigSchema.parse({
          ...validDailyRecurrence,
          endDate: new Date('2025-12-31').toISOString(),
        })
      ).not.toThrow();
    });

    it('should accept recurrence with maxOccurrences', () => {
      expect(() =>
        recurrenceConfigSchema.parse({
          ...validDailyRecurrence,
          maxOccurrences: 10,
        })
      ).not.toThrow();
    });
  });

  describe('taskSchema', () => {
    const validTask = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test description',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: null,
      completedAt: null,
      priority: 'medium' as const,
      labels: [],
      subTasks: [],
      files: [],
    };

    it('should accept valid task', () => {
      const result = taskSchema.parse(validTask);
      expect(result.id).toBe('task-1');
      expect(result.title).toBe('Test Task');
    });

    it('should reject task with missing id', () => {
      expect(() => taskSchema.parse({ ...validTask, id: '' })).toThrow();
    });

    it('should reject task with missing title', () => {
      expect(() => taskSchema.parse({ ...validTask, title: '' })).toThrow();
    });

    it('should reject task with title too long', () => {
      expect(() =>
        taskSchema.parse({ ...validTask, title: 'a'.repeat(201) })
      ).toThrow();
    });

    it('should reject task with description too long', () => {
      expect(() =>
        taskSchema.parse({ ...validTask, description: 'a'.repeat(5001) })
      ).toThrow();
    });

    it('should accept task with valid labels', () => {
      expect(() =>
        taskSchema.parse({
          ...validTask,
          labels: [
            { id: 'label-1', name: 'Bug', color: '#FF0000' },
            { id: 'label-2', name: 'Feature', color: '#00FF00' },
          ],
        })
      ).not.toThrow();
    });

    it('should accept task with subtasks', () => {
      expect(() =>
        taskSchema.parse({
          ...validTask,
          subTasks: [
            {
              id: 'sub-1',
              title: 'Subtask 1',
              completed: false,
              createdAt: new Date().toISOString(),
            },
          ],
        })
      ).not.toThrow();
    });

    it('should accept task with files', () => {
      expect(() =>
        taskSchema.parse({
          ...validTask,
          files: [
            {
              id: 'file-1',
              name: 'document.pdf',
              type: 'application/pdf',
              size: 1024,
              data: 'base64data',
              uploadedAt: new Date().toISOString(),
            },
          ],
        })
      ).not.toThrow();
    });

    it('should accept task with recurrence', () => {
      expect(() =>
        taskSchema.parse({
          ...validTask,
          recurrence: {
            enabled: true,
            pattern: 'weekly' as const,
            interval: 1,
            daysOfWeek: [1, 3],
          },
        })
      ).not.toThrow();
    });

    it('should accept task with deletion state', () => {
      expect(() =>
        taskSchema.parse({
          ...validTask,
          deletionState: 'deleted' as const,
          deletedAt: new Date().toISOString(),
        })
      ).not.toThrow();
    });
  });

  describe('taskCreateInputSchema', () => {
    it('should accept minimal task creation input', () => {
      const input = {
        title: 'New Task',
      };
      const result = taskCreateInputSchema.parse(input);
      expect(result.title).toBe('New Task');
    });

    it('should accept full task creation input', () => {
      const input = {
        title: 'New Task',
        description: 'Task description',
        dueDate: new Date().toISOString(),
        priority: 'high' as const,
        labels: [{ id: 'label-1', name: 'Bug', color: '#FF0000' }],
        files: [],
        recurrence: {
          enabled: true,
          pattern: 'daily' as const,
          interval: 1,
        },
      };
      expect(() => taskCreateInputSchema.parse(input)).not.toThrow();
    });

    it('should reject creation input with missing title', () => {
      expect(() =>
        taskCreateInputSchema.parse({ description: 'No title' })
      ).toThrow();
    });

    it('should reject creation input with title too long', () => {
      expect(() =>
        taskCreateInputSchema.parse({ title: 'a'.repeat(201) })
      ).toThrow();
    });
  });

  describe('taskUpdateInputSchema', () => {
    it('should require id field', () => {
      expect(() =>
        taskUpdateInputSchema.parse({ title: 'Updated Title' })
      ).toThrow();
    });

    it('should accept partial update with id', () => {
      const update = {
        id: 'task-1',
        title: 'Updated Title',
      };
      const result = taskUpdateInputSchema.parse(update);
      expect(result.id).toBe('task-1');
      expect(result.title).toBe('Updated Title');
    });

    it('should accept full update', () => {
      const update = {
        id: 'task-1',
        title: 'Updated Title',
        description: 'Updated description',
        priority: 'critical' as const,
        completedAt: new Date().toISOString(),
      };
      expect(() => taskUpdateInputSchema.parse(update)).not.toThrow();
    });

    it('should validate updated fields correctly', () => {
      expect(() =>
        taskUpdateInputSchema.parse({
          id: 'task-1',
          title: 'a'.repeat(201), // Too long
        })
      ).toThrow();
    });
  });
});
