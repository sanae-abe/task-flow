/**
 * AI Natural Language Tests
 */

import { describe, it, expect } from 'vitest';
import {
  parseNaturalLanguageToTask,
  convertToCreateTaskInput,
  extractEntities,
  suggestLabels,
  extractActionItems,
  normalizeDate,
} from '../utils/ai-natural-language.js';

describe('AI Natural Language', () => {
  describe('parseNaturalLanguageToTask', () => {
    it('should parse simple task query', async () => {
      const result = await parseNaturalLanguageToTask('Write documentation');
      expect(result.title).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.extractedEntities).toBeInstanceOf(Array);
    });

    it('should parse task with priority', async () => {
      const result = await parseNaturalLanguageToTask(
        'urgent: fix production bug'
      );
      expect(result.priority).toBe('CRITICAL');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should parse task with due date', async () => {
      const result = await parseNaturalLanguageToTask(
        'Complete report by tomorrow'
      );
      expect(result.dueDate).toBeTruthy();
      expect(result.dueTime).toBeTruthy();
    });

    it('should extract multiple entities', async () => {
      const result = await parseNaturalLanguageToTask(
        'urgent: send email to client today at 3pm'
      );
      expect(result.extractedEntities.length).toBeGreaterThan(0);
      expect(result.priority).toBe('CRITICAL');
      expect(result.dueDate).toBeTruthy();
    });

    it('should handle low priority tasks', async () => {
      const result = await parseNaturalLanguageToTask(
        'low priority cleanup whenever'
      );
      expect(result.priority).toBe('LOW');
    });
  });

  describe('convertToCreateTaskInput', () => {
    it('should convert parsed task to input', () => {
      const parsed = {
        title: 'Test task',
        description: 'Test description',
        priority: 'HIGH' as const,
        dueDate: new Date(),
        labels: ['test'],
        subtasks: ['Subtask 1'],
        confidence: 0.8,
        extractedEntities: [],
      };

      const input = convertToCreateTaskInput(parsed, {
        defaultBoardId: 'board-1',
        defaultColumnId: 'todo',
      });

      expect(input.boardId).toBe('board-1');
      expect(input.columnId).toBe('todo');
      expect(input.title).toBe('Test task');
      expect(input.priority).toBe('HIGH');
    });

    it('should include subtasks when requested', () => {
      const parsed = {
        title: 'Test task',
        subtasks: ['Sub 1', 'Sub 2'],
        confidence: 0.7,
        extractedEntities: [],
      };

      const input = convertToCreateTaskInput(parsed, {
        defaultBoardId: 'board-1',
        defaultColumnId: 'todo',
        includeSubtasks: true,
      });

      expect(input.subtasks).toBeDefined();
      expect(input.subtasks?.length).toBe(2);
    });

    it('should use default priority when not specified', () => {
      const parsed = {
        title: 'Test task',
        confidence: 0.7,
        extractedEntities: [],
      };

      const input = convertToCreateTaskInput(parsed, {
        defaultBoardId: 'board-1',
        defaultColumnId: 'todo',
      });

      expect(input.priority).toBe('MEDIUM');
    });
  });

  describe('extractEntities', () => {
    it('should extract date entities', () => {
      const entities = extractEntities('Complete by tomorrow');
      const dateEntities = entities.filter(e => e.type === 'date');
      expect(dateEntities.length).toBeGreaterThan(0);
    });

    it('should extract time entities', () => {
      const entities = extractEntities('Meeting at 3:00 pm');
      const timeEntities = entities.filter(e => e.type === 'time');
      expect(timeEntities.length).toBeGreaterThan(0);
    });

    it('should extract priority entities', () => {
      const entities = extractEntities('urgent task');
      const priorityEntities = entities.filter(e => e.type === 'priority');
      expect(priorityEntities.length).toBeGreaterThan(0);
    });

    it('should extract action entities', () => {
      const entities = extractEntities('create and build new feature');
      const actionEntities = entities.filter(e => e.type === 'action');
      expect(actionEntities.length).toBeGreaterThan(0);
    });

    it('should include entity positions', () => {
      const entities = extractEntities('urgent task tomorrow');
      entities.forEach(entity => {
        expect(entity.position).toBeGreaterThanOrEqual(0);
      });
    });

    it('should sort entities by position', () => {
      const entities = extractEntities('tomorrow urgent task');
      for (let i = 1; i < entities.length; i++) {
        expect(entities[i].position).toBeGreaterThanOrEqual(
          entities[i - 1].position
        );
      }
    });
  });

  describe('suggestLabels', () => {
    it('should suggest bug labels', () => {
      const labels = suggestLabels('fix bug in authentication');
      expect(labels).toContain('bug');
    });

    it('should suggest feature labels', () => {
      const labels = suggestLabels('add new feature to dashboard');
      expect(labels).toContain('feature');
    });

    it('should suggest documentation labels', () => {
      const labels = suggestLabels('write docs for API');
      expect(labels).toContain('documentation');
    });

    it('should suggest multiple labels', () => {
      const labels = suggestLabels('fix bug and add test');
      expect(labels.length).toBeGreaterThan(1);
    });

    it('should remove duplicate labels', () => {
      const labels = suggestLabels('fix bug, another bug fix');
      const uniqueLabels = new Set(labels);
      expect(labels.length).toBe(uniqueLabels.size);
    });
  });

  describe('extractActionItems', () => {
    it('should extract dash-prefixed items', () => {
      const items = extractActionItems('- Item 1\n- Item 2\n- Item 3');
      expect(items.length).toBe(3);
    });

    it('should extract numbered items', () => {
      const items = extractActionItems('1. First\n2. Second\n3. Third');
      expect(items.length).toBe(3);
    });

    it('should extract checkbox items', () => {
      const items = extractActionItems('[ ] Task 1\n[x] Task 2\n[ ] Task 3');
      expect(items.length).toBe(3);
    });

    it('should ignore non-list lines', () => {
      const items = extractActionItems('Regular text\n- List item\nMore text');
      expect(items.length).toBe(1);
    });

    it('should handle mixed list markers', () => {
      const items = extractActionItems('- Dash item\n* Star item\n+ Plus item');
      expect(items.length).toBe(3);
    });
  });

  describe('normalizeDate', () => {
    it('should normalize "today"', () => {
      const date = normalizeDate('today');
      expect(date).toBeTruthy();
      expect(date?.toDateString()).toBe(new Date().toDateString());
    });

    it('should normalize "tomorrow"', () => {
      const date = normalizeDate('tomorrow');
      expect(date).toBeTruthy();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(date?.toDateString()).toBe(tomorrow.toDateString());
    });

    it('should normalize "next week"', () => {
      const date = normalizeDate('next week');
      expect(date).toBeTruthy();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      expect(date?.toDateString()).toBe(nextWeek.toDateString());
    });

    it('should parse ISO date', () => {
      const dateStr = '2025-12-31';
      const date = normalizeDate(dateStr);
      expect(date).toBeTruthy();
      expect(date?.getFullYear()).toBe(2025);
      expect(date?.getMonth()).toBe(11); // December
    });

    it('should return null for invalid date', () => {
      const date = normalizeDate('invalid date');
      expect(date).toBeNull();
    });
  });
});
