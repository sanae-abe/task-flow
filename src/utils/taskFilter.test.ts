/**
 * Task filter utility functions tests
 * タスクフィルター機能の包括的テスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  filterTasks,
  getFilteredTaskCount,
  isFilterActive,
} from './taskFilter';
import type { Task, TaskFilter, Priority } from '../types';

describe('TaskFilter Utils', () => {
  let mockDate: Date;

  beforeEach(() => {
    // Fix the current date to 2025-01-15 12:00:00 in local timezone for consistent testing
    mockDate = new Date(2025, 0, 15, 12, 0, 0); // January 15, 2025 12:00:00
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper function to create mock tasks
  const createMockTask = (
    id = 'task-1',
    title = 'Test Task',
    dueDate?: Date | string,
    priority?: Priority,
    labels: Array<{ id: string; name: string; color: string }> = [],
    deletionState?: 'deleted' | 'marked_for_deletion'
  ): Task => ({
    id,
    title,
    description: 'Test Description',
    status: 'todo',
    priority,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    labels,
    subTasks: [],
    files: [],
    dueDate: dueDate
      ? typeof dueDate === 'string'
        ? dueDate
        : dueDate.toISOString()
      : undefined,
    deletionState,
  });

  // Helper function to create mock filter
  const createMockFilter = (
    type: TaskFilter['type'],
    selectedLabels?: string[],
    selectedLabelNames?: string[],
    selectedPriorities?: Priority[]
  ): TaskFilter => ({
    type,
    label: '',
    selectedLabels,
    selectedLabelNames,
    selectedPriorities,
  });

  describe('filterTasks', () => {
    describe('Basic filtering and deleted task exclusion', () => {
      it('should filter out deleted tasks from all results', () => {
        const tasks = [
          createMockTask('task-1', 'Active Task'),
          createMockTask(
            'task-2',
            'Deleted Task',
            undefined,
            undefined,
            [],
            'deleted'
          ),
          createMockTask(
            'task-3',
            'Marked for Deletion',
            undefined,
            undefined,
            [],
            'marked_for_deletion'
          ),
          createMockTask('task-4', 'Another Active Task'),
        ];

        const filter = createMockFilter('all');
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(3);
        expect(result.every(task => task.deletionState !== 'deleted')).toBe(
          true
        );
        expect(result.map(task => task.id)).toEqual([
          'task-1',
          'task-3',
          'task-4',
        ]);
      });

      it('should return all active tasks when filter type is "all"', () => {
        const tasks = [
          createMockTask('task-1', 'Task 1'),
          createMockTask('task-2', 'Task 2'),
          createMockTask('task-3', 'Task 3'),
        ];

        const filter = createMockFilter('all');
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(3);
        expect(result).toEqual(tasks);
      });
    });

    describe('Date-based filtering', () => {
      it('should filter tasks due within 3 days', () => {
        const tasks = [
          createMockTask('task-1', 'Due Today', new Date(2025, 0, 15)), // Today (Jan 15)
          createMockTask('task-2', 'Due Tomorrow', new Date(2025, 0, 16)), // Tomorrow (Jan 16)
          createMockTask('task-3', 'Due in 2 days', new Date(2025, 0, 17)), // Jan 17
          createMockTask('task-4', 'Due in 3 days', new Date(2025, 0, 18)), // Jan 18 (exactly 3 days)
          createMockTask('task-5', 'Due in 4 days', new Date(2025, 0, 19)), // Jan 19 (beyond 3 days)
          createMockTask('task-6', 'Due Yesterday', new Date(2025, 0, 14)), // Yesterday (not included)
          createMockTask('task-7', 'No Due Date'),
        ];

        const filter = createMockFilter('due-within-3-days');
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(4);
        expect(result.map(task => task.id)).toEqual([
          'task-1',
          'task-2',
          'task-3',
          'task-4',
        ]);
      });

      it('should filter tasks due today', () => {
        const tasks = [
          createMockTask(
            'task-1',
            'Due Today Morning',
            new Date(2025, 0, 15, 9, 0, 0)
          ),
          createMockTask(
            'task-2',
            'Due Today Evening',
            new Date(2025, 0, 15, 18, 30, 0)
          ),
          createMockTask('task-3', 'Due Tomorrow', new Date(2025, 0, 16)),
          createMockTask('task-4', 'Due Yesterday', new Date(2025, 0, 14)),
          createMockTask('task-5', 'No Due Date'),
        ];

        const filter = createMockFilter('due-today');
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(2);
        expect(result.map(task => task.id)).toEqual(['task-1', 'task-2']);
      });

      it('should filter overdue tasks', () => {
        const tasks = [
          createMockTask('task-1', 'Overdue by 1 day', new Date(2025, 0, 14)), // Yesterday
          createMockTask('task-2', 'Overdue by 3 days', new Date(2025, 0, 12)), // Jan 12
          createMockTask('task-3', 'Due Today', new Date(2025, 0, 15)), // Today (not overdue)
          createMockTask('task-4', 'Due Tomorrow', new Date(2025, 0, 16)), // Future (not overdue)
          createMockTask('task-5', 'No Due Date'),
        ];

        const filter = createMockFilter('overdue');
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(2);
        expect(result.map(task => task.id)).toEqual(['task-1', 'task-2']);
      });

      it('should handle edge cases with exact midnight dates', () => {
        const tasks = [
          createMockTask(
            'task-1',
            'Due at exact midnight today',
            new Date(2025, 0, 15, 0, 0, 0)
          ),
          createMockTask(
            'task-2',
            'Due at end of today',
            new Date(2025, 0, 15, 23, 59, 59)
          ),
          createMockTask(
            'task-3',
            'Due at start of tomorrow',
            new Date(2025, 0, 16, 0, 0, 0)
          ),
        ];

        const dueTodayFilter = createMockFilter('due-today');
        const dueTodayResult = filterTasks(tasks, dueTodayFilter);

        expect(dueTodayResult).toHaveLength(2);
        expect(dueTodayResult.map(task => task.id)).toEqual([
          'task-1',
          'task-2',
        ]);

        const within3DaysFilter = createMockFilter('due-within-3-days');
        const within3DaysResult = filterTasks(tasks, within3DaysFilter);

        expect(within3DaysResult).toHaveLength(3);
      });
    });

    describe('Label-based filtering', () => {
      const mockLabels = [
        { id: 'label-1', name: 'Bug', color: '#ef4444' },
        { id: 'label-2', name: 'Feature', color: '#10b981' },
        { id: 'label-3', name: 'Urgent', color: '#f59e0b' },
      ];

      it('should filter tasks by label names (preferred method)', () => {
        const tasks = [
          createMockTask('task-1', 'Bug Task', undefined, undefined, [
            mockLabels[0],
          ]),
          createMockTask('task-2', 'Feature Task', undefined, undefined, [
            mockLabels[1],
          ]),
          createMockTask(
            'task-3',
            'Bug and Urgent Task',
            undefined,
            undefined,
            [mockLabels[0], mockLabels[2]]
          ),
          createMockTask('task-4', 'No Labels Task'),
        ];

        const filter = createMockFilter('label', undefined, ['Bug']);
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(2);
        expect(result.map(task => task.id)).toEqual(['task-1', 'task-3']);
      });

      it('should filter tasks by multiple label names', () => {
        const tasks = [
          createMockTask('task-1', 'Bug Task', undefined, undefined, [
            mockLabels[0],
          ]),
          createMockTask('task-2', 'Feature Task', undefined, undefined, [
            mockLabels[1],
          ]),
          createMockTask('task-3', 'Urgent Task', undefined, undefined, [
            mockLabels[2],
          ]),
          createMockTask('task-4', 'No Labels Task'),
        ];

        const filter = createMockFilter('label', undefined, ['Bug', 'Feature']);
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(2);
        expect(result.map(task => task.id)).toEqual(['task-1', 'task-2']);
      });

      it('should filter tasks by label IDs (backward compatibility)', () => {
        const tasks = [
          createMockTask('task-1', 'Bug Task', undefined, undefined, [
            mockLabels[0],
          ]),
          createMockTask('task-2', 'Feature Task', undefined, undefined, [
            mockLabels[1],
          ]),
          createMockTask('task-3', 'No Labels Task'),
        ];

        const filter = createMockFilter('label', ['label-1']);
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('task-1');
      });

      it('should prioritize label names over label IDs when both are provided', () => {
        const tasks = [
          createMockTask('task-1', 'Bug Task', undefined, undefined, [
            mockLabels[0],
          ]),
          createMockTask('task-2', 'Feature Task', undefined, undefined, [
            mockLabels[1],
          ]),
        ];

        // Provide both label names and IDs - names should take priority
        const filter = createMockFilter('label', ['label-2'], ['Bug']); // IDs point to Feature, names to Bug
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('task-1'); // Should use label names (Bug), not IDs (Feature)
      });

      it('should return all active tasks when label filter has no selections', () => {
        const tasks = [
          createMockTask('task-1', 'Bug Task', undefined, undefined, [
            mockLabels[0],
          ]),
          createMockTask('task-2', 'No Labels Task'),
        ];

        const filter = createMockFilter('label', [], []); // Empty selections
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(2);
        expect(result).toEqual(tasks);
      });

      it('should filter tasks that have any labels', () => {
        const tasks = [
          createMockTask('task-1', 'Bug Task', undefined, undefined, [
            mockLabels[0],
          ]),
          createMockTask('task-2', 'Feature Task', undefined, undefined, [
            mockLabels[1],
          ]),
          createMockTask('task-3', 'No Labels Task', undefined, undefined, []),
          createMockTask('task-4', 'Also No Labels'),
        ];

        const filter = createMockFilter('has-labels');
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(2);
        expect(result.map(task => task.id)).toEqual(['task-1', 'task-2']);
      });

      it('should handle tasks with undefined labels array', () => {
        const taskWithUndefinedLabels = {
          ...createMockTask('task-1', 'Task with undefined labels'),
          labels: undefined,
        } as Task;

        const tasks = [
          taskWithUndefinedLabels,
          createMockTask('task-2', 'Bug Task', undefined, undefined, [
            mockLabels[0],
          ]),
        ];

        const hasLabelsFilter = createMockFilter('has-labels');
        const hasLabelsResult = filterTasks(tasks, hasLabelsFilter);

        expect(hasLabelsResult).toHaveLength(1);
        expect(hasLabelsResult[0].id).toBe('task-2');

        const labelNameFilter = createMockFilter('label', undefined, ['Bug']);
        const labelNameResult = filterTasks(tasks, labelNameFilter);

        expect(labelNameResult).toHaveLength(1);
        expect(labelNameResult[0].id).toBe('task-2');
      });
    });

    describe('Priority-based filtering', () => {
      it('should filter tasks by single priority', () => {
        const tasks = [
          createMockTask('task-1', 'High Priority Task', undefined, 'high'),
          createMockTask('task-2', 'Medium Priority Task', undefined, 'medium'),
          createMockTask('task-3', 'Low Priority Task', undefined, 'low'),
          createMockTask('task-4', 'No Priority Task'),
        ];

        const filter = createMockFilter('priority', undefined, undefined, [
          'high',
        ]);
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('task-1');
      });

      it('should filter tasks by multiple priorities', () => {
        const tasks = [
          createMockTask(
            'task-1',
            'Critical Priority Task',
            undefined,
            'critical'
          ),
          createMockTask('task-2', 'High Priority Task', undefined, 'high'),
          createMockTask('task-3', 'Medium Priority Task', undefined, 'medium'),
          createMockTask('task-4', 'Low Priority Task', undefined, 'low'),
          createMockTask('task-5', 'No Priority Task'),
        ];

        const filter = createMockFilter('priority', undefined, undefined, [
          'critical',
          'high',
        ]);
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(2);
        expect(result.map(task => task.id)).toEqual(['task-1', 'task-2']);
      });

      it('should exclude tasks with no priority when filtering by priority', () => {
        const tasks = [
          createMockTask('task-1', 'High Priority Task', undefined, 'high'),
          createMockTask('task-2', 'No Priority Task'),
          createMockTask(
            'task-3',
            'Undefined Priority Task',
            undefined,
            undefined
          ),
        ];

        const filter = createMockFilter('priority', undefined, undefined, [
          'high',
          'medium',
        ]);
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('task-1');
      });

      it('should return all active tasks when priority filter has no selections', () => {
        const tasks = [
          createMockTask('task-1', 'High Priority Task', undefined, 'high'),
          createMockTask('task-2', 'No Priority Task'),
        ];

        const filter = createMockFilter('priority', undefined, undefined, []); // Empty selections
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(2);
        expect(result).toEqual(tasks);
      });
    });

    describe('Combined filtering scenarios', () => {
      it('should handle empty task array', () => {
        const tasks: Task[] = [];
        const filter = createMockFilter('all');
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(0);
        expect(result).toEqual([]);
      });

      it('should maintain task object references and properties', () => {
        const originalTask = createMockTask(
          'task-1',
          'Test Task',
          new Date(2025, 0, 15),
          'high'
        );
        const tasks = [originalTask];

        const filter = createMockFilter('due-today');
        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(1);
        expect(result[0]).toBe(originalTask); // Same reference
        expect(result[0].title).toBe('Test Task');
        expect(result[0].priority).toBe('high');
      });

      it('should handle unknown filter type gracefully', () => {
        const tasks = [
          createMockTask('task-1', 'Task 1'),
          createMockTask('task-2', 'Task 2'),
        ];

        const filter = {
          type: 'unknown-filter-type' as any,
          label: '',
        };

        const result = filterTasks(tasks, filter);

        expect(result).toHaveLength(2);
        expect(result).toEqual(tasks);
      });
    });
  });

  describe('getFilteredTaskCount', () => {
    it('should return the count of filtered tasks', () => {
      const tasks = [
        createMockTask('task-1', 'Due Today', new Date(2025, 0, 15)),
        createMockTask('task-2', 'Due Tomorrow', new Date(2025, 0, 16)),
        createMockTask('task-3', 'Overdue', new Date(2025, 0, 14)),
      ];

      const dueTodayFilter = createMockFilter('due-today');
      const count = getFilteredTaskCount(tasks, dueTodayFilter);

      expect(count).toBe(1);
    });

    it('should return 0 for empty task array', () => {
      const tasks: Task[] = [];
      const filter = createMockFilter('all');
      const count = getFilteredTaskCount(tasks, filter);

      expect(count).toBe(0);
    });

    it('should return correct count when all tasks are filtered out', () => {
      const tasks = [
        createMockTask('task-1', 'Future Task', new Date(2025, 0, 20)),
        createMockTask('task-2', 'Another Future Task', new Date(2025, 0, 25)),
      ];

      const dueTodayFilter = createMockFilter('due-today');
      const count = getFilteredTaskCount(tasks, dueTodayFilter);

      expect(count).toBe(0);
    });
  });

  describe('isFilterActive', () => {
    it('should return false for "all" filter type', () => {
      const filter = createMockFilter('all');
      const result = isFilterActive(filter);

      expect(result).toBe(false);
    });

    it('should return true for date-based filters', () => {
      const dueTodayFilter = createMockFilter('due-today');
      expect(isFilterActive(dueTodayFilter)).toBe(true);

      const overdueFilter = createMockFilter('overdue');
      expect(isFilterActive(overdueFilter)).toBe(true);

      const within3DaysFilter = createMockFilter('due-within-3-days');
      expect(isFilterActive(within3DaysFilter)).toBe(true);

      const hasLabelsFilter = createMockFilter('has-labels');
      expect(isFilterActive(hasLabelsFilter)).toBe(true);
    });

    it('should return true for label filter with label names', () => {
      const filter = createMockFilter('label', undefined, ['Bug']);
      const result = isFilterActive(filter);

      expect(result).toBe(true);
    });

    it('should return true for label filter with label IDs', () => {
      const filter = createMockFilter('label', ['label-1']);
      const result = isFilterActive(filter);

      expect(result).toBe(true);
    });

    it('should return false for label filter with no selections', () => {
      const filter = createMockFilter('label', [], []);
      const result = isFilterActive(filter);

      expect(result).toBe(false);
    });

    it('should return false for label filter with undefined selections', () => {
      const filter = createMockFilter('label');
      const result = isFilterActive(filter);

      expect(result).toBe(false);
    });

    it('should return true for priority filter with selections', () => {
      const filter = createMockFilter('priority', undefined, undefined, [
        'high',
      ]);
      const result = isFilterActive(filter);

      expect(result).toBe(true);
    });

    it('should return false for priority filter with no selections', () => {
      const filter = createMockFilter('priority', undefined, undefined, []);
      const result = isFilterActive(filter);

      expect(result).toBe(false);
    });

    it('should return false for priority filter with undefined selections', () => {
      const filter = createMockFilter('priority');
      const result = isFilterActive(filter);

      expect(result).toBe(false);
    });

    it('should handle edge cases with mixed empty and undefined arrays', () => {
      const labelFilter = {
        type: 'label' as const,
        label: '',
        selectedLabelNames: [],
        selectedLabels: undefined,
      };

      expect(isFilterActive(labelFilter)).toBe(false);

      const priorityFilter = {
        type: 'priority' as const,
        label: '',
        selectedPriorities: undefined,
      };

      expect(isFilterActive(priorityFilter)).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle tasks with invalid date strings', () => {
      const taskWithInvalidDate = {
        ...createMockTask('task-1', 'Invalid Date Task'),
        dueDate: 'invalid-date-string',
      };

      const tasks = [taskWithInvalidDate];
      const filter = createMockFilter('due-today');
      const result = filterTasks(tasks, filter);

      expect(result).toHaveLength(0); // Invalid date should not match
    });

    it('should handle tasks with null due dates in date objects', () => {
      const taskWithNullDate = {
        ...createMockTask('task-1', 'Null Date Task'),
        dueDate: null as any,
      };

      const tasks = [taskWithNullDate];
      const filter = createMockFilter('due-today');
      const result = filterTasks(tasks, filter);

      expect(result).toHaveLength(0);
    });

    it('should handle very old and very future dates', () => {
      const tasks = [
        createMockTask('task-1', 'Very Old Task', new Date(1900, 0, 1)),
        createMockTask('task-2', 'Very Future Task', new Date(2100, 11, 31)),
        createMockTask('task-3', 'Today Task', new Date(2025, 0, 15)),
      ];

      const overdueFilter = createMockFilter('overdue');
      const overdueResult = filterTasks(tasks, overdueFilter);

      expect(overdueResult).toHaveLength(1);
      expect(overdueResult[0].id).toBe('task-1');

      const within3DaysFilter = createMockFilter('due-within-3-days');
      const within3DaysResult = filterTasks(tasks, within3DaysFilter);

      expect(within3DaysResult).toHaveLength(1);
      expect(within3DaysResult[0].id).toBe('task-3');
    });

    it('should handle tasks with complex label structures', () => {
      const taskWithComplexLabels = createMockTask(
        'task-1',
        'Complex Task',
        undefined,
        undefined,
        [
          { id: 'label-1', name: 'Bug', color: '#ef4444' },
          { id: 'label-2', name: 'Priority: High', color: '#f59e0b' },
          { id: 'label-3', name: 'Team: Frontend', color: '#10b981' },
        ]
      );

      const tasks = [taskWithComplexLabels];

      const bugFilter = createMockFilter('label', undefined, ['Bug']);
      const bugResult = filterTasks(tasks, bugFilter);

      expect(bugResult).toHaveLength(1);

      const priorityFilter = createMockFilter('label', undefined, [
        'Priority: High',
      ]);
      const priorityResult = filterTasks(tasks, priorityFilter);

      expect(priorityResult).toHaveLength(1);

      const nonExistentFilter = createMockFilter('label', undefined, [
        'NonExistent',
      ]);
      const nonExistentResult = filterTasks(tasks, nonExistentFilter);

      expect(nonExistentResult).toHaveLength(0);
    });

    it('should maintain performance with large number of tasks', () => {
      // Create 1000 tasks
      const tasks = Array.from({ length: 1000 }, (_, i) =>
        createMockTask(
          `task-${i}`,
          `Task ${i}`,
          i % 3 === 0 ? new Date(2025, 0, 15) : undefined, // Every 3rd task due today
          i % 4 === 0 ? 'high' : 'medium' // Every 4th task high priority
        )
      );

      const start = performance.now();

      const dueTodayFilter = createMockFilter('due-today');
      const result = filterTasks(tasks, dueTodayFilter);

      const duration = performance.now() - start;

      expect(result.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });
  });
});
