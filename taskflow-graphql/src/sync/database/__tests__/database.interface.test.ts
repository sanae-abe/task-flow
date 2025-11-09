/**
 * Database Interface Integration Test
 * Database抽象化インターフェースの統合テスト
 *
 * **テスト戦略**:
 * - MockDatabase実装でインターフェース仕様を検証
 * - FileSystem interfaceテストと同等の構造
 * - CRUD操作、バッチ処理、トランザクション、統計取得をテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockDatabase } from '../mock-database';
import type { Database } from '../../interfaces/database.interface';
import {
  isDatabaseImplementation,
  isBatchOperationSuccess,
  isQueryResultEmpty,
} from '../../interfaces/database.interface';
import type { TaskRecord, BoardRecord, LabelRecord } from '../../../types/database';

describe('Database Interface', () => {
  let db: Database;

  beforeEach(async () => {
    db = new MockDatabase();
    await db.connect();
    await db.initialize();
  });

  describe('Type Guards', () => {
    it('should validate Database implementation', () => {
      expect(isDatabaseImplementation(db)).toBe(true);
      expect(isDatabaseImplementation({})).toBe(false);
      expect(isDatabaseImplementation(null)).toBe(false);
    });

    it('should validate batch operation success', () => {
      expect(isBatchOperationSuccess({ success: [], failed: [], successCount: 0, failureCount: 0 })).toBe(false);
      expect(isBatchOperationSuccess({ success: [{}], failed: [], successCount: 1, failureCount: 0 })).toBe(true);
      expect(isBatchOperationSuccess({ success: [{}], failed: [{ record: {}, error: new Error() }], successCount: 1, failureCount: 1 })).toBe(false);
    });

    it('should validate query result empty', () => {
      expect(isQueryResultEmpty({ data: [], total: 0, hasMore: false })).toBe(true);
      expect(isQueryResultEmpty({ data: [{}], total: 1, hasMore: false })).toBe(false);
    });
  });

  describe('Connection & Lifecycle', () => {
    it('should connect and disconnect', async () => {
      const newDb = new MockDatabase();
      expect(newDb.isConnected()).toBe(false);

      await newDb.connect();
      expect(newDb.isConnected()).toBe(true);

      await newDb.disconnect();
      expect(newDb.isConnected()).toBe(false);
    });

    it('should initialize database', async () => {
      const newDb = new MockDatabase();
      await newDb.connect();
      await newDb.initialize();
      expect(newDb.isConnected()).toBe(true);
    });

    it('should clear all data', async () => {
      const task = createMockTask('task1', 'board1', 'column1');
      await db.createTask(task);

      await db.clear();
      const retrieved = await db.getTask('task1');
      expect(retrieved).toBeNull();
    });
  });

  describe('CRUD Operations - Tasks', () => {
    it('should create and retrieve task', async () => {
      const task = createMockTask('task1', 'board1', 'column1');
      const created = await db.createTask(task);

      expect(created).toEqual(task);

      const retrieved = await db.getTask('task1');
      expect(retrieved).toEqual(task);
    });

    it('should return null for non-existent task', async () => {
      const task = await db.getTask('non-existent');
      expect(task).toBeNull();
    });

    it('should update task', async () => {
      const task = createMockTask('task1', 'board1', 'column1');
      await db.createTask(task);

      const updated = await db.updateTask('task1', {
        title: 'Updated Title',
        priority: 'HIGH',
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.priority).toBe('HIGH');
    });

    it('should delete task', async () => {
      const task = createMockTask('task1', 'board1', 'column1');
      await db.createTask(task);

      const deleted = await db.deleteTask('task1');
      expect(deleted).toBe(true);

      const retrieved = await db.getTask('task1');
      expect(retrieved).toBeNull();
    });

    it('should get tasks by board', async () => {
      const task1 = createMockTask('task1', 'board1', 'column1');
      const task2 = createMockTask('task2', 'board1', 'column2');
      const task3 = createMockTask('task3', 'board2', 'column3');

      await db.createTask(task1);
      await db.createTask(task2);
      await db.createTask(task3);

      const result = await db.getTasksByBoard('board1');
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should get tasks by column', async () => {
      const task1 = createMockTask('task1', 'board1', 'column1');
      const task2 = createMockTask('task2', 'board1', 'column1');

      await db.createTask(task1);
      await db.createTask(task2);

      const result = await db.getTasksByColumn('column1');
      expect(result.data).toHaveLength(2);
    });
  });

  describe('CRUD Operations - Boards', () => {
    it('should create and retrieve board', async () => {
      const board = createMockBoard('board1');
      const created = await db.createBoard(board);

      expect(created).toEqual(board);

      const retrieved = await db.getBoard('board1');
      expect(retrieved).toEqual(board);
    });

    it('should get all boards', async () => {
      const board1 = createMockBoard('board1');
      const board2 = createMockBoard('board2');

      await db.createBoard(board1);
      await db.createBoard(board2);

      const result = await db.getBoards();
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should update board', async () => {
      const board = createMockBoard('board1');
      await db.createBoard(board);

      const updated = await db.updateBoard('board1', {
        name: 'Updated Board',
      });

      expect(updated.name).toBe('Updated Board');
    });

    it('should delete board', async () => {
      const board = createMockBoard('board1');
      await db.createBoard(board);

      const deleted = await db.deleteBoard('board1');
      expect(deleted).toBe(true);

      const retrieved = await db.getBoard('board1');
      expect(retrieved).toBeNull();
    });
  });

  describe('CRUD Operations - Labels', () => {
    it('should create and retrieve label', async () => {
      const label = createMockLabel('label1');
      const created = await db.createLabel(label);

      expect(created).toEqual(label);

      const retrieved = await db.getLabel('label1');
      expect(retrieved).toEqual(label);
    });

    it('should get labels by board (including global)', async () => {
      const globalLabel = createMockLabel('global1', undefined);
      const boardLabel = createMockLabel('board1-label', 'board1');

      await db.createLabel(globalLabel);
      await db.createLabel(boardLabel);

      const labels = await db.getLabelsByBoard('board1');
      expect(labels).toHaveLength(2);
      expect(labels.some(l => l.id === 'global1')).toBe(true);
      expect(labels.some(l => l.id === 'board1-label')).toBe(true);
    });

    it('should get only global labels when boardId is undefined', async () => {
      const globalLabel = createMockLabel('global1', undefined);
      const boardLabel = createMockLabel('board1-label', 'board1');

      await db.createLabel(globalLabel);
      await db.createLabel(boardLabel);

      const labels = await db.getLabelsByBoard();
      expect(labels).toHaveLength(1);
      expect(labels[0].id).toBe('global1');
    });

    it('should update label', async () => {
      const label = createMockLabel('label1');
      await db.createLabel(label);

      const updated = await db.updateLabel('label1', {
        name: 'Updated Label',
        color: '#FF0000',
      });

      expect(updated.name).toBe('Updated Label');
      expect(updated.color).toBe('#FF0000');
    });

    it('should delete label', async () => {
      const label = createMockLabel('label1');
      await db.createLabel(label);

      const deleted = await db.deleteLabel('label1');
      expect(deleted).toBe(true);

      const retrieved = await db.getLabel('label1');
      expect(retrieved).toBeNull();
    });
  });

  describe('Batch Operations', () => {
    it('should batch create tasks', async () => {
      const tasks = [
        createMockTask('task1', 'board1', 'column1'),
        createMockTask('task2', 'board1', 'column1'),
        createMockTask('task3', 'board1', 'column1'),
      ];

      const result = await db.batchCreateTasks(tasks);
      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
      expect(isBatchOperationSuccess(result)).toBe(true);
    });

    it('should batch update tasks', async () => {
      const task1 = createMockTask('task1', 'board1', 'column1');
      const task2 = createMockTask('task2', 'board1', 'column1');
      await db.createTask(task1);
      await db.createTask(task2);

      const updates = [
        { id: 'task1', updates: { title: 'Updated 1' } },
        { id: 'task2', updates: { title: 'Updated 2' } },
      ];

      const result = await db.batchUpdateTasks(updates);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
    });

    it('should batch delete tasks', async () => {
      const task1 = createMockTask('task1', 'board1', 'column1');
      const task2 = createMockTask('task2', 'board1', 'column1');
      await db.createTask(task1);
      await db.createTask(task2);

      const result = await db.deleteTasks(['task1', 'task2']);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
    });
  });

  describe('Transaction Support', () => {
    it('should execute transaction successfully', async () => {
      const result = await db.transaction(async (tx) => {
        expect(tx.id).toBeDefined();
        expect(tx.startedAt).toBeInstanceOf(Date);

        const task = createMockTask('task1', 'board1', 'column1');
        await db.createTask(task);
        return 'success';
      });

      expect(result).toBe('success');
      const task = await db.getTask('task1');
      expect(task).not.toBeNull();
    });

    it('should rollback on transaction error', async () => {
      await expect(async () => {
        await db.transaction(async () => {
          const task = createMockTask('task1', 'board1', 'column1');
          await db.createTask(task);
          throw new Error('Transaction error');
        });
      }).rejects.toThrow('Transaction error');
    });
  });

  describe('Statistics & Metadata', () => {
    it('should get task statistics', async () => {
      const task1 = createMockTask('task1', 'board1', 'column1');
      const task2 = createMockTask('task2', 'board1', 'column2');
      await db.createTask(task1);
      await db.createTask(task2);

      const stats = await db.getTaskStats('board1');
      expect(stats.count).toBe(2);
      expect(stats.lastModified).toBeInstanceOf(Date);
    });

    it('should get board statistics', async () => {
      const board1 = createMockBoard('board1');
      const board2 = createMockBoard('board2');
      await db.createBoard(board1);
      await db.createBoard(board2);

      const stats = await db.getBoardStats();
      expect(stats.count).toBe(2);
      expect(stats.lastModified).toBeInstanceOf(Date);
    });

    it('should get label statistics', async () => {
      const label1 = createMockLabel('label1', 'board1');
      const label2 = createMockLabel('label2', 'board1');
      await db.createLabel(label1);
      await db.createLabel(label2);

      const stats = await db.getLabelStats('board1');
      expect(stats.count).toBe(2);
      expect(stats.lastModified).toBeInstanceOf(Date);
    });
  });

  describe('Advanced Queries', () => {
    it('should search tasks by query', async () => {
      const task1 = createMockTask('task1', 'board1', 'column1', 'Important task');
      const task2 = createMockTask('task2', 'board1', 'column1', 'Urgent task');
      const task3 = createMockTask('task3', 'board1', 'column1', 'Normal task');
      await db.createTask(task1);
      await db.createTask(task2);
      await db.createTask(task3);

      const result = await db.searchTasks('important');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('task1');
    });

    it('should get tasks by label', async () => {
      const task1 = createMockTask('task1', 'board1', 'column1', 'Task 1', ['label1']);
      const task2 = createMockTask('task2', 'board1', 'column1', 'Task 2', ['label1', 'label2']);
      const task3 = createMockTask('task3', 'board1', 'column1', 'Task 3', ['label2']);
      await db.createTask(task1);
      await db.createTask(task2);
      await db.createTask(task3);

      const result = await db.getTasksByLabel('label1');
      expect(result.data).toHaveLength(2);
    });

    it('should get tasks by date range', async () => {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const task1 = createMockTask('task1', 'board1', 'column1', 'Task 1', [], tomorrow.toISOString());
      const task2 = createMockTask('task2', 'board1', 'column1', 'Task 2', [], nextWeek.toISOString());
      await db.createTask(task1);
      await db.createTask(task2);

      const result = await db.getTasksByDateRange(
        now.toISOString(),
        new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('task1');
    });

    it('should get deleted tasks', async () => {
      const now = new Date().toISOString();
      const task1 = createMockTask('task1', 'board1', 'column1');
      const task2 = createMockTask('task2', 'board1', 'column1');
      task1.status = 'DELETED';
      task1.deletedAt = now;

      await db.createTask(task1);
      await db.createTask(task2);

      const result = await db.getDeletedTasks('board1');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('task1');
    });

    it('should purge old deleted tasks', async () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000); // 40 days ago
      const recentDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago

      const task1 = createMockTask('task1', 'board1', 'column1');
      const task2 = createMockTask('task2', 'board1', 'column1');
      task1.status = 'DELETED';
      task1.deletedAt = oldDate.toISOString();
      task2.status = 'DELETED';
      task2.deletedAt = recentDate.toISOString();

      await db.createTask(task1);
      await db.createTask(task2);

      const purgedIds = await db.purgeDeletedTasks(30);
      expect(purgedIds).toHaveLength(1);
      expect(purgedIds[0]).toBe('task1');

      const task1Retrieved = await db.getTask('task1');
      const task2Retrieved = await db.getTask('task2');
      expect(task1Retrieved).toBeNull();
      expect(task2Retrieved).not.toBeNull();
    });
  });

  describe('Query Options', () => {
    beforeEach(async () => {
      const tasks = Array.from({ length: 10 }, (_, i) =>
        createMockTask(`task${i}`, 'board1', 'column1', `Task ${i}`)
      );
      for (const task of tasks) {
        await db.createTask(task);
      }
    });

    it('should apply limit', async () => {
      const result = await db.getTasksByBoard('board1', { limit: 5 });
      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(10);
      expect(result.hasMore).toBe(true);
    });

    it('should apply offset', async () => {
      const result = await db.getTasksByBoard('board1', { offset: 5, limit: 5 });
      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(10);
      expect(result.hasMore).toBe(false);
    });

    it('should apply orderBy', async () => {
      const result = await db.getTasksByBoard('board1', {
        orderBy: { field: 'title', direction: 'asc' },
      });
      expect(result.data[0].title).toBe('Task 0');
      expect(result.data[result.data.length - 1].title).toBe('Task 9');
    });
  });
});

// ============================================================================
// Test Helpers
// ============================================================================

function createMockTask(
  id: string,
  boardId: string,
  columnId: string,
  title: string = 'Test Task',
  labels: string[] = [],
  dueDate?: string
): TaskRecord {
  const now = new Date().toISOString();
  return {
    id,
    boardId,
    columnId,
    title,
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: dueDate ?? null,
    dueTime: undefined,
    labels,
    subtasks: [],
    files: [],
    recurrence: undefined,
    position: 0,
    createdAt: now,
    updatedAt: now,
    completedAt: undefined,
    deletedAt: undefined,
  };
}

function createMockBoard(id: string): BoardRecord {
  const now = new Date().toISOString();
  return {
    id,
    name: `Board ${id}`,
    description: '',
    columns: [
      { id: 'col1', name: 'To Do', position: 0, taskIds: [] },
      { id: 'col2', name: 'In Progress', position: 1, taskIds: [] },
      { id: 'col3', name: 'Done', position: 2, taskIds: [] },
    ],
    settings: {
      defaultColumn: 'col1',
      completedColumnId: 'col3',
      autoArchiveCompleted: false,
      recycleBinRetentionDays: 30,
    },
    isShared: false,
    createdAt: now,
    updatedAt: now,
  };
}

function createMockLabel(id: string, boardId?: string): LabelRecord {
  const now = new Date().toISOString();
  return {
    id,
    name: `Label ${id}`,
    color: '#3B82F6',
    boardId,
    createdAt: now,
    updatedAt: now,
  };
}
