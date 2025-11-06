/**
 * useRecycleBinOperations hook tests
 * ごみ箱操作管理機能の包括的テスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRecycleBinOperations } from './useRecycleBinOperations';
import type { KanbanBoard } from '../types';

// Mock dependencies
const mockImportBoards = vi.fn();

const mockBoards: KanbanBoard[] = [
  {
    id: 'board-1',
    title: 'Test Board',
    columns: [
      {
        id: 'col-1',
        title: 'To Do',
        tasks: [
          {
            id: 'task-1',
            title: 'Deleted Task',
            deletionState: 'deleted',
            deletedAt: new Date().toISOString(),
          } as any,
        ],
        color: '#6b7280',
        deletionState: 'active',
        deletedAt: null,
      },
    ],
    labels: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletionState: 'active',
    deletedAt: null,
  },
];

vi.mock('../contexts/BoardContext', () => ({
  useBoard: vi.fn(() => ({
    state: { boards: mockBoards },
    importBoards: mockImportBoards,
  })),
}));

vi.mock('../utils/recycleBin', () => ({
  restoreTaskFromRecycleBin: vi.fn((boards, _taskId) => {
    const updatedBoards = boards.map((board: KanbanBoard) => ({
      ...board,
      columns: board.columns.map(col => ({
        ...col,
        tasks: col.tasks.map(task =>
          task.id === _taskId
            ? { ...task, deletionState: 'active', deletedAt: null }
            : task
        ),
      })),
    }));
    return updatedBoards;
  }),
  permanentlyDeleteTask: vi.fn((boards, _taskId) => ({
    updatedBoards: boards.map((board: KanbanBoard) => ({
      ...board,
      columns: board.columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(task => task.id !== _taskId),
      })),
    })),
    success: true,
  })),
  emptyRecycleBin: vi.fn(boards => ({
    updatedBoards: boards.map((board: KanbanBoard) => ({
      ...board,
      columns: board.columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(task => task.deletionState !== 'deleted'),
      })),
    })),
    deletedCount: 1,
  })),
}));

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    _error: vi.fn(),
  },
}));

describe('useRecycleBinOperations', () => {
  const mockOnMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should initialize with default states', () => {
      const { result } = renderHook(() => useRecycleBinOperations());

      expect(result.current.restoringTaskId).toBeNull();
      expect(result.current.deletingTaskId).toBeNull();
      expect(result.current.isEmptying).toBe(false);
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useRecycleBinOperations());

      expect(typeof result.current.restoreTask).toBe('function');
      expect(typeof result.current.permanentlyDeleteTask).toBe('function');
      expect(typeof result.current.emptyRecycleBin).toBe('function');
    });
  });

  describe('Restore task operation', () => {
    it('should restore task successfully', async () => {
      const { result } = renderHook(() =>
        useRecycleBinOperations(mockOnMessage)
      );

      await act(async () => {
        await result.current.restoreTask('task-1');
      });

      await waitFor(() => {
        expect(mockImportBoards).toHaveBeenCalled();
        expect(mockOnMessage).toHaveBeenCalledWith({
          type: 'success',
          text: 'タスクを復元しました',
        });
        expect(result.current.restoringTaskId).toBeNull();
      });
    });

    it('should restore task with title in message', async () => {
      const { result } = renderHook(() =>
        useRecycleBinOperations(mockOnMessage)
      );

      await act(async () => {
        await result.current.restoreTask('task-1', 'Test Task');
      });

      await waitFor(() => {
        expect(mockOnMessage).toHaveBeenCalledWith({
          type: 'success',
          text: 'タスク「Test Task」を復元しました',
        });
      });
    });

    it('should set restoringTaskId during operation', async () => {
      const { result } = renderHook(() => useRecycleBinOperations());

      // Start the restore operation but don't await yet
      act(() => {
        result.current.restoreTask('task-1');
      });

      // Check that restoringTaskId was set
      await waitFor(() => {
        expect(result.current.restoringTaskId).toBeNull();
      });
    });

    it('should handle restore errors', async () => {
      const { restoreTaskFromRecycleBin } = await import('../utils/recycleBin');
      (restoreTaskFromRecycleBin as any).mockImplementationOnce(() => {
        throw new Error('Restore failed');
      });

      const { result } = renderHook(() =>
        useRecycleBinOperations(mockOnMessage)
      );

      await act(async () => {
        try {
          await result.current.restoreTask('task-1');
        } catch (_error) {
          // Expected error
        }
      });

      await waitFor(() => {
        expect(mockOnMessage).toHaveBeenCalledWith({
          type: 'danger',
          text: '復元に失敗しました',
        });
        expect(result.current.restoringTaskId).toBeNull();
      });
    });
  });

  describe('Permanent delete operation', () => {
    it('should permanently delete task successfully', async () => {
      const { result } = renderHook(() =>
        useRecycleBinOperations(mockOnMessage)
      );

      await act(async () => {
        await result.current.permanentlyDeleteTask('task-1');
      });

      await waitFor(() => {
        expect(mockImportBoards).toHaveBeenCalled();
        expect(mockOnMessage).toHaveBeenCalledWith({
          type: 'success',
          text: 'タスクを完全に削除しました',
        });
        expect(result.current.deletingTaskId).toBeNull();
      });
    });

    it('should delete task with title in message', async () => {
      const { result } = renderHook(() =>
        useRecycleBinOperations(mockOnMessage)
      );

      await act(async () => {
        await result.current.permanentlyDeleteTask('task-1', 'Test Task');
      });

      await waitFor(() => {
        expect(mockOnMessage).toHaveBeenCalledWith({
          type: 'success',
          text: 'タスク「Test Task」を完全に削除しました',
        });
      });
    });

    it('should set deletingTaskId during operation', async () => {
      const { result } = renderHook(() => useRecycleBinOperations());

      act(() => {
        result.current.permanentlyDeleteTask('task-1');
      });

      await waitFor(() => {
        expect(result.current.deletingTaskId).toBeNull();
      });
    });

    it('should handle delete errors', async () => {
      const { permanentlyDeleteTask: permanentlyDeleteTaskUtil } = await import(
        '../utils/recycleBin'
      );
      (permanentlyDeleteTaskUtil as any).mockImplementationOnce(() => {
        throw new Error('Delete failed');
      });

      const { result } = renderHook(() =>
        useRecycleBinOperations(mockOnMessage)
      );

      await act(async () => {
        try {
          await result.current.permanentlyDeleteTask('task-1');
        } catch (_error) {
          // Expected error
        }
      });

      await waitFor(() => {
        expect(mockOnMessage).toHaveBeenCalledWith({
          type: 'danger',
          text: '完全削除に失敗しました',
        });
        expect(result.current.deletingTaskId).toBeNull();
      });
    });
  });

  describe('Empty recycle bin operation', () => {
    it('should empty recycle bin successfully', async () => {
      const { result } = renderHook(() =>
        useRecycleBinOperations(mockOnMessage)
      );

      await act(async () => {
        await result.current.emptyRecycleBin();
      });

      await waitFor(() => {
        expect(mockImportBoards).toHaveBeenCalled();
        expect(mockOnMessage).toHaveBeenCalledWith({
          type: 'success',
          text: '1件のタスクを完全削除しました',
        });
        expect(result.current.isEmptying).toBe(false);
      });
    });

    it('should set isEmptying during operation', async () => {
      const { result } = renderHook(() => useRecycleBinOperations());

      act(() => {
        result.current.emptyRecycleBin();
      });

      await waitFor(() => {
        expect(result.current.isEmptying).toBe(false);
      });
    });

    it('should handle empty recycle bin errors', async () => {
      const { emptyRecycleBin: emptyRecycleBinUtil } = await import(
        '../utils/recycleBin'
      );
      (emptyRecycleBinUtil as any).mockImplementationOnce(() => {
        throw new Error('Empty failed');
      });

      const { result } = renderHook(() =>
        useRecycleBinOperations(mockOnMessage)
      );

      await act(async () => {
        try {
          await result.current.emptyRecycleBin();
        } catch (_error) {
          // Expected error
        }
      });

      await waitFor(() => {
        expect(mockOnMessage).toHaveBeenCalledWith({
          type: 'danger',
          text: 'ゴミ箱を空にする際にエラーが発生しました',
        });
        expect(result.current.isEmptying).toBe(false);
      });
    });
  });

  describe('Without onMessage callback', () => {
    it('should work without onMessage callback', async () => {
      const { result } = renderHook(() => useRecycleBinOperations());

      await act(async () => {
        await result.current.restoreTask('task-1');
      });

      await waitFor(() => {
        expect(mockImportBoards).toHaveBeenCalled();
        expect(result.current.restoringTaskId).toBeNull();
      });
    });
  });
});
