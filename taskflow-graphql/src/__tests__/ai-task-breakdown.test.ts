/**
 * AI Task Breakdown Tests
 */

import { describe, it, expect } from 'vitest';
import {
  breakdownTaskWithAI,
  determineOptimalStrategy,
  validateBreakdown,
  estimateSubtaskEffort,
} from '../utils/ai-task-breakdown.js';
import type { TaskRecord } from '../utils/indexeddb.js';

describe('AI Task Breakdown', () => {
  const mockTask: TaskRecord = {
    id: 'task-1',
    boardId: 'board-1',
    columnId: 'col-1',
    title: 'Build API feature',
    description: 'Implement REST API for user management',
    status: 'TODO',
    priority: 'HIGH',
    labels: [],
    subtasks: [],
    files: [],
    position: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('breakdownTaskWithAI', () => {
    it('should break down task into subtasks', async () => {
      const result = await breakdownTaskWithAI(mockTask);
      expect(result.subtasks).toBeInstanceOf(Array);
      expect(result.subtasks.length).toBeGreaterThan(0);
      expect(result.strategy).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should respect max subtasks limit', async () => {
      const result = await breakdownTaskWithAI(mockTask, { maxSubtasks: 3 });
      expect(result.subtasks.length).toBeLessThanOrEqual(3);
    });

    it('should ensure minimum subtasks', async () => {
      const result = await breakdownTaskWithAI(mockTask, { minSubtasks: 3 });
      expect(result.subtasks.length).toBeGreaterThanOrEqual(2); // At least 2
    });

    it('should include reasoning', async () => {
      const result = await breakdownTaskWithAI(mockTask);
      expect(result.reasoning).toBeTruthy();
      expect(typeof result.reasoning).toBe('string');
    });

    it('should use specified strategy', async () => {
      const result = await breakdownTaskWithAI(mockTask, {
        strategy: 'BY_COMPONENT',
      });
      expect(result.strategy).toBe('BY_COMPONENT');
    });
  });

  describe('determineOptimalStrategy', () => {
    it('should choose BY_FEATURE for feature tasks', () => {
      const task = { ...mockTask, title: 'Add new feature' };
      const strategy = determineOptimalStrategy(task);
      expect(strategy).toBe('BY_FEATURE');
    });

    it('should choose BY_PHASE for project tasks', () => {
      const task = { ...mockTask, title: 'Complete project milestone' };
      const strategy = determineOptimalStrategy(task);
      expect(strategy).toBe('BY_PHASE');
    });

    it('should choose BY_COMPONENT for API tasks', () => {
      const task = { ...mockTask, title: 'Build API service' };
      const strategy = determineOptimalStrategy(task);
      expect(strategy).toBe('BY_COMPONENT');
    });

    it('should choose BY_COMPLEXITY for critical tasks', () => {
      const task = { ...mockTask, priority: 'CRITICAL' as const };
      const strategy = determineOptimalStrategy(task);
      expect(strategy).toBe('BY_COMPLEXITY');
    });

    it('should default to SEQUENTIAL for simple tasks', () => {
      const task = {
        ...mockTask,
        title: 'Simple task',
        priority: 'LOW' as const,
      };
      const strategy = determineOptimalStrategy(task);
      expect(strategy).toBe('SEQUENTIAL');
    });
  });

  describe('validateBreakdown', () => {
    it('should validate valid breakdown', () => {
      const validBreakdown = {
        subtasks: ['Task 1', 'Task 2', 'Task 3'],
        strategy: 'SEQUENTIAL' as const,
        confidence: 0.8,
      };
      expect(validateBreakdown(validBreakdown)).toBe(true);
    });

    it('should reject empty subtasks', () => {
      const invalidBreakdown = {
        subtasks: [],
        strategy: 'SEQUENTIAL' as const,
        confidence: 0.8,
      };
      expect(validateBreakdown(invalidBreakdown)).toBe(false);
    });

    it('should reject duplicate subtasks', () => {
      const invalidBreakdown = {
        subtasks: ['Task 1', 'Task 1', 'Task 2'],
        strategy: 'SEQUENTIAL' as const,
        confidence: 0.8,
      };
      expect(validateBreakdown(invalidBreakdown)).toBe(false);
    });

    it('should reject empty string subtasks', () => {
      const invalidBreakdown = {
        subtasks: ['Task 1', '', 'Task 2'],
        strategy: 'SEQUENTIAL' as const,
        confidence: 0.8,
      };
      expect(validateBreakdown(invalidBreakdown)).toBe(false);
    });
  });

  describe('estimateSubtaskEffort', () => {
    it('should estimate effort for subtask', () => {
      const effort = estimateSubtaskEffort('Implement feature', mockTask);
      expect(effort).toBeGreaterThan(0);
      expect(typeof effort).toBe('number');
    });

    it('should increase effort for CRITICAL priority', () => {
      const criticalTask = { ...mockTask, priority: 'CRITICAL' as const };
      const criticalEffort = estimateSubtaskEffort(
        'Implement feature',
        criticalTask
      );
      const normalEffort = estimateSubtaskEffort('Implement feature', mockTask);
      expect(criticalEffort).toBeGreaterThan(normalEffort);
    });

    it('should increase effort for research tasks', () => {
      const researchEffort = estimateSubtaskEffort(
        'Research solution',
        mockTask
      );
      const implementEffort = estimateSubtaskEffort('Simple task', mockTask);
      expect(researchEffort).toBeGreaterThan(implementEffort);
    });

    it('should decrease effort for test tasks', () => {
      const testEffort = estimateSubtaskEffort('Test feature', mockTask);
      const implementEffort = estimateSubtaskEffort(
        'Implement feature',
        mockTask
      );
      expect(testEffort).toBeLessThan(implementEffort);
    });
  });
});
