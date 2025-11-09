/**
 * AI Schedule Optimizer Tests
 */

import { describe, it, expect } from 'vitest';
import {
  optimizeScheduleWithAI,
  estimateTaskEffort,
  calculateWorkloadDistribution,
  identifyConflicts,
} from '../utils/ai-schedule-optimizer.js';
import type { TaskRecord } from '../utils/indexeddb.js';

describe('AI Schedule Optimizer', () => {
  const mockTasks: TaskRecord[] = [
    {
      id: 'task-1',
      boardId: 'board-1',
      columnId: 'col-1',
      title: 'Critical task',
      description: 'Very important urgent work that needs immediate attention',
      status: 'TODO',
      priority: 'CRITICAL',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      labels: [],
      subtasks: [
        {
          id: '1',
          title: 'Sub 1',
          completed: false,
          position: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      files: [],
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      boardId: 'board-1',
      columnId: 'col-1',
      title: 'High priority task',
      description: 'Important work',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      labels: [],
      subtasks: [],
      files: [],
      position: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      boardId: 'board-1',
      columnId: 'col-1',
      title: 'Medium task',
      description: 'Regular work',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      labels: [],
      subtasks: [],
      files: [],
      position: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  describe('optimizeScheduleWithAI', () => {
    it('should optimize tasks by priority', async () => {
      const result = await optimizeScheduleWithAI(mockTasks);
      expect(result.optimizedTasks).toBeInstanceOf(Array);
      expect(result.optimizedTasks[0].priority).toBe('CRITICAL');
      expect(result.estimatedCompletionDate).toBeInstanceOf(Date);
    });

    it('should provide optimization suggestions', async () => {
      const result = await optimizeScheduleWithAI(mockTasks);
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should consider workload balancing', async () => {
      const result = await optimizeScheduleWithAI(mockTasks, {
        balanceWorkload: true,
      });
      expect(result.optimizedTasks).toBeInstanceOf(Array);
    });

    it('should respect working hours constraint', async () => {
      const result = await optimizeScheduleWithAI(mockTasks, {
        constraints: { workingHoursPerDay: 6 },
      });
      expect(result).toBeTruthy();
    });

    it('should filter out completed tasks', async () => {
      const tasksWithCompleted = [
        ...mockTasks,
        { ...mockTasks[0], id: 'task-4', status: 'COMPLETED' as const },
      ];
      const result = await optimizeScheduleWithAI(tasksWithCompleted);
      const completedInResult = result.optimizedTasks.filter(
        t => t.status === 'COMPLETED'
      );
      expect(completedInResult.length).toBe(0);
    });

    it('should suggest actions for overdue tasks', async () => {
      const overdueTask = {
        ...mockTasks[0],
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      };
      const result = await optimizeScheduleWithAI([
        overdueTask,
        ...mockTasks.slice(1),
      ]);
      expect(result.suggestions.some(s => s.includes('overdue'))).toBe(true);
    });
  });

  describe('estimateTaskEffort', () => {
    it('should estimate base effort', () => {
      const effort = estimateTaskEffort(mockTasks[1]);
      expect(effort).toBeGreaterThan(0);
      expect(typeof effort).toBe('number');
    });

    it('should increase effort for critical priority', () => {
      const criticalEffort = estimateTaskEffort(mockTasks[0]);
      const mediumEffort = estimateTaskEffort(mockTasks[2]);
      expect(criticalEffort).toBeGreaterThan(mediumEffort);
    });

    it('should increase effort for tasks with subtasks', () => {
      const taskWithSubs = {
        ...mockTasks[1],
        subtasks: Array(5).fill({
          id: '1',
          title: 'Sub',
          completed: false,
          position: 0,
          createdAt: new Date().toISOString(),
        }),
      };
      const effortWithSubs = estimateTaskEffort(taskWithSubs);
      const effortNoSubs = estimateTaskEffort(mockTasks[1]);
      expect(effortWithSubs).toBeGreaterThan(effortNoSubs);
    });

    it('should increase effort for long descriptions', () => {
      const longDescTask = {
        ...mockTasks[1],
        description: 'A'.repeat(250),
      };
      const longEffort = estimateTaskEffort(longDescTask);
      const normalEffort = estimateTaskEffort(mockTasks[1]);
      expect(longEffort).toBeGreaterThan(normalEffort);
    });

    it('should return rounded effort', () => {
      const effort = estimateTaskEffort(mockTasks[0]);
      expect(effort * 10).toBe(Math.round(effort * 10));
    });
  });

  describe('calculateWorkloadDistribution', () => {
    it('should calculate distribution for 7 days', () => {
      const distribution = calculateWorkloadDistribution(mockTasks);
      expect(distribution.length).toBe(7);
    });

    it('should include daily task counts', () => {
      const distribution = calculateWorkloadDistribution(mockTasks);
      distribution.forEach(day => {
        expect(day.taskCount).toBeGreaterThanOrEqual(0);
        expect(day.totalEffort).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include task IDs', () => {
      const distribution = calculateWorkloadDistribution(mockTasks);
      distribution.forEach(day => {
        expect(day.tasks).toBeInstanceOf(Array);
      });
    });

    it('should handle custom day range', () => {
      const distribution = calculateWorkloadDistribution(
        mockTasks,
        new Date(),
        14
      );
      expect(distribution.length).toBe(14);
    });

    it('should exclude completed tasks', () => {
      const tasksWithCompleted = [
        ...mockTasks,
        {
          ...mockTasks[0],
          id: 'task-4',
          status: 'COMPLETED' as const,
          dueDate: new Date().toISOString(),
        },
      ];
      const distribution = calculateWorkloadDistribution(tasksWithCompleted);
      // Completed tasks should not be counted
      const totalTasksInDistribution = distribution.reduce(
        (sum, day) => sum + day.taskCount,
        0
      );
      expect(totalTasksInDistribution).toBeLessThanOrEqual(mockTasks.length);
    });

    it('should match tasks to correct days', () => {
      const today = new Date();
      const taskDueToday = {
        ...mockTasks[0],
        dueDate: today.toISOString(),
      };
      const distribution = calculateWorkloadDistribution(
        [taskDueToday],
        today,
        1
      );
      expect(distribution[0].taskCount).toBe(1);
    });
  });

  describe('identifyConflicts', () => {
    it('should identify overloaded days', () => {
      const heavyTask1 = { ...mockTasks[0], dueDate: new Date().toISOString() };
      const heavyTask2 = {
        ...mockTasks[1],
        dueDate: new Date().toISOString(),
        priority: 'CRITICAL' as const,
      };
      const conflicts = identifyConflicts([heavyTask1, heavyTask2]);
      expect(conflicts.overloadedDays).toBeInstanceOf(Array);
    });

    it('should identify overlapping deadlines', () => {
      const sameDate = new Date().toISOString();
      const task1 = { ...mockTasks[0], dueDate: sameDate };
      const task2 = { ...mockTasks[1], dueDate: sameDate };
      const conflicts = identifyConflicts([task1, task2]);
      expect(conflicts.overlappingDeadlines).toBeInstanceOf(Array);
    });

    it('should detect multiple high-priority tasks on same day', () => {
      const sameDate = new Date().toISOString();
      const critical1 = {
        ...mockTasks[0],
        dueDate: sameDate,
        priority: 'CRITICAL' as const,
      };
      const critical2 = {
        ...mockTasks[1],
        dueDate: sameDate,
        priority: 'CRITICAL' as const,
      };
      const conflicts = identifyConflicts([critical1, critical2]);
      expect(conflicts.overlappingDeadlines.length).toBeGreaterThan(0);
    });

    it('should not flag single task as conflict', () => {
      const conflicts = identifyConflicts([mockTasks[0]]);
      expect(conflicts.overlappingDeadlines.length).toBe(0);
    });

    it('should handle tasks without due dates', () => {
      const noDueDate = { ...mockTasks[0], dueDate: undefined };
      const conflicts = identifyConflicts([noDueDate, mockTasks[1]]);
      expect(conflicts).toBeTruthy();
    });
  });
});
