/**
 * Task Sort utility functions tests
 * タスクソート機能の包括的テスト
 */

import { describe, it, expect, vi } from 'vitest';
import { sortTasks } from './taskSort';
import type { Task, SortOption } from '../types';

// Mock priorityConfig
vi.mock('./priorityConfig', () => ({
  getPriorityWeight: vi.fn((priority?: string) => {
    switch (priority) {
      case 'critical':
        return 1;
      case 'high':
        return 2;
      case 'medium':
        return 3;
      case 'low':
        return 4;
      default:
        return 5;
    }
  }),
}));

describe('Task Sort Utils', () => {
  const now = new Date('2024-01-15T10:00:00Z');
  const yesterday = new Date('2024-01-14T10:00:00Z');
  const tomorrow = new Date('2024-01-16T10:00:00Z');

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'B Task',
      description: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      priority: 'medium',
      dueDate: tomorrow.toISOString(),
    } as Task,
    {
      id: 'task-2',
      title: 'A Task',
      description: '',
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString(),
      priority: 'high',
      dueDate: now.toISOString(),
    } as Task,
    {
      id: 'task-3',
      title: 'C Task',
      description: '',
      createdAt: tomorrow.toISOString(),
      updatedAt: tomorrow.toISOString(),
      priority: 'low',
      dueDate: null,
    } as Task,
  ];

  describe('manual sort', () => {
    it('should preserve original order', () => {
      const sorted = sortTasks(mockTasks, 'manual');

      expect(sorted).toHaveLength(3);
      expect(sorted[0].id).toBe('task-1');
      expect(sorted[1].id).toBe('task-2');
      expect(sorted[2].id).toBe('task-3');
    });

    it('should return a new array', () => {
      const sorted = sortTasks(mockTasks, 'manual');
      expect(sorted).not.toBe(mockTasks);
    });
  });

  describe('title sort', () => {
    it('should sort by title alphabetically', () => {
      const sorted = sortTasks(mockTasks, 'title');

      expect(sorted[0].title).toBe('A Task');
      expect(sorted[1].title).toBe('B Task');
      expect(sorted[2].title).toBe('C Task');
    });

    it('should handle Japanese characters', () => {
      const japaneseTasks: Task[] = [
        {
          id: '1',
          title: 'わたし',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        } as Task,
        {
          id: '2',
          title: 'あなた',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        } as Task,
        {
          id: '3',
          title: 'かれら',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        } as Task,
      ];

      const sorted = sortTasks(japaneseTasks, 'title');

      expect(sorted[0].title).toBe('あなた');
      expect(sorted[1].title).toBe('かれら');
      expect(sorted[2].title).toBe('わたし');
    });
  });

  describe('createdAt sort', () => {
    it('should sort by creation date (newest first)', () => {
      const sorted = sortTasks(mockTasks, 'createdAt');

      expect(sorted[0].id).toBe('task-3'); // tomorrow
      expect(sorted[1].id).toBe('task-1'); // now
      expect(sorted[2].id).toBe('task-2'); // yesterday
    });

    it('should handle same creation dates', () => {
      const sameDateTasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        } as Task,
        {
          id: '2',
          title: 'Task 2',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        } as Task,
      ];

      const sorted = sortTasks(sameDateTasks, 'createdAt');

      // Order should be stable for same dates
      expect(sorted).toHaveLength(2);
    });
  });

  describe('updatedAt sort', () => {
    it('should sort by update date (newest first)', () => {
      const sorted = sortTasks(mockTasks, 'updatedAt');

      expect(sorted[0].id).toBe('task-3'); // tomorrow
      expect(sorted[1].id).toBe('task-1'); // now
      expect(sorted[2].id).toBe('task-2'); // yesterday
    });

    it('should prioritize recently updated tasks', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Old',
          createdAt: yesterday.toISOString(),
          updatedAt: yesterday.toISOString(),
        } as Task,
        {
          id: '2',
          title: 'Recent',
          createdAt: yesterday.toISOString(),
          updatedAt: now.toISOString(),
        } as Task,
      ];

      const sorted = sortTasks(tasks, 'updatedAt');

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
    });
  });

  describe('dueDate sort', () => {
    it('should sort by due date (earliest first)', () => {
      const sorted = sortTasks(mockTasks, 'dueDate');

      expect(sorted[0].id).toBe('task-2'); // now
      expect(sorted[1].id).toBe('task-1'); // tomorrow
      expect(sorted[2].id).toBe('task-3'); // null (no due date)
    });

    it('should place tasks without due date at the end', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'No Due Date',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          dueDate: null,
        } as Task,
        {
          id: '2',
          title: 'Has Due Date',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          dueDate: tomorrow.toISOString(),
        } as Task,
      ];

      const sorted = sortTasks(tasks, 'dueDate');

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
    });

    it('should handle multiple tasks without due dates', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'No Due Date 1',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          dueDate: null,
        } as Task,
        {
          id: '2',
          title: 'No Due Date 2',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          dueDate: null,
        } as Task,
      ];

      const sorted = sortTasks(tasks, 'dueDate');

      // Tasks without due dates should maintain relative order
      expect(sorted).toHaveLength(2);
    });
  });

  describe('priority sort', () => {
    it('should sort by priority (critical to low)', () => {
      const sorted = sortTasks(mockTasks, 'priority');

      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('medium');
      expect(sorted[2].priority).toBe('low');
    });

    it('should handle all priority levels', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Low',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          priority: 'low',
        } as Task,
        {
          id: '2',
          title: 'Critical',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          priority: 'critical',
        } as Task,
        {
          id: '3',
          title: 'Medium',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          priority: 'medium',
        } as Task,
        {
          id: '4',
          title: 'High',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          priority: 'high',
        } as Task,
      ];

      const sorted = sortTasks(tasks, 'priority');

      expect(sorted[0].priority).toBe('critical');
      expect(sorted[1].priority).toBe('high');
      expect(sorted[2].priority).toBe('medium');
      expect(sorted[3].priority).toBe('low');
    });

    it('should use createdAt as secondary sort for same priority', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Old High',
          createdAt: yesterday.toISOString(),
          updatedAt: yesterday.toISOString(),
          priority: 'high',
        } as Task,
        {
          id: '2',
          title: 'New High',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          priority: 'high',
        } as Task,
      ];

      const sorted = sortTasks(tasks, 'priority');

      // Same priority: newer first (task-2)
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
    });

    it('should handle tasks without priority', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'No Priority',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          priority: undefined,
        } as Task,
        {
          id: '2',
          title: 'Has Priority',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          priority: 'high',
        } as Task,
      ];

      const sorted = sortTasks(tasks, 'priority');

      expect(sorted[0].id).toBe('2'); // Has priority comes first
      expect(sorted[1].id).toBe('1');
    });
  });

  describe('edge cases', () => {
    it('should handle empty task list', () => {
      const sorted = sortTasks([], 'title');
      expect(sorted).toEqual([]);
    });

    it('should handle single task', () => {
      const singleTask = [mockTasks[0]];
      const sorted = sortTasks(singleTask, 'title');

      expect(sorted).toHaveLength(1);
      expect(sorted[0]).toEqual(singleTask[0]);
    });

    it('should not mutate original array', () => {
      const original = [...mockTasks];
      sortTasks(mockTasks, 'title');

      expect(mockTasks).toEqual(original);
    });

    it('should handle unknown sort option gracefully', () => {
      const sorted = sortTasks(mockTasks, 'unknown' as SortOption);

      // Should return tasks in original order (no crash)
      expect(sorted).toHaveLength(3);
    });
  });
});
