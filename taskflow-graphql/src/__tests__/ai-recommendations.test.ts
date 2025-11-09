/**
 * AI Recommendations Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getRecommendedTaskWithAI,
  getTopRecommendedTasks,
  analyzeWorkPatterns,
} from '../utils/ai-recommendations.js';
import type { TaskRecord } from '../utils/indexeddb.js';
import type { UserContext } from '../utils/ai-client.js';

describe('AI Recommendations', () => {
  const mockTasks: TaskRecord[] = [
    {
      id: 'task-1',
      boardId: 'board-1',
      columnId: 'col-1',
      title: 'Overdue critical task',
      description: 'Very important',
      status: 'TODO',
      priority: 'CRITICAL',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      labels: [],
      subtasks: [],
      files: [],
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      boardId: 'board-1',
      columnId: 'col-1',
      title: 'Due today',
      description: 'Important',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date().toISOString(),
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
      title: 'Future task',
      description: 'Can wait',
      status: 'TODO',
      priority: 'LOW',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
      labels: [],
      subtasks: [],
      files: [],
      position: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockUserContext: UserContext = {
    currentTime: new Date(),
    workingHours: { start: '09:00', end: '17:00' },
    completionHistory: [
      {
        taskId: 'prev-1',
        completedAt: new Date(),
        timeOfDay: 10,
        dayOfWeek: 1,
        duration: 120,
      },
      {
        taskId: 'prev-2',
        completedAt: new Date(),
        timeOfDay: 14,
        dayOfWeek: 1,
        duration: 90,
      },
    ],
  };

  describe('getRecommendedTaskWithAI', () => {
    it('should recommend highest priority task', async () => {
      const result = await getRecommendedTaskWithAI(mockTasks, mockUserContext);
      expect(result).toBeTruthy();
      expect(result?.task.id).toBe('task-1');
      expect(result?.task.priority).toBe('CRITICAL');
    });

    it('should include reasoning when requested', async () => {
      const result = await getRecommendedTaskWithAI(
        mockTasks,
        mockUserContext,
        {
          includeReasoning: true,
        }
      );
      expect(result?.reasoning).toBeTruthy();
      expect(result?.reasoning.length).toBeGreaterThan(0);
    });

    it('should return null for empty task list', async () => {
      const result = await getRecommendedTaskWithAI([], mockUserContext);
      expect(result).toBeNull();
    });

    it('should have confidence score', async () => {
      const result = await getRecommendedTaskWithAI(mockTasks, mockUserContext);
      expect(result?.confidence).toBeGreaterThan(0);
      expect(result?.confidence).toBeLessThanOrEqual(1);
    });

    it('should filter out completed tasks', async () => {
      const tasksWithCompleted = [
        ...mockTasks,
        { ...mockTasks[0], id: 'task-4', status: 'COMPLETED' as const },
      ];
      const result = await getRecommendedTaskWithAI(
        tasksWithCompleted,
        mockUserContext
      );
      expect(result?.task.status).not.toBe('COMPLETED');
    });

    it('should consider time of day when requested', async () => {
      const result = await getRecommendedTaskWithAI(
        mockTasks,
        mockUserContext,
        {
          considerTimeOfDay: true,
        }
      );
      expect(result).toBeTruthy();
      expect(result?.score).toBeGreaterThan(0);
    });

    it('should consider history when requested', async () => {
      const result = await getRecommendedTaskWithAI(
        mockTasks,
        mockUserContext,
        {
          considerHistory: true,
        }
      );
      expect(result).toBeTruthy();
    });
  });

  describe('getTopRecommendedTasks', () => {
    it('should return top N tasks', async () => {
      const results = await getTopRecommendedTasks(mockTasks, mockUserContext, {
        limit: 2,
      });
      expect(results.length).toBe(2);
    });

    it('should sort tasks by score descending', async () => {
      const results = await getTopRecommendedTasks(mockTasks, mockUserContext, {
        limit: 3,
      });
      for (let i = 1; i < results.length; i++) {
        expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
      }
    });

    it('should not exceed available tasks', async () => {
      const results = await getTopRecommendedTasks(mockTasks, mockUserContext, {
        limit: 10,
      });
      expect(results.length).toBeLessThanOrEqual(mockTasks.length);
    });

    it('should include reasoning for each task', async () => {
      const results = await getTopRecommendedTasks(mockTasks, mockUserContext, {
        limit: 2,
        includeReasoning: true,
      });
      results.forEach(result => {
        expect(result.reasoning).toBeTruthy();
      });
    });

    it('should default to 5 tasks', async () => {
      const manyTasks = Array.from({ length: 10 }, (_, i) => ({
        ...mockTasks[0],
        id: `task-${i}`,
      }));
      const results = await getTopRecommendedTasks(manyTasks, mockUserContext);
      expect(results.length).toBe(5);
    });
  });

  describe('analyzeWorkPatterns', () => {
    it('should analyze peak hours', () => {
      const history = [
        { taskId: '1', completedAt: new Date(), timeOfDay: 10, dayOfWeek: 1 },
        { taskId: '2', completedAt: new Date(), timeOfDay: 10, dayOfWeek: 2 },
        { taskId: '3', completedAt: new Date(), timeOfDay: 14, dayOfWeek: 3 },
      ];
      const patterns = analyzeWorkPatterns(history);
      expect(patterns.peakHours).toContain(10);
    });

    it('should analyze productive days', () => {
      const history = [
        { taskId: '1', completedAt: new Date(), timeOfDay: 10, dayOfWeek: 1 },
        { taskId: '2', completedAt: new Date(), timeOfDay: 11, dayOfWeek: 1 },
        { taskId: '3', completedAt: new Date(), timeOfDay: 14, dayOfWeek: 2 },
      ];
      const patterns = analyzeWorkPatterns(history);
      expect(patterns.productiveDays).toContain(1);
    });

    it('should calculate average duration', () => {
      const history = [
        {
          taskId: '1',
          completedAt: new Date(),
          timeOfDay: 10,
          dayOfWeek: 1,
          duration: 60,
        },
        {
          taskId: '2',
          completedAt: new Date(),
          timeOfDay: 10,
          dayOfWeek: 1,
          duration: 90,
        },
        {
          taskId: '3',
          completedAt: new Date(),
          timeOfDay: 10,
          dayOfWeek: 1,
          duration: 120,
        },
      ];
      const patterns = analyzeWorkPatterns(history);
      expect(patterns.averageDuration).toBe(90);
    });

    it('should handle empty history', () => {
      const patterns = analyzeWorkPatterns([]);
      expect(patterns.peakHours).toEqual([]);
      expect(patterns.productiveDays).toEqual([]);
      expect(patterns.averageDuration).toBe(0);
    });

    it('should limit peak hours to top 3', () => {
      const history = Array.from({ length: 10 }, (_, i) => ({
        taskId: `${i}`,
        completedAt: new Date(),
        timeOfDay: i,
        dayOfWeek: 1,
      }));
      const patterns = analyzeWorkPatterns(history);
      expect(patterns.peakHours.length).toBeLessThanOrEqual(3);
    });
  });
});
