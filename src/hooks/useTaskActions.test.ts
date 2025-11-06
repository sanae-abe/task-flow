/**
 * useTaskActions hook tests
 * タスクアクション管理機能の包括的テスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskActions } from './useTaskActions';
import type { Task } from '../types';

// Mock dependencies
const mockDeleteTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockMoveTask = vi.fn();
const mockDuplicateTask = vi.fn();
const mockAddSubTask = vi.fn();
const mockToggleSubTask = vi.fn();
const mockUpdateSubTask = vi.fn();
const mockDeleteSubTask = vi.fn();
const mockReorderSubTasks = vi.fn();
const mockMoveTaskToBoard = vi.fn();

vi.mock('../contexts/KanbanContext', () => ({
  useKanban: vi.fn(() => ({
    deleteTask: mockDeleteTask,
    updateTask: mockUpdateTask,
    moveTask: mockMoveTask,
    duplicateTask: mockDuplicateTask,
    addSubTask: mockAddSubTask,
    toggleSubTask: mockToggleSubTask,
    updateSubTask: mockUpdateSubTask,
    deleteSubTask: mockDeleteSubTask,
    reorderSubTasks: mockReorderSubTasks,
    state: {
      currentBoard: {
        id: 'board-1',
        columns: [
          { id: 'col-1', tasks: [] },
          { id: 'col-2', tasks: [] },
        ],
      },
    },
  })),
}));

vi.mock('../contexts/BoardContext', () => ({
  useBoard: vi.fn(() => ({
    moveTaskToBoard: mockMoveTaskToBoard,
    currentBoard: { id: 'board-1' },
  })),
}));

vi.mock('./useTaskColumn', () => ({
  useTaskColumn: vi.fn(() => ({
    column: { id: 'col-1' },
  })),
}));

describe('useTaskActions', () => {
  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: '',
    status: 'todo',
    priority: 'medium',
    labels: [],
    subTasks: [{ id: 'subtask-1', title: 'Subtask 1', completed: false }],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    dueDate: null,
    completedAt: null,
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should initialize with default states', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      expect(result.current.showDeleteConfirm).toBe(false);
      expect(result.current.showEditDialog).toBe(false);
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      expect(typeof result.current.handleEdit).toBe('function');
      expect(typeof result.current.handleDelete).toBe('function');
      expect(typeof result.current.handleDuplicate).toBe('function');
      expect(typeof result.current.handleMoveToBoard).toBe('function');
      expect(typeof result.current.handleConfirmDelete).toBe('function');
      expect(typeof result.current.handleSaveEdit).toBe('function');
      expect(typeof result.current.handleDeleteFromDialog).toBe('function');
      expect(typeof result.current.handleAddSubTask).toBe('function');
      expect(typeof result.current.handleToggleSubTask).toBe('function');
      expect(typeof result.current.handleEditSubTask).toBe('function');
      expect(typeof result.current.handleDeleteSubTask).toBe('function');
      expect(typeof result.current.handleReorderSubTasks).toBe('function');
    });
  });

  describe('Edit operations', () => {
    it('should show edit dialog when handleEdit is called', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      act(() => {
        result.current.handleEdit();
      });

      expect(result.current.showEditDialog).toBe(true);
    });

    it('should save edited task', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      const updatedTask: Task = { ...mockTask, title: 'Updated Task' };

      act(() => {
        result.current.handleSaveEdit(updatedTask);
      });

      expect(mockUpdateTask).toHaveBeenCalledWith('task-1', updatedTask);
      expect(result.current.showEditDialog).toBe(false);
    });

    it('should move task when targetColumnId is different', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      const updatedTask: Task = { ...mockTask, title: 'Updated Task' };

      act(() => {
        result.current.handleSaveEdit(updatedTask, 'col-2');
      });

      expect(mockUpdateTask).toHaveBeenCalledWith('task-1', updatedTask);
      expect(mockMoveTask).toHaveBeenCalledWith('task-1', 'col-1', 'col-2', 0);
    });

    it('should not move task when targetColumnId is same', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      const updatedTask: Task = { ...mockTask };

      act(() => {
        result.current.handleSaveEdit(updatedTask, 'col-1');
      });

      expect(mockUpdateTask).toHaveBeenCalled();
      expect(mockMoveTask).not.toHaveBeenCalled();
    });

    it('should close edit dialog manually', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      act(() => {
        result.current.handleEdit();
      });

      expect(result.current.showEditDialog).toBe(true);

      act(() => {
        result.current.setShowEditDialog(false);
      });

      expect(result.current.showEditDialog).toBe(false);
    });
  });

  describe('Delete operations', () => {
    it('should show delete confirm dialog', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      act(() => {
        result.current.handleDelete();
      });

      expect(result.current.showDeleteConfirm).toBe(true);
    });

    it('should delete task on confirm', () => {
      const { result } = renderHook(() =>
        useTaskActions(mockTask, mockOnClose)
      );

      act(() => {
        result.current.handleConfirmDelete();
      });

      expect(mockDeleteTask).toHaveBeenCalledWith('task-1', 'col-1');
      expect(mockOnClose).toHaveBeenCalled();
      expect(result.current.showDeleteConfirm).toBe(false);
    });

    it('should delete task from edit dialog', () => {
      const { result } = renderHook(() =>
        useTaskActions(mockTask, mockOnClose)
      );

      act(() => {
        result.current.handleDeleteFromDialog('task-1');
      });

      expect(mockDeleteTask).toHaveBeenCalledWith('task-1', 'col-1');
      expect(mockOnClose).toHaveBeenCalled();
      expect(result.current.showEditDialog).toBe(false);
    });

    it('should not delete if task is null', () => {
      const { result } = renderHook(() => useTaskActions(null));

      act(() => {
        result.current.handleConfirmDelete();
      });

      expect(mockDeleteTask).not.toHaveBeenCalled();
    });

    it('should close delete confirm manually', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      act(() => {
        result.current.handleDelete();
      });

      expect(result.current.showDeleteConfirm).toBe(true);

      act(() => {
        result.current.setShowDeleteConfirm(false);
      });

      expect(result.current.showDeleteConfirm).toBe(false);
    });
  });

  describe('Duplicate operation', () => {
    it('should duplicate task', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      act(() => {
        result.current.handleDuplicate();
      });

      expect(mockDuplicateTask).toHaveBeenCalledWith('task-1');
    });

    it('should not duplicate if task is null', () => {
      const { result } = renderHook(() => useTaskActions(null));

      act(() => {
        result.current.handleDuplicate();
      });

      expect(mockDuplicateTask).not.toHaveBeenCalled();
    });
  });

  describe('Move to board operation', () => {
    it('should move task to another board', () => {
      const { result } = renderHook(() =>
        useTaskActions(mockTask, mockOnClose)
      );

      act(() => {
        result.current.handleMoveToBoard('board-2');
      });

      expect(mockMoveTaskToBoard).toHaveBeenCalledWith(
        'task-1',
        'board-1',
        'col-1',
        'board-2'
      );
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not move if task is null', () => {
      const { result } = renderHook(() => useTaskActions(null, mockOnClose));

      act(() => {
        result.current.handleMoveToBoard('board-2');
      });

      expect(mockMoveTaskToBoard).not.toHaveBeenCalled();
    });
  });

  describe('SubTask operations', () => {
    it('should add subtask', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      act(() => {
        result.current.handleAddSubTask('New Subtask');
      });

      expect(mockAddSubTask).toHaveBeenCalledWith('task-1', 'New Subtask');
    });

    it('should toggle subtask', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      act(() => {
        result.current.handleToggleSubTask('subtask-1');
      });

      expect(mockToggleSubTask).toHaveBeenCalledWith('task-1', 'subtask-1');
    });

    it('should edit subtask', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      act(() => {
        result.current.handleEditSubTask('subtask-1', 'Updated Subtask');
      });

      expect(mockUpdateSubTask).toHaveBeenCalledWith(
        'task-1',
        'subtask-1',
        'Updated Subtask'
      );
    });

    it('should delete subtask', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      act(() => {
        result.current.handleDeleteSubTask('subtask-1');
      });

      expect(mockDeleteSubTask).toHaveBeenCalledWith('task-1', 'subtask-1');
    });

    it('should reorder subtasks', () => {
      const { result } = renderHook(() => useTaskActions(mockTask));

      act(() => {
        result.current.handleReorderSubTasks(0, 1);
      });

      expect(mockReorderSubTasks).toHaveBeenCalledWith('task-1', 0, 1);
    });

    it('should not perform subtask operations if task is null', () => {
      const { result } = renderHook(() => useTaskActions(null));

      act(() => {
        result.current.handleAddSubTask('New Subtask');
        result.current.handleToggleSubTask('subtask-1');
        result.current.handleEditSubTask('subtask-1', 'Updated');
        result.current.handleDeleteSubTask('subtask-1');
        result.current.handleReorderSubTasks(0, 1);
      });

      expect(mockAddSubTask).not.toHaveBeenCalled();
      expect(mockToggleSubTask).not.toHaveBeenCalled();
      expect(mockUpdateSubTask).not.toHaveBeenCalled();
      expect(mockDeleteSubTask).not.toHaveBeenCalled();
      expect(mockReorderSubTasks).not.toHaveBeenCalled();
    });
  });

  describe('Callback stability', () => {
    it('should preserve function references across renders', () => {
      const { result, rerender } = renderHook(() => useTaskActions(mockTask));

      const handleEdit = result.current.handleEdit;
      const handleDelete = result.current.handleDelete;
      const handleDuplicate = result.current.handleDuplicate;

      rerender();

      expect(result.current.handleEdit).toBe(handleEdit);
      expect(result.current.handleDelete).toBe(handleDelete);
      expect(result.current.handleDuplicate).toBe(handleDuplicate);
    });
  });
});
