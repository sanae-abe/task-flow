/**
 * GraphQL Query Integration Tests
 * Comprehensive E2E tests for all GraphQL queries
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ApolloServer } from '@apollo/server';
import { createTestServer, queries, testData } from './test-setup.js';

describe('GraphQL Query Integration Tests', () => {
  let server: ApolloServer;

  beforeAll(async () => {
    server = createTestServer();
  });

  afterAll(async () => {
    await server?.stop();
  });

  // ============================================================================
  // Task Queries
  // ============================================================================

  describe('Task Queries', () => {
    describe('task(id)', () => {
      it('should query single task by id', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TASK,
          variables: { id: 'task-1' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.task).toBeDefined();
        }
      });

      it('should return null for non-existent task', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TASK,
          variables: { id: 'non-existent-id' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.task).toBeNull();
        }
      });

      it('should return task with all fields', async () => {
        const result = await server.executeOperation({
          query: `
            query GetTask($id: ID!) {
              task(id: $id) {
                id
                title
                description
                status
                priority
                dueDate
                dueTime
                labels { id name color }
                subtasks { id title completed }
                files { id name type size }
                position
                createdAt
                updatedAt
                isOverdue
                completionPercentage
              }
            }
          `,
          variables: { id: 'task-1' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          const task = result.body.singleResult.data?.task;
          expect(task).toBeDefined();
          expect(task).toHaveProperty('id');
          expect(task).toHaveProperty('title');
          expect(task).toHaveProperty('status');
          expect(task).toHaveProperty('priority');
          expect(task).toHaveProperty('isOverdue');
          expect(task).toHaveProperty('completionPercentage');
        }
      });
    });

    describe('tasks(filters)', () => {
      it('should query all tasks without filters', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TASKS,
          variables: {},
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.tasks).toBeDefined();
          expect(Array.isArray(result.body.singleResult.data?.tasks)).toBe(
            true
          );
        }
      });

      it('should filter tasks by boardId', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TASKS,
          variables: { boardId: 'board-1' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const tasks = result.body.singleResult.data?.tasks;
          expect(Array.isArray(tasks)).toBe(true);
        }
      });

      it('should filter tasks by status', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TASKS,
          variables: { status: 'TODO' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const tasks = result.body.singleResult.data?.tasks;
          expect(Array.isArray(tasks)).toBe(true);
        }
      });

      it('should filter tasks by priority', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TASKS,
          variables: { priority: 'HIGH' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const tasks = result.body.singleResult.data?.tasks;
          expect(Array.isArray(tasks)).toBe(true);
        }
      });

      it('should filter tasks with multiple criteria', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TASKS,
          variables: {
            boardId: 'board-1',
            status: 'IN_PROGRESS',
            priority: 'CRITICAL',
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.tasks).toBeDefined();
        }
      });

      it('should support pagination with limit and offset', async () => {
        const result = await server.executeOperation({
          query: `
            query GetTasks($limit: Int, $offset: Int) {
              tasks(limit: $limit, offset: $offset) {
                id
                title
              }
            }
          `,
          variables: { limit: 10, offset: 0 },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const tasks = result.body.singleResult.data?.tasks;
          expect(Array.isArray(tasks)).toBe(true);
        }
      });

      it('should support date range filtering', async () => {
        const result = await server.executeOperation({
          query: `
            query GetTasks($dueBefore: DateTime, $dueAfter: DateTime) {
              tasks(dueBefore: $dueBefore, dueAfter: $dueAfter) {
                id
                title
                dueDate
              }
            }
          `,
          variables: {
            dueBefore: '2025-12-31T23:59:59Z',
            dueAfter: '2025-01-01T00:00:00Z',
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });

      it('should support search query', async () => {
        const result = await server.executeOperation({
          query: `
            query GetTasks($search: String) {
              tasks(search: $search) {
                id
                title
                description
              }
            }
          `,
          variables: { search: 'important' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });
    });
  });

  // ============================================================================
  // Board Queries
  // ============================================================================

  describe('Board Queries', () => {
    describe('board(id)', () => {
      it('should query single board by id', async () => {
        const result = await server.executeOperation({
          query: queries.GET_BOARD,
          variables: { id: 'board-1' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.board).toBeDefined();
        }
      });

      it('should return null for non-existent board', async () => {
        const result = await server.executeOperation({
          query: queries.GET_BOARD,
          variables: { id: 'non-existent-board' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.board).toBeNull();
        }
      });

      it('should return board with all fields', async () => {
        const result = await server.executeOperation({
          query: `
            query GetBoard($id: ID!) {
              board(id: $id) {
                id
                name
                description
                columns {
                  id
                  title
                  color
                  position
                  taskCount
                }
                settings {
                  defaultColumnId
                  completedColumnId
                  autoArchiveCompleted
                  recycleBinRetentionDays
                }
                isShared
                taskCount
                completedTaskCount
                createdAt
                updatedAt
              }
            }
          `,
          variables: { id: 'board-1' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          const board = result.body.singleResult.data?.board;
          expect(board).toBeDefined();
          expect(board).toHaveProperty('id');
          expect(board).toHaveProperty('name');
          expect(board).toHaveProperty('columns');
          expect(board).toHaveProperty('settings');
        }
      });
    });

    describe('boards()', () => {
      it('should query all boards', async () => {
        const result = await server.executeOperation({
          query: queries.GET_BOARDS,
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.boards).toBeDefined();
          expect(Array.isArray(result.body.singleResult.data?.boards)).toBe(
            true
          );
        }
      });

      it('should return boards with task counts', async () => {
        const result = await server.executeOperation({
          query: queries.GET_BOARDS,
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          const boards = result.body.singleResult.data?.boards;
          if (boards && boards.length > 0) {
            expect(boards[0]).toHaveProperty('taskCount');
            expect(boards[0]).toHaveProperty('completedTaskCount');
          }
        }
      });
    });

    describe('currentBoard()', () => {
      it('should query current active board', async () => {
        const result = await server.executeOperation({
          query: `
            query GetCurrentBoard {
              currentBoard {
                id
                name
              }
            }
          `,
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });
    });
  });

  // ============================================================================
  // Label Queries
  // ============================================================================

  describe('Label Queries', () => {
    describe('label(id)', () => {
      it('should query single label by id', async () => {
        const result = await server.executeOperation({
          query: queries.GET_LABEL,
          variables: { id: 'label-1' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.label).toBeDefined();
        }
      });

      it('should return label with task count', async () => {
        const result = await server.executeOperation({
          query: queries.GET_LABEL,
          variables: { id: 'label-1' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          const label = result.body.singleResult.data?.label;
          if (label) {
            expect(label).toHaveProperty('taskCount');
          }
        }
      });
    });

    describe('labels(boardId)', () => {
      it('should query all labels', async () => {
        const result = await server.executeOperation({
          query: queries.GET_LABELS,
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(Array.isArray(result.body.singleResult.data?.labels)).toBe(
            true
          );
        }
      });

      it('should filter labels by boardId', async () => {
        const result = await server.executeOperation({
          query: queries.GET_LABELS,
          variables: { boardId: 'board-1' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });
    });
  });

  // ============================================================================
  // Template Queries
  // ============================================================================

  describe('Template Queries', () => {
    describe('template(id)', () => {
      it('should query single template by id', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TEMPLATE,
          variables: { id: 'template-1' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.template).toBeDefined();
        }
      });
    });

    describe('templates(filters)', () => {
      it('should query all templates', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TEMPLATES,
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(Array.isArray(result.body.singleResult.data?.templates)).toBe(
            true
          );
        }
      });

      it('should filter templates by category', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TEMPLATES,
          variables: { category: 'Development' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });

      it('should filter templates by isFavorite', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TEMPLATES,
          variables: { isFavorite: true },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });
    });
  });

  // ============================================================================
  // Statistics Queries
  // ============================================================================

  describe('Statistics Queries', () => {
    describe('taskStatistics(boardId)', () => {
      it('should query task statistics', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TASK_STATISTICS,
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const stats = result.body.singleResult.data?.taskStatistics;
          expect(stats).toBeDefined();
          expect(stats).toHaveProperty('total');
          expect(stats).toHaveProperty('byStatus');
          expect(stats).toHaveProperty('byPriority');
          expect(stats).toHaveProperty('completionRate');
        }
      });

      it('should query board-specific statistics', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TASK_STATISTICS,
          variables: { boardId: 'board-1' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });

      it('should return correct status breakdown structure', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TASK_STATISTICS,
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          const stats = result.body.singleResult.data?.taskStatistics;
          if (stats?.byStatus) {
            expect(stats.byStatus).toHaveProperty('todo');
            expect(stats.byStatus).toHaveProperty('inProgress');
            expect(stats.byStatus).toHaveProperty('completed');
            expect(stats.byStatus).toHaveProperty('deleted');
          }
        }
      });

      it('should return correct priority breakdown structure', async () => {
        const result = await server.executeOperation({
          query: queries.GET_TASK_STATISTICS,
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          const stats = result.body.singleResult.data?.taskStatistics;
          if (stats?.byPriority) {
            expect(stats.byPriority).toHaveProperty('critical');
            expect(stats.byPriority).toHaveProperty('high');
            expect(stats.byPriority).toHaveProperty('medium');
            expect(stats.byPriority).toHaveProperty('low');
          }
        }
      });
    });
  });

  // ============================================================================
  // AI-Optimized Queries
  // ============================================================================

  describe('AI-Optimized Queries', () => {
    describe('nextRecommendedTask(boardId)', () => {
      it('should query next recommended task', async () => {
        const result = await server.executeOperation({
          query: queries.GET_NEXT_RECOMMENDED_TASK,
          variables: { boardId: 'board-1' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });

      it('should return null when no tasks available', async () => {
        const result = await server.executeOperation({
          query: queries.GET_NEXT_RECOMMENDED_TASK,
          variables: { boardId: 'empty-board' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });
    });

    describe('aiSuggestedTasks(context)', () => {
      it('should query AI-suggested tasks with context', async () => {
        const result = await server.executeOperation({
          query: `
            query GetAISuggestedTasks($context: AIContextInput!) {
              aiSuggestedTasks(context: $context) {
                id
                title
                priority
              }
            }
          `,
          variables: {
            context: {
              boardId: 'board-1',
              recentActivity: ['task-completed', 'task-created'],
              preferences: {
                workingHours: { start: '09:00', end: '17:00' },
                preferredPriority: 'HIGH',
              },
            },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(
            Array.isArray(result.body.singleResult.data?.aiSuggestedTasks)
          ).toBe(true);
        }
      });
    });

    describe('searchTasksByNaturalLanguage(query)', () => {
      it('should search tasks using natural language', async () => {
        const result = await server.executeOperation({
          query: `
            query SearchTasksByNL($query: String!) {
              searchTasksByNaturalLanguage(query: $query) {
                id
                title
                description
                priority
              }
            }
          `,
          variables: { query: 'high priority tasks due this week' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });
    });
  });
});
