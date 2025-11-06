/**
 * RecycleBin utility functions tests
 * ゴミ箱ユーティリティ関数の包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getRecycleBinTasks,
  getExpiredTasks,
  deleteExpiredTasks,
  emptyRecycleBin,
  permanentlyDeleteTask,
  restoreTaskFromRecycleBin,
  calculateDeletionTime,
  formatTimeUntilDeletion,
  getRecycleBinBoards,
  getExpiredBoards,
  deleteExpiredBoards,
  moveBoardToRecycleBin,
  restoreBoardFromRecycleBin,
  permanentlyDeleteBoard,
  emptyBoardRecycleBin,
  getRecycleBinColumns,
  getExpiredColumns,
  deleteExpiredColumns,
  moveColumnToRecycleBin,
  restoreColumnFromRecycleBin,
  permanentlyDeleteColumn,
  emptyColumnRecycleBin,
  getAllRecycleBinItems,
} from './recycleBin';
import type { KanbanBoard, Task, Column } from '../types';
import type { RecycleBinSettings } from '../types/settings';

// Mock logger
vi.mock('./logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('RecycleBin - Task Functions', () => {
  let mockBoards: KanbanBoard[];
  let settings: RecycleBinSettings;

  beforeEach(() => {
    // 現在時刻から3日前、7日前、14日前のタスクを作成
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    mockBoards = [
      {
        id: 'board-1',
        title: 'Test Board',
        columns: [
          {
            id: 'col-1',
            title: 'Column 1',
            tasks: [
              {
                id: 'task-1',
                title: 'Active Task',
                deletionState: 'active',
                deletedAt: null,
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
              } as Task,
              {
                id: 'task-2',
                title: 'Deleted 3 days ago',
                deletionState: 'deleted',
                deletedAt: threeDaysAgo.toISOString(),
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
              } as Task,
              {
                id: 'task-3',
                title: 'Deleted 7 days ago',
                deletionState: 'deleted',
                deletedAt: sevenDaysAgo.toISOString(),
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
              } as Task,
              {
                id: 'task-4',
                title: 'Deleted 14 days ago',
                deletionState: 'deleted',
                deletedAt: fourteenDaysAgo.toISOString(),
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
              } as Task,
            ],
            deletionState: 'active',
            deletedAt: null,
          } as Column,
        ],
        deletionState: 'active',
        deletedAt: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as KanbanBoard,
    ];

    settings = {
      retentionDays: 10, // 10日間の保持期間
    };
  });

  describe('getRecycleBinTasks', () => {
    it('should return all deleted tasks', () => {
      const deletedTasks = getRecycleBinTasks(mockBoards);

      expect(deletedTasks).toHaveLength(3);
      expect(deletedTasks[0].id).toBe('task-2'); // 最新順
      expect(deletedTasks[1].id).toBe('task-3');
      expect(deletedTasks[2].id).toBe('task-4');
    });

    it('should include boardId and columnId', () => {
      const deletedTasks = getRecycleBinTasks(mockBoards);

      deletedTasks.forEach(task => {
        expect(task.boardId).toBe('board-1');
        expect(task.columnId).toBe('col-1');
      });
    });

    it('should sort by deletedAt descending', () => {
      const deletedTasks = getRecycleBinTasks(mockBoards);
      const timestamps = deletedTasks.map(t =>
        new Date(t.deletedAt!).getTime()
      );

      for (let i = 0; i < timestamps.length - 1; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
      }
    });

    it('should return empty array when no deleted tasks', () => {
      const activeBoards = [
        {
          ...mockBoards[0],
          columns: [
            {
              ...mockBoards[0].columns[0],
              tasks: [mockBoards[0].columns[0].tasks[0]], // Active task only
            },
          ],
        },
      ];

      const deletedTasks = getRecycleBinTasks(activeBoards);
      expect(deletedTasks).toHaveLength(0);
    });
  });

  describe('getExpiredTasks', () => {
    it('should return tasks older than retention period', () => {
      const expiredTasks = getExpiredTasks(mockBoards, settings);

      // 14日前のタスクのみが期限切れ（保持期間10日）
      expect(expiredTasks).toHaveLength(1);
      expect(expiredTasks[0].id).toBe('task-4');
    });

    it('should return empty array when retentionDays is null', () => {
      const unlimitedSettings: RecycleBinSettings = { retentionDays: null };
      const expiredTasks = getExpiredTasks(mockBoards, unlimitedSettings);

      expect(expiredTasks).toHaveLength(0);
    });

    it('should exclude tasks without deletedAt', () => {
      const boardsWithNullDeletedAt = [
        {
          ...mockBoards[0],
          columns: [
            {
              ...mockBoards[0].columns[0],
              tasks: [
                {
                  id: 'task-no-date',
                  title: 'No deleted date',
                  deletionState: 'deleted',
                  deletedAt: null,
                } as Task,
              ],
            },
          ],
        },
      ] as KanbanBoard[];

      const expiredTasks = getExpiredTasks(boardsWithNullDeletedAt, settings);
      expect(expiredTasks).toHaveLength(0);
    });
  });

  describe('deleteExpiredTasks', () => {
    it('should delete expired tasks and return count', () => {
      const result = deleteExpiredTasks(mockBoards, settings);

      expect(result.deletedCount).toBe(1);
      expect(result.updatedBoards[0].columns[0].tasks).toHaveLength(3);
      expect(
        result.updatedBoards[0].columns[0].tasks.find(t => t.id === 'task-4')
      ).toBeUndefined();
    });

    it('should not modify boards when no expired tasks', () => {
      const shortRetentionSettings: RecycleBinSettings = { retentionDays: 30 };
      const result = deleteExpiredTasks(mockBoards, shortRetentionSettings);

      expect(result.deletedCount).toBe(0);
      expect(result.updatedBoards).toEqual(mockBoards);
    });

    it('should handle unlimited retention', () => {
      const unlimitedSettings: RecycleBinSettings = { retentionDays: null };
      const result = deleteExpiredTasks(mockBoards, unlimitedSettings);

      expect(result.deletedCount).toBe(0);
      expect(result.updatedBoards).toEqual(mockBoards);
    });
  });

  describe('emptyRecycleBin', () => {
    it('should delete all deleted tasks', () => {
      const result = emptyRecycleBin(mockBoards);

      expect(result.deletedCount).toBe(3);
      expect(result.updatedBoards[0].columns[0].tasks).toHaveLength(1);
      expect(result.updatedBoards[0].columns[0].tasks[0].id).toBe('task-1');
    });

    it('should return zero count when no deleted tasks', () => {
      const activeBoards = [
        {
          ...mockBoards[0],
          columns: [
            {
              ...mockBoards[0].columns[0],
              tasks: [mockBoards[0].columns[0].tasks[0]],
            },
          ],
        },
      ];

      const result = emptyRecycleBin(activeBoards);
      expect(result.deletedCount).toBe(0);
      expect(result.updatedBoards).toEqual(activeBoards);
    });
  });

  describe('permanentlyDeleteTask', () => {
    it('should permanently delete specific task', () => {
      const result = permanentlyDeleteTask(mockBoards, 'task-2');

      expect(result.success).toBe(true);
      expect(result.updatedBoards[0].columns[0].tasks).toHaveLength(3);
      expect(
        result.updatedBoards[0].columns[0].tasks.find(t => t.id === 'task-2')
      ).toBeUndefined();
    });

    it('should return true even when task not found', () => {
      // 実装では、タスクが見つからない場合でもtrueを返す
      // （削除対象が既に存在しないため、削除は成功と見なされる）
      const result = permanentlyDeleteTask(mockBoards, 'non-existent');

      expect(result.success).toBe(true);
      expect(result.updatedBoards).toEqual(mockBoards);
    });
  });

  describe('restoreTaskFromRecycleBin', () => {
    it('should restore deleted task', () => {
      const restored = restoreTaskFromRecycleBin(mockBoards, 'task-2');

      expect(restored).not.toBeNull();
      const restoredTask = restored![0].columns[0].tasks.find(
        t => t.id === 'task-2'
      );
      expect(restoredTask?.deletionState).toBe('active');
      expect(restoredTask?.deletedAt).toBeNull();
    });

    it('should not modify non-deleted tasks', () => {
      const restored = restoreTaskFromRecycleBin(mockBoards, 'task-1');

      expect(restored).not.toBeNull();
      const task = restored![0].columns[0].tasks.find(t => t.id === 'task-1');
      expect(task?.deletionState).toBe('active');
    });
  });

  describe('calculateDeletionTime', () => {
    it('should calculate deletion time correctly', () => {
      const now = new Date();
      const deletedAt = now.toISOString();
      const retentionDays = 7;

      const deletionTime = calculateDeletionTime(deletedAt, retentionDays);

      expect(deletionTime).not.toBeNull();
      const expectedTime = new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000
      ).getTime();
      expect(deletionTime!.getTime()).toBeCloseTo(expectedTime, -4);
    });

    it('should return null for unlimited retention', () => {
      const deletionTime = calculateDeletionTime(
        new Date().toISOString(),
        null
      );
      expect(deletionTime).toBeNull();
    });
  });

  describe('formatTimeUntilDeletion', () => {
    it('should format days correctly', () => {
      const now = new Date();
      const deletedAt = now.toISOString();
      const formatted = formatTimeUntilDeletion(deletedAt, 7);

      expect(formatted).toMatch(/約\d+日後/);
    });

    it('should return unlimited message for null retention', () => {
      const formatted = formatTimeUntilDeletion(new Date().toISOString(), null);
      expect(formatted).toBe('無制限（自動削除されません）');
    });

    it('should indicate past deletion time', () => {
      const pastDate = new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000
      ).toISOString();
      const formatted = formatTimeUntilDeletion(pastDate, 5);

      expect(formatted).toBe('削除予定時刻を過ぎています');
    });
  });
});

describe('RecycleBin - Board Functions', () => {
  let mockBoards: KanbanBoard[];
  let settings: RecycleBinSettings;

  beforeEach(() => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    mockBoards = [
      {
        id: 'board-1',
        title: 'Active Board',
        columns: [],
        deletionState: 'active',
        deletedAt: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as KanbanBoard,
      {
        id: 'board-2',
        title: 'Deleted 3 days ago',
        columns: [],
        deletionState: 'deleted',
        deletedAt: threeDaysAgo.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as KanbanBoard,
      {
        id: 'board-3',
        title: 'Deleted 14 days ago',
        columns: [],
        deletionState: 'deleted',
        deletedAt: fourteenDaysAgo.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as KanbanBoard,
    ];

    settings = { retentionDays: 10 };
  });

  describe('getRecycleBinBoards', () => {
    it('should return all deleted boards', () => {
      const deletedBoards = getRecycleBinBoards(mockBoards);

      expect(deletedBoards).toHaveLength(2);
      expect(deletedBoards[0].id).toBe('board-2');
      expect(deletedBoards[1].id).toBe('board-3');
    });

    it('should sort by deletedAt descending', () => {
      const deletedBoards = getRecycleBinBoards(mockBoards);
      const timestamps = deletedBoards.map(b =>
        new Date(b.deletedAt!).getTime()
      );

      expect(timestamps[0]).toBeGreaterThan(timestamps[1]);
    });
  });

  describe('getExpiredBoards', () => {
    it('should return boards older than retention period', () => {
      const expiredBoards = getExpiredBoards(mockBoards, settings);

      expect(expiredBoards).toHaveLength(1);
      expect(expiredBoards[0].id).toBe('board-3');
    });

    it('should return empty array for unlimited retention', () => {
      const unlimitedSettings: RecycleBinSettings = { retentionDays: null };
      const expiredBoards = getExpiredBoards(mockBoards, unlimitedSettings);

      expect(expiredBoards).toHaveLength(0);
    });
  });

  describe('deleteExpiredBoards', () => {
    it('should delete expired boards', () => {
      const result = deleteExpiredBoards(mockBoards, settings);

      expect(result.deletedCount).toBe(1);
      expect(result.updatedBoards).toHaveLength(2);
      expect(
        result.updatedBoards.find(b => b.id === 'board-3')
      ).toBeUndefined();
    });
  });

  describe('moveBoardToRecycleBin', () => {
    it('should move board to recycle bin', () => {
      const updated = moveBoardToRecycleBin(mockBoards, 'board-1');
      const movedBoard = updated.find(b => b.id === 'board-1');

      expect(movedBoard?.deletionState).toBe('deleted');
      expect(movedBoard?.deletedAt).toBeTruthy();
    });
  });

  describe('restoreBoardFromRecycleBin', () => {
    it('should restore deleted board', () => {
      const restored = restoreBoardFromRecycleBin(mockBoards, 'board-2');
      const restoredBoard = restored.find(b => b.id === 'board-2');

      expect(restoredBoard?.deletionState).toBe('active');
      expect(restoredBoard?.deletedAt).toBeNull();
    });
  });

  describe('permanentlyDeleteBoard', () => {
    it('should permanently delete board', () => {
      const result = permanentlyDeleteBoard(mockBoards, 'board-2');

      expect(result.success).toBe(true);
      expect(result.updatedBoards).toHaveLength(2);
      expect(
        result.updatedBoards.find(b => b.id === 'board-2')
      ).toBeUndefined();
    });
  });

  describe('emptyBoardRecycleBin', () => {
    it('should delete all deleted boards', () => {
      const result = emptyBoardRecycleBin(mockBoards);

      expect(result.deletedCount).toBe(2);
      expect(result.updatedBoards).toHaveLength(1);
      expect(result.updatedBoards[0].id).toBe('board-1');
    });
  });
});

describe('RecycleBin - Column Functions', () => {
  let mockBoards: KanbanBoard[];
  let settings: RecycleBinSettings;

  beforeEach(() => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    mockBoards = [
      {
        id: 'board-1',
        title: 'Test Board',
        columns: [
          {
            id: 'col-1',
            title: 'Active Column',
            tasks: [],
            deletionState: 'active',
            deletedAt: null,
          } as Column,
          {
            id: 'col-2',
            title: 'Deleted 3 days ago',
            tasks: [],
            deletionState: 'deleted',
            deletedAt: threeDaysAgo.toISOString(),
          } as Column,
          {
            id: 'col-3',
            title: 'Deleted 14 days ago',
            tasks: [],
            deletionState: 'deleted',
            deletedAt: fourteenDaysAgo.toISOString(),
          } as Column,
        ],
        deletionState: 'active',
        deletedAt: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as KanbanBoard,
    ];

    settings = { retentionDays: 10 };
  });

  describe('getRecycleBinColumns', () => {
    it('should return all deleted columns', () => {
      const deletedColumns = getRecycleBinColumns(mockBoards);

      expect(deletedColumns).toHaveLength(2);
      expect(deletedColumns[0].boardId).toBe('board-1');
    });
  });

  describe('getExpiredColumns', () => {
    it('should return columns older than retention period', () => {
      const expiredColumns = getExpiredColumns(mockBoards, settings);

      expect(expiredColumns).toHaveLength(1);
      expect(expiredColumns[0].id).toBe('col-3');
    });
  });

  describe('deleteExpiredColumns', () => {
    it('should delete expired columns', () => {
      const result = deleteExpiredColumns(mockBoards, settings);

      expect(result.deletedCount).toBe(1);
      expect(result.updatedBoards[0].columns).toHaveLength(2);
    });
  });

  describe('moveColumnToRecycleBin', () => {
    it('should move column to recycle bin', () => {
      const updated = moveColumnToRecycleBin(mockBoards, 'col-1');
      const movedColumn = updated[0].columns.find(c => c.id === 'col-1');

      expect(movedColumn?.deletionState).toBe('deleted');
      expect(movedColumn?.deletedAt).toBeTruthy();
    });
  });

  describe('restoreColumnFromRecycleBin', () => {
    it('should restore deleted column', () => {
      const restored = restoreColumnFromRecycleBin(mockBoards, 'col-2');
      const restoredColumn = restored[0].columns.find(c => c.id === 'col-2');

      expect(restoredColumn?.deletionState).toBe('active');
      expect(restoredColumn?.deletedAt).toBeNull();
    });
  });

  describe('permanentlyDeleteColumn', () => {
    it('should permanently delete column', () => {
      const result = permanentlyDeleteColumn(mockBoards, 'col-2');

      expect(result.success).toBe(true);
      expect(result.updatedBoards[0].columns).toHaveLength(2);
    });
  });

  describe('emptyColumnRecycleBin', () => {
    it('should delete all deleted columns', () => {
      const result = emptyColumnRecycleBin(mockBoards);

      expect(result.deletedCount).toBe(2);
      expect(result.updatedBoards[0].columns).toHaveLength(1);
    });
  });
});

describe('RecycleBin - Unified Functions', () => {
  let mockBoards: KanbanBoard[];
  let settings: RecycleBinSettings;

  beforeEach(() => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    mockBoards = [
      {
        id: 'board-1',
        title: 'Active Board',
        columns: [
          {
            id: 'col-1',
            title: 'Column 1',
            tasks: [
              {
                id: 'task-1',
                title: 'Deleted Task',
                deletionState: 'deleted',
                deletedAt: threeDaysAgo.toISOString(),
              } as Task,
            ],
            deletionState: 'active',
            deletedAt: null,
          } as Column,
          {
            id: 'col-2',
            title: 'Deleted Column',
            tasks: [],
            deletionState: 'deleted',
            deletedAt: threeDaysAgo.toISOString(),
          } as Column,
        ],
        deletionState: 'active',
        deletedAt: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as KanbanBoard,
      {
        id: 'board-2',
        title: 'Deleted Board',
        columns: [],
        deletionState: 'deleted',
        deletedAt: threeDaysAgo.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as KanbanBoard,
    ];

    settings = { retentionDays: 10 };
  });

  describe('getAllRecycleBinItems', () => {
    it('should return all deleted items (tasks, boards, columns)', () => {
      const allItems = getAllRecycleBinItems(mockBoards, settings);

      expect(allItems).toHaveLength(3);

      const taskItem = allItems.find(item => item.type === 'task');
      const boardItem = allItems.find(item => item.type === 'board');
      const columnItem = allItems.find(item => item.type === 'column');

      expect(taskItem).toBeDefined();
      expect(boardItem).toBeDefined();
      expect(columnItem).toBeDefined();
    });

    it('should include metadata for tasks', () => {
      const allItems = getAllRecycleBinItems(mockBoards, settings);
      const taskItem = allItems.find(item => item.type === 'task');

      expect(taskItem).toMatchObject({
        id: 'task-1',
        type: 'task',
        boardId: 'board-1',
        columnId: 'col-1',
        canRestore: true,
      });
      expect(taskItem?.timeUntilDeletion).toBeTruthy();
    });

    it('should include metadata for boards', () => {
      const allItems = getAllRecycleBinItems(mockBoards, settings);
      const boardItem = allItems.find(item => item.type === 'board');

      expect(boardItem).toMatchObject({
        id: 'board-2',
        type: 'board',
        canRestore: true,
      });
      expect(boardItem?.columnsCount).toBeDefined();
      expect(boardItem?.taskCount).toBeDefined();
    });

    it('should include metadata for columns', () => {
      const allItems = getAllRecycleBinItems(mockBoards, settings);
      const columnItem = allItems.find(item => item.type === 'column');

      expect(columnItem).toMatchObject({
        id: 'col-2',
        type: 'column',
        boardId: 'board-1',
        canRestore: true,
      });
      expect(columnItem?.taskCount).toBeDefined();
    });

    it('should sort items by deletedAt descending', () => {
      const allItems = getAllRecycleBinItems(mockBoards, settings);
      const timestamps = allItems.map(item =>
        new Date(item.deletedAt!).getTime()
      );

      for (let i = 0; i < timestamps.length - 1; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
      }
    });
  });
});
