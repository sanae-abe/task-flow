/**
 * Calendar Recurrence utility functions tests
 * カレンダー繰り返し機能の包括的テスト
 */

import { describe, it, expect, vi } from 'vitest';
import {
  generateRecurringTaskInstances,
  generateCalendarTasks,
  getTasksForDate,
  isVirtualTask,
  getCalendarDateRange,
  type VirtualRecurringTask,
} from './calendarRecurrence';
import type { Task, RecurrenceConfig } from '../types';

// Mock recurrence utilities
vi.mock('./recurrence', () => ({
  calculateNextDueDate: vi.fn(
    (currentDate: string, config: RecurrenceConfig) => {
      // Simple mock: add 7 days for weekly recurrence
      if (config.frequency === 'weekly') {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + 7);
        return date.toISOString();
      }
      if (config.frequency === 'daily') {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + 1);
        return date.toISOString();
      }
      return null;
    }
  ),
  isRecurrenceComplete: vi.fn(
    (config: RecurrenceConfig, occurrenceCount: number) => {
      if (config.endAfterOccurrences) {
        return occurrenceCount > config.endAfterOccurrences;
      }
      return false;
    }
  ),
}));

describe('Calendar Recurrence Utils', () => {
  describe('generateRecurringTaskInstances', () => {
    it('should return empty array for task without recurrence', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Test Task',
        dueDate: '2024-01-01T10:00:00Z',
        recurrence: { enabled: false },
      } as Task;

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const instances = generateRecurringTaskInstances(
        task,
        startDate,
        endDate
      );
      expect(instances).toHaveLength(0);
    });

    it('should return empty array for task without dueDate', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Test Task',
        recurrence: { enabled: true, frequency: 'weekly' },
      } as Task;

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const instances = generateRecurringTaskInstances(
        task,
        startDate,
        endDate
      );
      expect(instances).toHaveLength(0);
    });

    it('should generate weekly recurring instances', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Weekly Task',
        description: 'Test Description',
        dueDate: '2024-01-01T10:00:00Z',
        priority: 'medium',
        labels: [],
        occurrenceCount: 1,
        recurrence: {
          enabled: true,
          frequency: 'weekly',
        },
      } as Task;

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const instances = generateRecurringTaskInstances(
        task,
        startDate,
        endDate
      );

      expect(instances.length).toBeGreaterThan(0);
      instances.forEach((instance, index) => {
        expect(instance.id).toBe(`task-1-virtual-${index + 2}`);
        expect(instance.originalTaskId).toBe('task-1');
        expect(instance.isVirtual).toBe(true);
        expect(instance.title).toBe('Weekly Task');
      });
    });

    it('should respect maxInstances limit', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Daily Task',
        dueDate: '2024-01-01T10:00:00Z',
        recurrence: {
          enabled: true,
          frequency: 'daily',
        },
      } as Task;

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31'); // 365 days

      const instances = generateRecurringTaskInstances(
        task,
        startDate,
        endDate,
        10
      );

      expect(instances.length).toBeLessThanOrEqual(10);
    });

    it('should respect endAfterOccurrences', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Limited Task',
        dueDate: '2024-01-01T10:00:00Z',
        occurrenceCount: 1,
        recurrence: {
          enabled: true,
          frequency: 'weekly',
          endAfterOccurrences: 5,
        },
      } as Task;

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const instances = generateRecurringTaskInstances(
        task,
        startDate,
        endDate
      );

      // Should generate at most 4 more instances (since occurrenceCount starts at 1)
      expect(instances.length).toBeLessThanOrEqual(4);
    });

    it('should stop at endDate', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Test Task',
        dueDate: '2024-01-01T10:00:00Z',
        recurrence: {
          enabled: true,
          frequency: 'weekly',
        },
      } as Task;

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-15');

      const instances = generateRecurringTaskInstances(
        task,
        startDate,
        endDate
      );

      instances.forEach(instance => {
        expect(new Date(instance.dueDate).getTime()).toBeLessThanOrEqual(
          endDate.getTime()
        );
      });
    });
  });

  describe('generateCalendarTasks', () => {
    it('should include actual tasks', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          dueDate: '2024-01-15T10:00:00Z',
        } as Task,
        {
          id: 'task-2',
          title: 'Task 2',
          dueDate: '2024-01-20T10:00:00Z',
        } as Task,
      ];

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const calendarTasks = generateCalendarTasks(tasks, startDate, endDate);

      expect(calendarTasks.length).toBeGreaterThanOrEqual(2);
      expect(calendarTasks).toContainEqual(tasks[0]);
      expect(calendarTasks).toContainEqual(tasks[1]);
    });

    it('should include virtual recurring instances', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Recurring Task',
          dueDate: '2024-01-01T10:00:00Z',
          recurrence: {
            enabled: true,
            frequency: 'weekly',
          },
        } as Task,
      ];

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const calendarTasks = generateCalendarTasks(tasks, startDate, endDate);

      const virtualTasks = calendarTasks.filter(
        task => 'isVirtual' in task && task.isVirtual
      );
      expect(virtualTasks.length).toBeGreaterThan(0);
    });

    it('should not duplicate tasks with same date', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Recurring Task',
          dueDate: '2024-01-01T10:00:00Z',
          recurrence: {
            enabled: true,
            frequency: 'weekly',
          },
        } as Task,
        {
          id: 'task-1',
          title: 'Same Task',
          dueDate: '2024-01-08T10:00:00Z',
        } as Task,
      ];

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const calendarTasks = generateCalendarTasks(tasks, startDate, endDate);

      // Should not have virtual task for Jan 8 since actual task exists
      const jan8Tasks = calendarTasks.filter(task => {
        const taskDate = new Date(task.dueDate!).toDateString();
        const targetDate = new Date('2024-01-08').toDateString();
        return taskDate === targetDate && 'isVirtual' in task;
      });

      expect(jan8Tasks.length).toBe(0);
    });

    it('should exclude completed recurring tasks', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Completed Recurring Task',
          dueDate: '2024-01-01T10:00:00Z',
          completedAt: '2024-01-01T12:00:00Z',
          recurrence: {
            enabled: true,
            frequency: 'weekly',
          },
        } as Task,
      ];

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const calendarTasks = generateCalendarTasks(tasks, startDate, endDate);

      const virtualTasks = calendarTasks.filter(
        task => 'isVirtual' in task && task.isVirtual
      );
      expect(virtualTasks.length).toBe(0);
    });
  });

  describe('getTasksForDate', () => {
    it('should filter tasks by date', () => {
      const tasks: (Task | VirtualRecurringTask)[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          dueDate: '2024-01-15T10:00:00Z',
        } as Task,
        {
          id: 'task-2',
          title: 'Task 2',
          dueDate: '2024-01-20T10:00:00Z',
        } as Task,
        {
          id: 'task-3',
          title: 'Task 3',
          dueDate: '2024-01-15T15:00:00Z',
        } as Task,
      ];

      const targetDate = new Date('2024-01-15');
      const filteredTasks = getTasksForDate(tasks, targetDate);

      expect(filteredTasks).toHaveLength(2);
      expect(filteredTasks[0].id).toBe('task-1');
      expect(filteredTasks[1].id).toBe('task-3');
    });

    it('should exclude tasks without dueDate', () => {
      const tasks: (Task | VirtualRecurringTask)[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          dueDate: '2024-01-15T10:00:00Z',
        } as Task,
        {
          id: 'task-2',
          title: 'Task 2',
          dueDate: null,
        } as Task,
      ];

      const targetDate = new Date('2024-01-15');
      const filteredTasks = getTasksForDate(tasks, targetDate);

      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0].id).toBe('task-1');
    });

    it('should work with virtual tasks', () => {
      const tasks: (Task | VirtualRecurringTask)[] = [
        {
          id: 'task-1-virtual-2',
          originalTaskId: 'task-1',
          title: 'Virtual Task',
          description: '',
          dueDate: '2024-01-15T10:00:00Z',
          isVirtual: true,
          priority: 'medium',
          labels: [],
          occurrenceCount: 2,
          recurrence: { enabled: true, frequency: 'weekly' },
        },
      ];

      const targetDate = new Date('2024-01-15');
      const filteredTasks = getTasksForDate(tasks, targetDate);

      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0].id).toBe('task-1-virtual-2');
    });
  });

  describe('isVirtualTask', () => {
    it('should identify virtual tasks', () => {
      const virtualTask: VirtualRecurringTask = {
        id: 'task-1-virtual-2',
        originalTaskId: 'task-1',
        title: 'Virtual Task',
        description: '',
        dueDate: '2024-01-15T10:00:00Z',
        isVirtual: true,
        priority: 'medium',
        labels: [],
        occurrenceCount: 2,
        recurrence: { enabled: true, frequency: 'weekly' },
      };

      expect(isVirtualTask(virtualTask)).toBe(true);
    });

    it('should identify actual tasks', () => {
      const actualTask: Task = {
        id: 'task-1',
        title: 'Actual Task',
        dueDate: '2024-01-15T10:00:00Z',
      } as Task;

      expect(isVirtualTask(actualTask)).toBe(false);
    });
  });

  describe('getCalendarDateRange', () => {
    it('should calculate date range for current month', () => {
      const currentDate = new Date('2024-01-15');
      const { startDate, endDate } = getCalendarDateRange(currentDate);

      // Start date should be 1st of previous month
      expect(startDate.getMonth()).toBe(11); // December (0-indexed)
      expect(startDate.getDate()).toBe(1);

      // End date should be last day of next month
      expect(endDate.getMonth()).toBe(1); // February (0-indexed)
    });

    it('should handle year boundaries', () => {
      const currentDate = new Date('2024-01-01');
      const { startDate, endDate } = getCalendarDateRange(currentDate);

      // Start date should be in previous year
      expect(startDate.getFullYear()).toBe(2023);
      expect(startDate.getMonth()).toBe(11); // December

      // End date should be in current year
      expect(endDate.getFullYear()).toBe(2024);
    });

    it('should calculate correct range for different months', () => {
      const currentDate = new Date('2024-06-15');
      const { startDate, endDate } = getCalendarDateRange(currentDate);

      expect(startDate.getMonth()).toBe(4); // May (0-indexed)
      expect(startDate.getDate()).toBe(1);
      expect(endDate.getMonth()).toBe(6); // July (0-indexed) - last day of next month
    });
  });
});
