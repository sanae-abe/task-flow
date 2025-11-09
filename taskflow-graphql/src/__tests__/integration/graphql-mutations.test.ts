/**
 * GraphQL Mutation Integration Tests
 * Comprehensive E2E tests for all GraphQL mutations
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ApolloServer } from '@apollo/server';
import { createTestServer, mutations, testData } from './test-setup.js';

describe('GraphQL Mutation Integration Tests', () => {
  let server: ApolloServer;

  beforeAll(async () => {
    server = createTestServer();
  });

  afterAll(async () => {
    await server?.stop();
  });

  // ============================================================================
  // Task Mutations
  // ============================================================================

  describe('Task Mutations', () => {
    describe('createTask(input)', () => {
      it('should create a new task', async () => {
        const taskInput = testData.createTask({
          title: 'Integration Test Task',
          priority: 'HIGH',
        });

        const result = await server.executeOperation({
          query: mutations.CREATE_TASK,
          variables: { input: taskInput },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const task = result.body.singleResult.data?.createTask;
          expect(task).toBeDefined();
          expect(task?.title).toBe('Integration Test Task');
          expect(task?.priority).toBe('HIGH');
        }
      });

      it('should create task with subtasks', async () => {
        const taskInput = testData.createTask({
          title: 'Task with Subtasks',
          subtasks: [
            testData.createSubTask({ title: 'Subtask 1', position: 0 }),
            testData.createSubTask({ title: 'Subtask 2', position: 1 }),
          ],
        });

        const result = await server.executeOperation({
          query: mutations.CREATE_TASK,
          variables: { input: taskInput },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });

      it('should create task with recurrence', async () => {
        const taskInput = testData.createTask({
          title: 'Recurring Task',
          recurrence: {
            enabled: true,
            pattern: 'DAILY',
            interval: 1,
          },
        });

        const result = await server.executeOperation({
          query: mutations.CREATE_TASK,
          variables: { input: taskInput },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });

      it('should return error for invalid input', async () => {
        const result = await server.executeOperation({
          query: mutations.CREATE_TASK,
          variables: {
            input: {
              // Missing required fields
              title: '',
            },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeDefined();
        }
      });
    });

    describe('updateTask(id, input)', () => {
      it('should update task title', async () => {
        const result = await server.executeOperation({
          query: mutations.UPDATE_TASK,
          variables: {
            id: 'task-1',
            input: { title: 'Updated Title' },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const task = result.body.singleResult.data?.updateTask;
          expect(task?.title).toBe('Updated Title');
        }
      });

      it('should update task status', async () => {
        const result = await server.executeOperation({
          query: mutations.UPDATE_TASK,
          variables: {
            id: 'task-1',
            input: { status: 'COMPLETED' },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });

      it('should update task priority', async () => {
        const result = await server.executeOperation({
          query: mutations.UPDATE_TASK,
          variables: {
            id: 'task-1',
            input: { priority: 'CRITICAL' },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });

      it('should update multiple fields at once', async () => {
        const result = await server.executeOperation({
          query: mutations.UPDATE_TASK,
          variables: {
            id: 'task-1',
            input: {
              title: 'Multi-field Update',
              description: 'Updated description',
              priority: 'HIGH',
              status: 'IN_PROGRESS',
            },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });

      it('should return error for non-existent task', async () => {
        const result = await server.executeOperation({
          query: mutations.UPDATE_TASK,
          variables: {
            id: 'non-existent-task',
            input: { title: 'Updated' },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeDefined();
        }
      });
    });

    describe('deleteTask(id)', () => {
      it('should delete a task', async () => {
        const result = await server.executeOperation({
          query: mutations.DELETE_TASK,
          variables: { id: 'task-to-delete' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.deleteTask).toBe(true);
        }
      });

      it('should return error for non-existent task', async () => {
        const result = await server.executeOperation({
          query: mutations.DELETE_TASK,
          variables: { id: 'non-existent-task' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeDefined();
        }
      });
    });

    describe('restoreTask(id)', () => {
      it('should restore a deleted task', async () => {
        const result = await server.executeOperation({
          query: mutations.RESTORE_TASK,
          variables: { id: 'deleted-task' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const task = result.body.singleResult.data?.restoreTask;
          expect(task).toBeDefined();
        }
      });
    });

    describe('moveTask(id, targetColumnId, targetPosition)', () => {
      it('should move task to different column', async () => {
        const result = await server.executeOperation({
          query: mutations.MOVE_TASK,
          variables: {
            id: 'task-1',
            targetColumnId: 'col-2',
            targetPosition: 0,
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const task = result.body.singleResult.data?.moveTask;
          expect(task?.columnId).toBe('col-2');
          expect(task?.position).toBe(0);
        }
      });

      it('should reorder task within same column', async () => {
        const result = await server.executeOperation({
          query: mutations.MOVE_TASK,
          variables: {
            id: 'task-1',
            targetColumnId: 'col-1',
            targetPosition: 3,
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });
    });

    describe('duplicateTask(id)', () => {
      it('should duplicate a task', async () => {
        const result = await server.executeOperation({
          query: mutations.DUPLICATE_TASK,
          variables: { id: 'task-1' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const duplicatedTask = result.body.singleResult.data?.duplicateTask;
          expect(duplicatedTask).toBeDefined();
          expect(duplicatedTask?.id).not.toBe('task-1');
        }
      });
    });
  });

  // ============================================================================
  // Batch Mutations
  // ============================================================================

  describe('Batch Mutations', () => {
    describe('createTasks(inputs)', () => {
      it('should create multiple tasks at once', async () => {
        const inputs = [
          testData.createTask({ title: 'Batch Task 1' }),
          testData.createTask({ title: 'Batch Task 2' }),
          testData.createTask({ title: 'Batch Task 3' }),
        ];

        const result = await server.executeOperation({
          query: mutations.CREATE_TASKS,
          variables: { inputs },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const tasks = result.body.singleResult.data?.createTasks;
          expect(Array.isArray(tasks)).toBe(true);
          expect(tasks?.length).toBe(3);
        }
      });

      it('should handle empty input array', async () => {
        const result = await server.executeOperation({
          query: mutations.CREATE_TASKS,
          variables: { inputs: [] },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          const tasks = result.body.singleResult.data?.createTasks;
          expect(Array.isArray(tasks)).toBe(true);
          expect(tasks?.length).toBe(0);
        }
      });
    });

    describe('updateTasks(ids, input)', () => {
      it('should update multiple tasks with same changes', async () => {
        const result = await server.executeOperation({
          query: mutations.UPDATE_TASKS,
          variables: {
            ids: ['task-1', 'task-2', 'task-3'],
            input: { priority: 'HIGH', status: 'IN_PROGRESS' },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const tasks = result.body.singleResult.data?.updateTasks;
          expect(Array.isArray(tasks)).toBe(true);
        }
      });
    });

    describe('deleteTasks(ids)', () => {
      it('should delete multiple tasks at once', async () => {
        const result = await server.executeOperation({
          query: mutations.DELETE_TASKS,
          variables: {
            ids: ['task-del-1', 'task-del-2'],
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.deleteTasks).toBe(true);
        }
      });
    });
  });

  // ============================================================================
  // Board Mutations
  // ============================================================================

  describe('Board Mutations', () => {
    describe('createBoard(input)', () => {
      it('should create a new board', async () => {
        const boardInput = testData.createBoard({
          name: 'New Project Board',
          description: 'Board for new project',
        });

        const result = await server.executeOperation({
          query: mutations.CREATE_BOARD,
          variables: { input: boardInput },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const board = result.body.singleResult.data?.createBoard;
          expect(board).toBeDefined();
          expect(board?.name).toBe('New Project Board');
        }
      });

      it('should create board with custom columns', async () => {
        const boardInput = testData.createBoard({
          name: 'Custom Board',
          columns: [
            { id: 'custom-1', title: 'Backlog', color: '#e0e0e0', position: 0 },
            { id: 'custom-2', title: 'Active', color: '#4caf50', position: 1 },
          ],
        });

        const result = await server.executeOperation({
          query: mutations.CREATE_BOARD,
          variables: { input: boardInput },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });
    });

    describe('updateBoard(id, input)', () => {
      it('should update board name', async () => {
        const result = await server.executeOperation({
          query: mutations.UPDATE_BOARD,
          variables: {
            id: 'board-1',
            input: { name: 'Updated Board Name' },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });

      it('should update board settings', async () => {
        const result = await server.executeOperation({
          query: mutations.UPDATE_BOARD,
          variables: {
            id: 'board-1',
            input: {
              settings: {
                defaultColumnId: 'col-1',
                autoArchiveCompleted: true,
                recycleBinRetentionDays: 30,
              },
            },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });
    });

    describe('deleteBoard(id)', () => {
      it('should delete a board', async () => {
        const result = await server.executeOperation({
          query: mutations.DELETE_BOARD,
          variables: { id: 'board-to-delete' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.deleteBoard).toBe(true);
        }
      });
    });
  });

  // ============================================================================
  // Label Mutations
  // ============================================================================

  describe('Label Mutations', () => {
    describe('createLabel(input)', () => {
      it('should create a new label', async () => {
        const labelInput = testData.createLabel({
          name: 'Priority',
          color: '#ff0000',
        });

        const result = await server.executeOperation({
          query: mutations.CREATE_LABEL,
          variables: { input: labelInput },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const label = result.body.singleResult.data?.createLabel;
          expect(label?.name).toBe('Priority');
          expect(label?.color).toBe('#ff0000');
        }
      });
    });

    describe('updateLabel(id, input)', () => {
      it('should update label name', async () => {
        const result = await server.executeOperation({
          query: mutations.UPDATE_LABEL,
          variables: {
            id: 'label-1',
            input: { name: 'Updated Label' },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });

      it('should update label color', async () => {
        const result = await server.executeOperation({
          query: mutations.UPDATE_LABEL,
          variables: {
            id: 'label-1',
            input: { color: '#00ff00' },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });
    });

    describe('deleteLabel(id)', () => {
      it('should delete a label', async () => {
        const result = await server.executeOperation({
          query: mutations.DELETE_LABEL,
          variables: { id: 'label-to-delete' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.deleteLabel).toBe(true);
        }
      });
    });
  });

  // ============================================================================
  // Template Mutations
  // ============================================================================

  describe('Template Mutations', () => {
    describe('createTemplate(input)', () => {
      it('should create a new template', async () => {
        const templateInput = testData.createTemplate({
          name: 'Bug Fix Template',
          category: 'Development',
        });

        const result = await server.executeOperation({
          query: mutations.CREATE_TEMPLATE,
          variables: { input: templateInput },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const template = result.body.singleResult.data?.createTemplate;
          expect(template?.name).toBe('Bug Fix Template');
        }
      });

      it('should create favorite template', async () => {
        const templateInput = testData.createTemplate({
          name: 'Favorite Template',
          isFavorite: true,
        });

        const result = await server.executeOperation({
          query: mutations.CREATE_TEMPLATE,
          variables: { input: templateInput },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });
    });

    describe('updateTemplate(id, input)', () => {
      it('should update template name', async () => {
        const result = await server.executeOperation({
          query: mutations.UPDATE_TEMPLATE,
          variables: {
            id: 'template-1',
            input: { name: 'Updated Template Name' },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });

      it('should toggle favorite status', async () => {
        const result = await server.executeOperation({
          query: mutations.UPDATE_TEMPLATE,
          variables: {
            id: 'template-1',
            input: { isFavorite: true },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });
    });

    describe('deleteTemplate(id)', () => {
      it('should delete a template', async () => {
        const result = await server.executeOperation({
          query: mutations.DELETE_TEMPLATE,
          variables: { id: 'template-to-delete' },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.deleteTemplate).toBe(true);
        }
      });
    });
  });

  // ============================================================================
  // AI-Driven Mutations
  // ============================================================================

  describe('AI-Driven Mutations', () => {
    describe('createTaskFromNaturalLanguage(query, context)', () => {
      it('should create task from natural language', async () => {
        const result = await server.executeOperation({
          query: mutations.CREATE_TASK_FROM_NL,
          variables: {
            query: 'Create a high priority task to fix login bug by Friday',
            context: {
              boardId: 'board-1',
            },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const task =
            result.body.singleResult.data?.createTaskFromNaturalLanguage;
          expect(task).toBeDefined();
        }
      });

      it('should create task with AI-inferred priority', async () => {
        const result = await server.executeOperation({
          query: mutations.CREATE_TASK_FROM_NL,
          variables: {
            query: 'urgent security vulnerability needs immediate attention',
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });
    });

    describe('breakdownTask(taskId, strategy)', () => {
      it('should breakdown task by feature', async () => {
        const result = await server.executeOperation({
          query: mutations.BREAKDOWN_TASK,
          variables: {
            taskId: 'complex-task',
            strategy: 'BY_FEATURE',
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const subtasks = result.body.singleResult.data?.breakdownTask;
          expect(Array.isArray(subtasks)).toBe(true);
        }
      });

      it('should breakdown task by complexity', async () => {
        const result = await server.executeOperation({
          query: mutations.BREAKDOWN_TASK,
          variables: {
            taskId: 'complex-task',
            strategy: 'BY_COMPLEXITY',
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
        }
      });
    });

    describe('optimizeTaskSchedule(boardId, constraints)', () => {
      it('should optimize task schedule with constraints', async () => {
        const result = await server.executeOperation({
          query: mutations.OPTIMIZE_SCHEDULE,
          variables: {
            boardId: 'board-1',
            constraints: {
              workingHoursPerDay: 8,
              deadline: '2025-12-31T23:59:59Z',
              prioritizeBy: 'CRITICAL',
            },
          },
        });

        expect(result.body.kind).toBe('single');
        if (result.body.kind === 'single') {
          expect(result.body.singleResult.errors).toBeUndefined();
          const optimization =
            result.body.singleResult.data?.optimizeTaskSchedule;
          expect(optimization).toBeDefined();
          expect(optimization).toHaveProperty('optimizedTasks');
          expect(optimization).toHaveProperty('estimatedCompletionDate');
          expect(optimization).toHaveProperty('suggestions');
        }
      });
    });
  });
});
