/**
 * AI Tools Test Suite
 * Week 5 Day 32-33: AI-powered task management tools
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  handleBreakdownTask,
  handleCreateTaskFromNaturalLanguage,
  handleOptimizeSchedule,
  handleGetRecommendedTask,
} from '../tools/ai-tools.js';
import { db } from '../../utils/indexeddb.js';

describe('AI Tools', () => {
  let testBoardId: string;
  let testTaskId: string;

  beforeEach(async () => {
    // Create test board
    const board = await db.addBoard({
      id: crypto.randomUUID(),
      name: 'Test Board',
      columns: [
        { id: crypto.randomUUID(), name: 'To Do', position: 0 },
        { id: crypto.randomUUID(), name: 'In Progress', position: 1 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    testBoardId = board.id;

    // Create test task
    const task = await db.addTask({
      id: crypto.randomUUID(),
      title: 'Implement user authentication system',
      description: 'Build a complete authentication system with JWT tokens',
      boardId: testBoardId,
      columnId: board.columns[0].id,
      status: 'PENDING',
      priority: 'HIGH',
      labels: [],
      subtasks: [],
      files: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    testTaskId = task.id;
  });

  describe('breakdown_task', () => {
    it('should break down a task into subtasks', async () => {
      const result = await handleBreakdownTask({
        taskId: testTaskId,
        strategy: 'SEQUENTIAL',
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.parentTask.id).toBe(testTaskId);
      expect(data.strategy).toBe('SEQUENTIAL');
      expect(data.subtasksCreated).toBeGreaterThan(0);
      expect(data.subtasks).toBeInstanceOf(Array);
    });

    it('should use default HYBRID strategy if not specified', async () => {
      const result = await handleBreakdownTask({
        taskId: testTaskId,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.strategy).toBe('HYBRID');
    });

    it('should handle non-existent task', async () => {
      const result = await handleBreakdownTask({
        taskId: 'non-existent-id',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });

    it('should support all breakdown strategies', async () => {
      const strategies = [
        'SEQUENTIAL',
        'PARALLEL',
        'HYBRID',
        'BY_FEATURE',
        'BY_PHASE',
        'BY_COMPONENT',
        'BY_COMPLEXITY',
      ];

      for (const strategy of strategies) {
        const result = await handleBreakdownTask({
          taskId: testTaskId,
          strategy: strategy as any,
        });

        const data = JSON.parse(result.content[0].text);
        expect(data.success).toBe(true);
        expect(data.strategy).toBe(strategy);
      }
    });
  });

  describe('create_task_from_natural_language', () => {
    it('should create task from natural language', async () => {
      const result = await handleCreateTaskFromNaturalLanguage({
        query: 'Create a high priority task to fix login bug by tomorrow',
        boardId: testBoardId,
      });

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.task).toBeDefined();
      expect(data.task.title).toBeDefined();
      expect(data.task.priority).toBeDefined();
      expect(data.parsedFrom).toBe(
        'Create a high priority task to fix login bug by tomorrow'
      );
    });

    it('should use specified column if provided', async () => {
      const board = await db.getBoard(testBoardId);
      const columnId = board!.columns[1].id;

      const result = await handleCreateTaskFromNaturalLanguage({
        query: 'Write documentation',
        boardId: testBoardId,
        columnId,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
    });

    it('should handle invalid board ID', async () => {
      const result = await handleCreateTaskFromNaturalLanguage({
        query: 'Test task',
        boardId: 'invalid-board-id',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });

  describe('optimize_schedule', () => {
    it('should optimize board schedule', async () => {
      // Create multiple tasks for optimization
      const board = await db.getBoard(testBoardId);
      for (let i = 0; i < 3; i++) {
        await db.addTask({
          id: crypto.randomUUID(),
          title: `Task ${i + 1}`,
          boardId: testBoardId,
          columnId: board!.columns[0].id,
          status: 'PENDING',
          priority: 'MEDIUM',
          estimatedHours: 4 + i,
          labels: [],
          subtasks: [],
          files: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      const result = await handleOptimizeSchedule({
        boardId: testBoardId,
        workHoursPerDay: 8,
        teamSize: 2,
      });

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.optimization).toBeDefined();
      expect(data.optimization.workHoursPerDay).toBe(8);
      expect(data.optimization.teamSize).toBe(2);
      expect(data.schedule).toBeInstanceOf(Array);
    });

    it('should use default work hours if not specified', async () => {
      const result = await handleOptimizeSchedule({
        boardId: testBoardId,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.optimization.workHoursPerDay).toBe(8);
      expect(data.optimization.teamSize).toBe(1);
    });

    it('should handle empty board', async () => {
      const emptyBoard = await db.addBoard({
        id: crypto.randomUUID(),
        name: 'Empty Board',
        columns: [{ id: crypto.randomUUID(), name: 'To Do', position: 0 }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const result = await handleOptimizeSchedule({
        boardId: emptyBoard.id,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.optimization.totalTasks).toBe(0);
    });
  });

  describe('get_recommended_task', () => {
    it('should get recommended next task', async () => {
      // Create multiple tasks with different priorities
      const board = await db.getBoard(testBoardId);
      await db.addTask({
        id: crypto.randomUUID(),
        title: 'Critical Bug Fix',
        boardId: testBoardId,
        columnId: board!.columns[0].id,
        status: 'PENDING',
        priority: 'CRITICAL',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        labels: [],
        subtasks: [],
        files: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const result = await handleGetRecommendedTask({
        boardId: testBoardId,
      });

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.recommendation).toBeDefined();
      expect(data.recommendation.taskId).toBeDefined();
      expect(data.recommendation.taskTitle).toBeDefined();
      expect(data.recommendation.reason).toBeDefined();
    });

    it('should accept optional context', async () => {
      const result = await handleGetRecommendedTask({
        boardId: testBoardId,
        context: 'backend development',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.context).toBe('backend development');
    });

    it('should handle board with no tasks', async () => {
      const emptyBoard = await db.addBoard({
        id: crypto.randomUUID(),
        name: 'Empty Board',
        columns: [{ id: crypto.randomUUID(), name: 'To Do', position: 0 }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const result = await handleGetRecommendedTask({
        boardId: emptyBoard.id,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
    });
  });
});
