/**
 * AI Client Tests
 * Tests for AI client abstraction layer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createAIClient,
  getAIClient,
  resetAIClient,
  type AIClient,
} from '../utils/ai-client.js';
import type { TaskRecord } from '../utils/indexeddb.js';

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe('AI Client', () => {
  let aiClient: AIClient;

  beforeEach(() => {
    resetAIClient();
    aiClient = getAIClient();
  });

  describe('Fallback AI Client', () => {
    const mockTask: TaskRecord = {
      id: 'task-1',
      boardId: 'board-1',
      columnId: 'col-1',
      title: 'Develop new feature',
      description: 'Build a new user authentication feature',
      status: 'TODO',
      priority: 'HIGH',
      labels: [],
      subtasks: [],
      files: [],
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    describe('breakdownTask', () => {
      it('should break down task by phase strategy', async () => {
        const result = await aiClient.breakdownTask(mockTask, 'BY_PHASE');
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThan(0);
        expect(result.length).toBeLessThanOrEqual(7);
      });

      it('should break down task by component strategy', async () => {
        const result = await aiClient.breakdownTask(mockTask, 'BY_COMPONENT');
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThan(0);
      });

      it('should break down task by complexity strategy', async () => {
        const highComplexityTask: TaskRecord = {
          ...mockTask,
          priority: 'CRITICAL',
          description:
            'Very complex task with many requirements and dependencies',
        };
        const result = await aiClient.breakdownTask(
          highComplexityTask,
          'BY_COMPLEXITY'
        );
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThan(0);
      });

      it('should return unique subtasks', async () => {
        const result = await aiClient.breakdownTask(mockTask, 'SEQUENTIAL');
        const unique = new Set(result);
        expect(unique.size).toBe(result.length);
      });
    });

    describe('parseNaturalLanguage', () => {
      it('should parse simple task with priority', async () => {
        const result = await aiClient.parseNaturalLanguage(
          'urgent: finish the report by tomorrow',
          {}
        );
        expect(result.title).toBeTruthy();
        expect(result.priority).toBe('CRITICAL');
      });

      it('should extract due date from "today"', async () => {
        const result = await aiClient.parseNaturalLanguage(
          'Complete the task today',
          {}
        );
        expect(result.dueDate).toBeTruthy();
        expect(result.dueTime).toBe('23:59');
      });

      it('should extract due date from "tomorrow"', async () => {
        const result = await aiClient.parseNaturalLanguage(
          'Finish work tomorrow',
          {}
        );
        expect(result.dueDate).toBeTruthy();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        expect(result.dueDate?.toDateString()).toBe(tomorrow.toDateString());
      });

      it('should default to MEDIUM priority when not specified', async () => {
        const result = await aiClient.parseNaturalLanguage('Regular task', {});
        expect(result.priority).toBe('MEDIUM');
      });

      it('should detect low priority keywords', async () => {
        const result = await aiClient.parseNaturalLanguage(
          'low priority task whenever',
          {}
        );
        expect(result.priority).toBe('LOW');
      });

      it('should clean up title by removing time references', async () => {
        const result = await aiClient.parseNaturalLanguage(
          'urgent task today with high priority',
          {}
        );
        expect(result.title.toLowerCase()).not.toContain('urgent');
        expect(result.title.toLowerCase()).not.toContain('today');
      });
    });

    describe('optimizeSchedule', () => {
      const tasks: TaskRecord[] = [
        {
          ...mockTask,
          id: 'task-1',
          title: 'Critical task',
          priority: 'CRITICAL',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        },
        {
          ...mockTask,
          id: 'task-2',
          title: 'High priority task',
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
        },
        {
          ...mockTask,
          id: 'task-3',
          title: 'Medium task',
          priority: 'MEDIUM',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
        },
      ];

      it('should optimize tasks by priority', async () => {
        const result = await aiClient.optimizeSchedule(tasks, {
          workingHoursPerDay: 8,
        });

        expect(result.optimizedTasks).toBeInstanceOf(Array);
        expect(result.optimizedTasks[0].priority).toBe('CRITICAL');
        expect(result.estimatedCompletionDate).toBeInstanceOf(Date);
      });

      it('should provide suggestions for critical tasks', async () => {
        const result = await aiClient.optimizeSchedule(tasks, {
          workingHoursPerDay: 8,
        });

        expect(result.suggestions).toBeInstanceOf(Array);
        expect(result.suggestions.some(s => s.includes('critical'))).toBe(true);
      });

      it('should suggest deadline adjustments when needed', async () => {
        const deadline = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // Tomorrow
        const result = await aiClient.optimizeSchedule(tasks, {
          workingHoursPerDay: 8,
          deadline,
        });

        expect(result.suggestions.length).toBeGreaterThan(0);
      });

      it('should filter out completed tasks', async () => {
        const tasksWithCompleted = [
          ...tasks,
          { ...mockTask, id: 'task-4', status: 'COMPLETED' as const },
        ];
        const result = await aiClient.optimizeSchedule(tasksWithCompleted, {
          workingHoursPerDay: 8,
        });

        expect(result.optimizedTasks.length).toBe(tasks.length);
      });
    });

    describe('getRecommendedTask', () => {
      const tasks: TaskRecord[] = [
        {
          ...mockTask,
          id: 'task-1',
          title: 'Overdue task',
          priority: 'HIGH',
          dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        },
        {
          ...mockTask,
          id: 'task-2',
          title: 'Due today',
          priority: 'MEDIUM',
          dueDate: new Date().toISOString(),
        },
        {
          ...mockTask,
          id: 'task-3',
          title: 'Future task',
          priority: 'LOW',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      it('should recommend overdue high-priority task', async () => {
        const result = await aiClient.getRecommendedTask(tasks, {
          currentTime: new Date(),
        });

        expect(result).toBeTruthy();
        expect(result?.id).toBe('task-1');
      });

      it('should return null for empty task list', async () => {
        const result = await aiClient.getRecommendedTask([], {
          currentTime: new Date(),
        });

        expect(result).toBeNull();
      });

      it('should consider working hours preference', async () => {
        const result = await aiClient.getRecommendedTask(tasks, {
          currentTime: new Date(),
          workingHours: { start: '09:00', end: '17:00' },
        });

        expect(result).toBeTruthy();
      });

      it('should boost score for time-matching tasks', async () => {
        const now = new Date();
        const result = await aiClient.getRecommendedTask(tasks, {
          currentTime: now,
          completionHistory: [
            {
              taskId: 'prev-1',
              completedAt: new Date(),
              timeOfDay: now.getHours(),
              dayOfWeek: now.getDay(),
            },
          ],
        });

        expect(result).toBeTruthy();
      });
    });
  });

  describe('Client Factory', () => {
    it('should create fallback client by default', () => {
      const client = createAIClient();
      expect(client).toBeTruthy();
      expect(client.breakdownTask).toBeDefined();
      expect(client.parseNaturalLanguage).toBeDefined();
      expect(client.optimizeSchedule).toBeDefined();
      expect(client.getRecommendedTask).toBeDefined();
    });

    it('should return singleton instance', () => {
      const client1 = getAIClient();
      const client2 = getAIClient();
      expect(client1).toBe(client2);
    });

    it('should reset singleton instance', () => {
      const client1 = getAIClient();
      resetAIClient();
      const client2 = getAIClient();
      expect(client1).not.toBe(client2);
    });
  });
});
