/**
 * AI Helpers Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildUserContext,
  extractWorkingHours,
  determinePreferredPriority,
  detectComplexity,
  shouldBreakdown,
  extractTaskKeywords,
  isConfidenceAcceptable,
  validateAIResponse,
  formatConfidence,
  formatDuration,
  cacheAIResponse,
  getCachedAIResponse,
  clearAICache,
  safeAIOperation,
  getAIMetrics,
  resetAIMetrics,
  trackAIMetrics,
} from '../utils/ai-helpers.js';
import type { TaskRecord } from '../utils/indexeddb.js';

describe('AI Helpers', () => {
  const mockCompletedTask: TaskRecord = {
    id: 'task-1',
    boardId: 'board-1',
    columnId: 'col-1',
    title: 'Completed task',
    description: 'Task description',
    status: 'COMPLETED',
    priority: 'HIGH',
    labels: [],
    subtasks: [],
    files: [],
    position: 0,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    clearAICache();
    resetAIMetrics();
  });

  describe('buildUserContext', () => {
    it('should build context from completed tasks', () => {
      const context = buildUserContext([mockCompletedTask]);
      expect(context.completionHistory).toBeTruthy();
      expect(context.completionHistory?.length).toBe(1);
    });

    it('should calculate task duration', () => {
      const context = buildUserContext([mockCompletedTask]);
      expect(context.completionHistory?.[0].duration).toBeGreaterThan(0);
    });

    it('should extract time of day', () => {
      const context = buildUserContext([mockCompletedTask]);
      const timeOfDay = context.completionHistory?.[0].timeOfDay;
      expect(timeOfDay).toBeGreaterThanOrEqual(0);
      expect(timeOfDay).toBeLessThan(24);
    });

    it('should handle empty task list', () => {
      const context = buildUserContext([]);
      expect(context.completionHistory).toEqual([]);
    });

    it('should filter tasks without completion dates', () => {
      const incompleteTask = { ...mockCompletedTask, completedAt: undefined };
      const context = buildUserContext([incompleteTask]);
      expect(context.completionHistory).toEqual([]);
    });
  });

  describe('extractWorkingHours', () => {
    it('should extract working hours from history', () => {
      const history = [{ timeOfDay: 9 }, { timeOfDay: 10 }, { timeOfDay: 16 }];
      const hours = extractWorkingHours(history);
      expect(hours).toBeTruthy();
      expect(hours?.start).toBe('09:00');
      expect(hours?.end).toBe('16:00');
    });

    it('should return undefined for empty history', () => {
      const hours = extractWorkingHours([]);
      expect(hours).toBeUndefined();
    });

    it('should handle single entry', () => {
      const hours = extractWorkingHours([{ timeOfDay: 10 }]);
      expect(hours?.start).toBe('10:00');
      expect(hours?.end).toBe('10:00');
    });
  });

  describe('determinePreferredPriority', () => {
    it('should determine most frequent priority', () => {
      const tasks = [
        { ...mockCompletedTask, priority: 'HIGH' as const },
        { ...mockCompletedTask, priority: 'HIGH' as const },
        { ...mockCompletedTask, priority: 'MEDIUM' as const },
      ];
      const priority = determinePreferredPriority(tasks);
      expect(priority).toBe('HIGH');
    });

    it('should return undefined for empty list', () => {
      const priority = determinePreferredPriority([]);
      expect(priority).toBeUndefined();
    });
  });

  describe('detectComplexity', () => {
    it('should detect simple tasks', () => {
      const simpleTask = {
        ...mockCompletedTask,
        subtasks: [],
        description: 'Simple',
      };
      const complexity = detectComplexity(simpleTask);
      expect(complexity).toBe('simple');
    });

    it('should detect complex tasks', () => {
      const complexTask = {
        ...mockCompletedTask,
        subtasks: Array(8).fill({
          id: '1',
          title: 'Sub',
          completed: false,
          position: 0,
          createdAt: new Date().toISOString(),
        }),
        description: 'A'.repeat(600),
        priority: 'CRITICAL' as const,
      };
      const complexity = detectComplexity(complexTask);
      expect(complexity).toMatch(/complex|very_complex/);
    });

    it('should detect moderate complexity', () => {
      const moderateTask = {
        ...mockCompletedTask,
        subtasks: Array(3).fill({
          id: '1',
          title: 'Sub',
          completed: false,
          position: 0,
          createdAt: new Date().toISOString(),
        }),
        description: 'Medium length description',
      };
      const complexity = detectComplexity(moderateTask);
      expect(complexity).toBe('moderate');
    });
  });

  describe('shouldBreakdown', () => {
    it('should recommend breakdown for complex tasks', () => {
      const complexTask = {
        ...mockCompletedTask,
        subtasks: [],
        description: 'A'.repeat(600),
      };
      const result = shouldBreakdown(complexTask);
      expect(result.shouldBreak).toBe(true);
    });

    it('should not recommend breakdown for simple tasks', () => {
      const simpleTask = {
        ...mockCompletedTask,
        subtasks: [],
        description: 'Simple',
      };
      const result = shouldBreakdown(simpleTask);
      expect(result.shouldBreak).toBe(false);
    });

    it('should not recommend breakdown for tasks with many subtasks', () => {
      const taskWithSubs = {
        ...mockCompletedTask,
        subtasks: Array(6).fill({
          id: '1',
          title: 'Sub',
          completed: false,
          position: 0,
          createdAt: new Date().toISOString(),
        }),
      };
      const result = shouldBreakdown(taskWithSubs);
      expect(result.shouldBreak).toBe(false);
    });

    it('should provide reasoning', () => {
      const result = shouldBreakdown(mockCompletedTask);
      expect(result.reason).toBeTruthy();
    });
  });

  describe('extractTaskKeywords', () => {
    it('should extract technical keywords', () => {
      const task = { ...mockCompletedTask, title: 'Build API backend' };
      const keywords = extractTaskKeywords(task);
      expect(keywords).toContain('api');
      expect(keywords).toContain('backend');
    });

    it('should extract action keywords', () => {
      const task = { ...mockCompletedTask, title: 'Create and test feature' };
      const keywords = extractTaskKeywords(task);
      expect(keywords).toContain('create');
      expect(keywords).toContain('test');
    });

    it('should return unique keywords', () => {
      const task = { ...mockCompletedTask, title: 'test test test' };
      const keywords = extractTaskKeywords(task);
      const uniqueKeywords = new Set(keywords);
      expect(keywords.length).toBe(uniqueKeywords.size);
    });

    it('should handle empty task', () => {
      const task = { ...mockCompletedTask, title: '', description: '' };
      const keywords = extractTaskKeywords(task);
      expect(keywords).toBeInstanceOf(Array);
    });
  });

  describe('isConfidenceAcceptable', () => {
    it('should accept confidence >= 0.5', () => {
      expect(isConfidenceAcceptable(0.5)).toBe(true);
      expect(isConfidenceAcceptable(0.8)).toBe(true);
    });

    it('should reject confidence < 0.5', () => {
      expect(isConfidenceAcceptable(0.4)).toBe(false);
      expect(isConfidenceAcceptable(0.2)).toBe(false);
    });
  });

  describe('validateAIResponse', () => {
    it('should validate good response', () => {
      const result = validateAIResponse({ data: 'test' }, 0.8);
      expect(result.valid).toBe(true);
    });

    it('should reject null response', () => {
      const result = validateAIResponse(null, 0.8);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Empty');
    });

    it('should reject low confidence', () => {
      const result = validateAIResponse({ data: 'test' }, 0.3);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('confidence');
    });
  });

  describe('formatConfidence', () => {
    it('should format high confidence', () => {
      const formatted = formatConfidence(0.95);
      expect(formatted).toContain('Very High');
    });

    it('should format medium confidence', () => {
      const formatted = formatConfidence(0.6);
      expect(formatted).toContain('Medium');
    });

    it('should format low confidence', () => {
      const formatted = formatConfidence(0.3);
      expect(formatted).toContain('Low');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes', () => {
      expect(formatDuration(45)).toBe('45m');
    });

    it('should format hours', () => {
      expect(formatDuration(120)).toBe('2h');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m');
    });
  });

  describe('AI Cache', () => {
    it('should cache and retrieve response', () => {
      const data = { test: 'data' };
      cacheAIResponse('test-key', data);
      const cached = getCachedAIResponse('test-key');
      expect(cached).toEqual(data);
    });

    it('should return null for non-existent key', () => {
      const cached = getCachedAIResponse('non-existent');
      expect(cached).toBeNull();
    });

    it('should clear cache', () => {
      cacheAIResponse('test-key', { data: 'test' });
      clearAICache();
      const cached = getCachedAIResponse('test-key');
      expect(cached).toBeNull();
    });
  });

  describe('safeAIOperation', () => {
    it('should return result on success', async () => {
      const result = await safeAIOperation(async () => 'success', 'fallback');
      expect(result).toBe('success');
    });

    it('should return fallback on error', async () => {
      const result = await safeAIOperation(async () => {
        throw new Error('test');
      }, 'fallback');
      expect(result).toBe('fallback');
    });
  });

  describe('AI Metrics', () => {
    it('should track success metrics', () => {
      trackAIMetrics(true, 0.8, 100);
      const metrics = getAIMetrics();
      expect(metrics.successCount).toBe(1);
      expect(metrics.failureCount).toBe(0);
    });

    it('should track failure metrics', () => {
      trackAIMetrics(false, 0.5, 200);
      const metrics = getAIMetrics();
      expect(metrics.successCount).toBe(0);
      expect(metrics.failureCount).toBe(1);
    });

    it('should calculate average confidence', () => {
      trackAIMetrics(true, 0.8, 100);
      trackAIMetrics(true, 0.6, 100);
      const metrics = getAIMetrics();
      expect(metrics.averageConfidence).toBe(0.7);
    });

    it('should reset metrics', () => {
      trackAIMetrics(true, 0.8, 100);
      resetAIMetrics();
      const metrics = getAIMetrics();
      expect(metrics.operationCount).toBe(0);
    });
  });
});
