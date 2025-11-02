/**
 * useTaskColumn hook tests
 * タスク所属カラム取得機能の包括的テスト
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTaskColumn } from './useTaskColumn';
import type { KanbanBoard, Task, Column } from '../types';

// Mock KanbanContext
const mockState = {
  boards: [] as KanbanBoard[],
  currentBoard: null as KanbanBoard | null,
  viewMode: 'kanban' as const,
  sortOption: null,
  taskFilter: { type: 'all' as const, label: '' },
};

vi.mock('../contexts/KanbanContext', () => ({
  useKanban: vi.fn(() => ({ state: mockState })),
}));

describe('useTaskColumn', () => {
  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: '',
    status: 'todo',
    priority: 'medium',
    labels: [],
    subTasks: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    dueDate: null,
    completedAt: null,
  };

  const mockColumn1: Column = {
    id: 'col-1',
    title: 'To Do',
    tasks: [mockTask],
    color: '#6b7280',
    deletionState: 'active',
    deletedAt: null,
  };

  const mockColumn2: Column = {
    id: 'col-2',
    title: 'In Progress',
    tasks: [],
    color: '#3b82f6',
    deletionState: 'active',
    deletedAt: null,
  };

  const mockBoard: KanbanBoard = {
    id: 'board-1',
    title: 'Test Board',
    columns: [mockColumn1, mockColumn2],
    labels: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletionState: 'active',
    deletedAt: null,
  };

  beforeEach(() => {
    mockState.currentBoard = mockBoard;
    mockState.boards = [mockBoard];
  });

  describe('Column finding', () => {
    it('should find column containing the task', () => {
      const { result } = renderHook(() => useTaskColumn(mockTask));

      expect(result.current.column).toBeDefined();
      expect(result.current.column?.id).toBe('col-1');
      expect(result.current.column?.title).toBe('To Do');
    });

    it('should return column name', () => {
      const { result } = renderHook(() => useTaskColumn(mockTask));

      expect(result.current.columnName).toBe('To Do');
    });

    it('should return undefined for task not in any column', () => {
      const orphanTask: Task = {
        ...mockTask,
        id: 'orphan-task',
      };

      const { result } = renderHook(() => useTaskColumn(orphanTask));

      expect(result.current.column).toBeUndefined();
      expect(result.current.columnName).toBeUndefined();
    });

    it('should handle null task', () => {
      const { result } = renderHook(() => useTaskColumn(null));

      expect(result.current.column).toBeUndefined();
      expect(result.current.columnName).toBeUndefined();
    });

    it('should handle null currentBoard', () => {
      mockState.currentBoard = null;

      const { result } = renderHook(() => useTaskColumn(mockTask));

      expect(result.current.column).toBeUndefined();
      expect(result.current.columnName).toBeUndefined();
    });

    it('should handle board with no columns', () => {
      mockState.currentBoard = {
        ...mockBoard,
        columns: [],
      };

      const { result } = renderHook(() => useTaskColumn(mockTask));

      expect(result.current.column).toBeUndefined();
      expect(result.current.columnName).toBeUndefined();
    });

    it('should handle board with empty columns array', () => {
      mockState.currentBoard = {
        ...mockBoard,
        columns: [],
      };

      const { result } = renderHook(() => useTaskColumn(mockTask));

      expect(result.current.column).toBeUndefined();
    });
  });

  describe('Multiple columns scenario', () => {
    it('should find task in second column', () => {
      const task2: Task = {
        ...mockTask,
        id: 'task-2',
      };

      const col2WithTask: Column = {
        ...mockColumn2,
        tasks: [task2],
      };

      mockState.currentBoard = {
        ...mockBoard,
        columns: [mockColumn1, col2WithTask],
      };

      const { result } = renderHook(() => useTaskColumn(task2));

      expect(result.current.column?.id).toBe('col-2');
      expect(result.current.columnName).toBe('In Progress');
    });

    it('should handle multiple tasks in same column', () => {
      const task2: Task = {
        ...mockTask,
        id: 'task-2',
      };

      const colWithMultipleTasks: Column = {
        ...mockColumn1,
        tasks: [mockTask, task2],
      };

      mockState.currentBoard = {
        ...mockBoard,
        columns: [colWithMultipleTasks, mockColumn2],
      };

      const { result } = renderHook(() => useTaskColumn(task2));

      expect(result.current.column?.id).toBe('col-1');
      expect(result.current.column?.tasks).toHaveLength(2);
    });

    it('should return first matching column if task exists in multiple columns', () => {
      // Edge case: task duplicated in multiple columns
      const duplicatedTask: Task = {
        ...mockTask,
        id: 'dup-task',
      };

      const col1WithDup: Column = {
        ...mockColumn1,
        tasks: [duplicatedTask],
      };

      const col2WithDup: Column = {
        ...mockColumn2,
        tasks: [duplicatedTask],
      };

      mockState.currentBoard = {
        ...mockBoard,
        columns: [col1WithDup, col2WithDup],
      };

      const { result } = renderHook(() => useTaskColumn(duplicatedTask));

      // Should return first matching column
      expect(result.current.column?.id).toBe('col-1');
    });
  });

  describe('Memoization behavior', () => {
    it('should memoize column result', () => {
      const { result, rerender } = renderHook(() => useTaskColumn(mockTask));

      const firstColumn = result.current.column;
      const firstColumnName = result.current.columnName;

      rerender();

      // Same references due to memoization
      expect(result.current.column).toBe(firstColumn);
      expect(result.current.columnName).toBe(firstColumnName);
    });

    it('should update when task changes', () => {
      const { result, rerender } = renderHook(
        ({ task }) => useTaskColumn(task),
        {
          initialProps: { task: mockTask },
        }
      );

      expect(result.current.column?.id).toBe('col-1');

      const newTask: Task = {
        ...mockTask,
        id: 'new-task',
      };

      const col2WithNewTask: Column = {
        ...mockColumn2,
        tasks: [newTask],
      };

      mockState.currentBoard = {
        ...mockBoard,
        columns: [mockColumn1, col2WithNewTask],
      };

      rerender({ task: newTask });

      expect(result.current.column?.id).toBe('col-2');
    });

    it('should update when board columns change', () => {
      const { result, rerender } = renderHook(() => useTaskColumn(mockTask));

      expect(result.current.column?.id).toBe('col-1');

      // Move task to different column
      const col2WithTask: Column = {
        ...mockColumn2,
        tasks: [mockTask],
      };

      const col1Empty: Column = {
        ...mockColumn1,
        tasks: [],
      };

      mockState.currentBoard = {
        ...mockBoard,
        columns: [col1Empty, col2WithTask],
      };

      rerender();

      expect(result.current.column?.id).toBe('col-2');
    });
  });

  describe('Edge cases', () => {
    it('should handle task with undefined id', () => {
      const taskNoId = {
        ...mockTask,
        id: undefined as any,
      };

      const { result } = renderHook(() => useTaskColumn(taskNoId));

      expect(result.current.column).toBeUndefined();
      expect(result.current.columnName).toBeUndefined();
    });

    it('should handle empty string task id', () => {
      const taskEmptyId = {
        ...mockTask,
        id: '',
      };

      const { result } = renderHook(() => useTaskColumn(taskEmptyId));

      expect(result.current.column).toBeUndefined();
    });

    it('should handle columns with undefined tasks array', () => {
      const colNoTasks: Column = {
        ...mockColumn1,
        tasks: undefined as any,
      };

      mockState.currentBoard = {
        ...mockBoard,
        columns: [colNoTasks],
      };

      // This will throw an error in the actual implementation (col.tasks.some)
      // The implementation doesn't guard against undefined tasks array
      expect(() => {
        renderHook(() => useTaskColumn(mockTask));
      }).toThrow();
    });
  });
});
