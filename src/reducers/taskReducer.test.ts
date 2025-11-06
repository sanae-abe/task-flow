/**
 * Task Reducer tests
 * タスクアクション処理の包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleTaskActions } from './taskReducer';
import type { KanbanState, KanbanBoard, Task } from '../types';

// Mock logger
vi.mock('../utils/logger', () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock UUID
vi.mock('uuid', () => ({
  v4: () => `test-uuid-${Math.random().toString(36).substr(2, 9)}`,
}));

describe('Task Reducer', () => {
  let initialState: KanbanState;
  let mockBoard: KanbanBoard;
  let mockTask: Task;

  beforeEach(() => {
    mockTask = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo',
      priority: 'medium',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      labels: [],
      subTasks: [],
      dueDate: null,
      completedAt: null,
    };

    mockBoard = {
      id: 'board-1',
      title: 'Test Board',
      columns: [
        {
          id: 'col-1',
          title: 'To Do',
          tasks: [mockTask],
          color: '#6b7280',
        },
        {
          id: 'col-2',
          title: 'In Progress',
          tasks: [],
          color: '#3b82f6',
        },
        {
          id: 'col-3',
          title: 'Done',
          tasks: [],
          color: '#10b981',
        },
      ],
      labels: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    initialState = {
      boards: [mockBoard],
      currentBoard: mockBoard,
      viewMode: 'kanban',
      sortOption: null,
      taskFilter: {
        type: 'all',
        label: '',
      },
    };
  });

  describe('ADD_TASK', () => {
    it('should add new task to specified column', () => {
      const result = handleTaskActions(initialState, {
        type: 'ADD_TASK',
        payload: {
          columnId: 'col-2',
          title: 'New Task',
          description: 'New Description',
        },
      });

      expect(result.currentBoard?.columns[1]?.tasks).toHaveLength(1);
      const newTask = result.currentBoard?.columns[1]?.tasks[0];
      expect(newTask?.title).toBe('New Task');
      expect(newTask?.description).toBe('New Description');
    });

    it('should set default values for new task', () => {
      const result = handleTaskActions(initialState, {
        type: 'ADD_TASK',
        payload: {
          columnId: 'col-2',
          title: 'New Task',
        },
      });

      const newTask = result.currentBoard?.columns[1]?.tasks[0];
      expect(newTask?.priority).toBe('medium');
      expect(newTask?.labels).toEqual([]);
      expect(newTask?.files).toEqual([]);
      expect(newTask?.subTasks).toEqual([]);
      expect(newTask?.completedAt).toBeNull();
    });

    it('should set custom priority and labels', () => {
      const labels = [
        {
          id: 'label-1',
          name: 'Bug',
          color: '#ef4444',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const result = handleTaskActions(initialState, {
        type: 'ADD_TASK',
        payload: {
          columnId: 'col-2',
          title: 'New Task',
          priority: 'high',
          labels,
        },
      });

      const newTask = result.currentBoard?.columns[1]?.tasks[0];
      expect(newTask?.priority).toBe('high');
      expect(newTask?.labels).toEqual(labels);
    });

    it('should set due date when provided', () => {
      const dueDate = new Date('2025-12-31');

      const result = handleTaskActions(initialState, {
        type: 'ADD_TASK',
        payload: {
          columnId: 'col-2',
          title: 'New Task',
          dueDate,
        },
      });

      const newTask = result.currentBoard?.columns[1]?.tasks[0];
      expect(newTask?.dueDate).toBe(dueDate.toISOString());
    });

    it('should return unchanged state when no current board', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const result = handleTaskActions(stateWithoutBoard, {
        type: 'ADD_TASK',
        payload: {
          columnId: 'col-1',
          title: 'New Task',
        },
      });

      expect(result).toEqual(stateWithoutBoard);
    });

    it('should update board updatedAt timestamp', () => {
      const result = handleTaskActions(initialState, {
        type: 'ADD_TASK',
        payload: {
          columnId: 'col-2',
          title: 'New Task',
        },
      });

      expect(result.currentBoard?.updatedAt).not.toBe(mockBoard.updatedAt);
    });

    it('should set task createdAt and updatedAt timestamps', () => {
      const result = handleTaskActions(initialState, {
        type: 'ADD_TASK',
        payload: {
          columnId: 'col-2',
          title: 'New Task',
        },
      });

      const newTask = result.currentBoard?.columns[1]?.tasks[0];
      expect(newTask?.createdAt).toBeDefined();
      expect(newTask?.updatedAt).toBeDefined();
      expect(typeof newTask?.createdAt).toBe('string');
      expect(typeof newTask?.updatedAt).toBe('string');
    });
  });

  describe('UPDATE_TASK', () => {
    it('should update task title', () => {
      const result = handleTaskActions(initialState, {
        type: 'UPDATE_TASK',
        payload: {
          taskId: 'task-1',
          updates: { title: 'Updated Task' },
        },
      });

      expect(result.currentBoard?.columns[0]?.tasks[0]?.title).toBe(
        'Updated Task'
      );
    });

    it('should update task description', () => {
      const result = handleTaskActions(initialState, {
        type: 'UPDATE_TASK',
        payload: {
          taskId: 'task-1',
          updates: { description: 'Updated Description' },
        },
      });

      expect(result.currentBoard?.columns[0]?.tasks[0]?.description).toBe(
        'Updated Description'
      );
    });

    it('should update task priority', () => {
      const result = handleTaskActions(initialState, {
        type: 'UPDATE_TASK',
        payload: {
          taskId: 'task-1',
          updates: { priority: 'critical' },
        },
      });

      expect(result.currentBoard?.columns[0]?.tasks[0]?.priority).toBe(
        'critical'
      );
    });

    it('should update multiple fields at once', () => {
      const result = handleTaskActions(initialState, {
        type: 'UPDATE_TASK',
        payload: {
          taskId: 'task-1',
          updates: {
            title: 'Updated Task',
            description: 'Updated Description',
            priority: 'high',
          },
        },
      });

      const updatedTask = result.currentBoard?.columns[0]?.tasks[0];
      expect(updatedTask?.title).toBe('Updated Task');
      expect(updatedTask?.description).toBe('Updated Description');
      expect(updatedTask?.priority).toBe('high');
    });

    it('should update task updatedAt timestamp', () => {
      const result = handleTaskActions(initialState, {
        type: 'UPDATE_TASK',
        payload: {
          taskId: 'task-1',
          updates: { title: 'Updated Task' },
        },
      });

      expect(result.currentBoard?.columns[0]?.tasks[0]?.updatedAt).not.toBe(
        mockTask.updatedAt
      );
    });

    it('should return unchanged state when no current board', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const result = handleTaskActions(stateWithoutBoard, {
        type: 'UPDATE_TASK',
        payload: {
          taskId: 'task-1',
          updates: { title: 'Updated' },
        },
      });

      expect(result).toEqual(stateWithoutBoard);
    });

    it('should handle updating non-existent task gracefully', () => {
      const result = handleTaskActions(initialState, {
        type: 'UPDATE_TASK',
        payload: {
          taskId: 'non-existent',
          updates: { title: 'Updated' },
        },
      });

      expect(result.currentBoard?.columns[0]?.tasks[0]?.title).toBe(
        'Test Task'
      );
    });

    it('should preserve other task properties when updating', () => {
      const result = handleTaskActions(initialState, {
        type: 'UPDATE_TASK',
        payload: {
          taskId: 'task-1',
          updates: { title: 'Updated Task' },
        },
      });

      const updatedTask = result.currentBoard?.columns[0]?.tasks[0];
      expect(updatedTask?.description).toBe(mockTask.description);
      expect(updatedTask?.priority).toBe(mockTask.priority);
      expect(updatedTask?.labels).toEqual(mockTask.labels);
    });
  });

  describe('DELETE_TASK', () => {
    it('should delete task from column', () => {
      const result = handleTaskActions(initialState, {
        type: 'DELETE_TASK',
        payload: { taskId: 'task-1' },
      });

      expect(result.currentBoard?.columns[0]?.tasks).toHaveLength(0);
    });

    it('should update board updatedAt timestamp', () => {
      const result = handleTaskActions(initialState, {
        type: 'DELETE_TASK',
        payload: { taskId: 'task-1' },
      });

      expect(result.currentBoard?.updatedAt).not.toBe(mockBoard.updatedAt);
    });

    it('should return unchanged state when no current board', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const result = handleTaskActions(stateWithoutBoard, {
        type: 'DELETE_TASK',
        payload: { taskId: 'task-1' },
      });

      expect(result).toEqual(stateWithoutBoard);
    });

    it('should handle deleting non-existent task gracefully', () => {
      const result = handleTaskActions(initialState, {
        type: 'DELETE_TASK',
        payload: { taskId: 'non-existent' },
      });

      expect(result.currentBoard?.columns[0]?.tasks).toHaveLength(1);
    });

    it('should not affect other tasks when deleting', () => {
      const secondTask: Task = {
        ...mockTask,
        id: 'task-2',
        title: 'Second Task',
      };

      const boardWithMultipleTasks = {
        ...mockBoard,
        columns: [
          {
            ...mockBoard.columns[0]!,
            tasks: [mockTask, secondTask],
          },
          ...mockBoard.columns.slice(1),
        ],
      };

      const stateWithMultipleTasks: KanbanState = {
        ...initialState,
        currentBoard: boardWithMultipleTasks,
        boards: [boardWithMultipleTasks],
      };

      const result = handleTaskActions(stateWithMultipleTasks, {
        type: 'DELETE_TASK',
        payload: { taskId: 'task-1' },
      });

      expect(result.currentBoard?.columns[0]?.tasks).toHaveLength(1);
      expect(result.currentBoard?.columns[0]?.tasks[0]?.id).toBe('task-2');
    });
  });

  describe('MOVE_TASK', () => {
    it('should move task between columns', () => {
      const result = handleTaskActions(initialState, {
        type: 'MOVE_TASK',
        payload: {
          taskId: 'task-1',
          sourceColumnId: 'col-1',
          targetColumnId: 'col-2',
          targetIndex: 0,
        },
      });

      expect(result.currentBoard?.columns[0]?.tasks).toHaveLength(0);
      expect(result.currentBoard?.columns[1]?.tasks).toHaveLength(1);
      expect(result.currentBoard?.columns[1]?.tasks[0]?.id).toBe('task-1');
    });

    it('should reorder task within same column', () => {
      const secondTask: Task = {
        ...mockTask,
        id: 'task-2',
        title: 'Second Task',
      };

      const thirdTask: Task = {
        ...mockTask,
        id: 'task-3',
        title: 'Third Task',
      };

      const boardWithMultipleTasks = {
        ...mockBoard,
        columns: [
          {
            ...mockBoard.columns[0]!,
            tasks: [mockTask, secondTask, thirdTask],
          },
          ...mockBoard.columns.slice(1),
        ],
      };

      const stateWithMultipleTasks: KanbanState = {
        ...initialState,
        currentBoard: boardWithMultipleTasks,
        boards: [boardWithMultipleTasks],
      };

      const result = handleTaskActions(stateWithMultipleTasks, {
        type: 'MOVE_TASK',
        payload: {
          taskId: 'task-1',
          sourceColumnId: 'col-1',
          targetColumnId: 'col-1',
          targetIndex: 2,
        },
      });

      expect(result.currentBoard?.columns[0]?.tasks).toHaveLength(3);
      expect(result.currentBoard?.columns[0]?.tasks[0]?.id).toBe('task-2');
      expect(result.currentBoard?.columns[0]?.tasks[1]?.id).toBe('task-3');
      expect(result.currentBoard?.columns[0]?.tasks[2]?.id).toBe('task-1');
    });

    it('should set completedAt when moving to rightmost column', () => {
      const result = handleTaskActions(initialState, {
        type: 'MOVE_TASK',
        payload: {
          taskId: 'task-1',
          sourceColumnId: 'col-1',
          targetColumnId: 'col-3',
          targetIndex: 0,
        },
      });

      const movedTask = result.currentBoard?.columns[2]?.tasks[0];
      expect(movedTask?.completedAt).not.toBeNull();
      expect(typeof movedTask?.completedAt).toBe('string');
    });

    it('should clear completedAt when moving from rightmost column', () => {
      const completedTask: Task = {
        ...mockTask,
        completedAt: '2025-01-01T00:00:00.000Z',
      };

      const boardWithCompletedTask = {
        ...mockBoard,
        columns: [
          mockBoard.columns[0]!,
          mockBoard.columns[1]!,
          {
            ...mockBoard.columns[2]!,
            tasks: [completedTask],
          },
        ],
      };

      const stateWithCompletedTask: KanbanState = {
        ...initialState,
        currentBoard: boardWithCompletedTask,
        boards: [boardWithCompletedTask],
      };

      const result = handleTaskActions(stateWithCompletedTask, {
        type: 'MOVE_TASK',
        payload: {
          taskId: 'task-1',
          sourceColumnId: 'col-3',
          targetColumnId: 'col-1',
          targetIndex: 0,
        },
      });

      const movedTask = result.currentBoard?.columns[0]?.tasks[0];
      expect(movedTask?.completedAt).toBeNull();
    });

    it('should not change completedAt when moving between non-rightmost columns', () => {
      const result = handleTaskActions(initialState, {
        type: 'MOVE_TASK',
        payload: {
          taskId: 'task-1',
          sourceColumnId: 'col-1',
          targetColumnId: 'col-2',
          targetIndex: 0,
        },
      });

      const movedTask = result.currentBoard?.columns[1]?.tasks[0];
      expect(movedTask?.completedAt).toBeNull();
    });

    it('should update task updatedAt when moving to rightmost column', () => {
      const result = handleTaskActions(initialState, {
        type: 'MOVE_TASK',
        payload: {
          taskId: 'task-1',
          sourceColumnId: 'col-1',
          targetColumnId: 'col-3',
          targetIndex: 0,
        },
      });

      const movedTask = result.currentBoard?.columns[2]?.tasks[0];
      expect(movedTask?.updatedAt).not.toBe(mockTask.updatedAt);
    });

    it('should return unchanged state when no current board', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const result = handleTaskActions(stateWithoutBoard, {
        type: 'MOVE_TASK',
        payload: {
          taskId: 'task-1',
          sourceColumnId: 'col-1',
          targetColumnId: 'col-2',
          targetIndex: 0,
        },
      });

      expect(result).toEqual(stateWithoutBoard);
    });

    it('should return unchanged state when task not found', () => {
      const result = handleTaskActions(initialState, {
        type: 'MOVE_TASK',
        payload: {
          taskId: 'non-existent',
          sourceColumnId: 'col-1',
          targetColumnId: 'col-2',
          targetIndex: 0,
        },
      });

      expect(result).toEqual(initialState);
    });

    it('should handle targetIndex beyond array length', () => {
      const result = handleTaskActions(initialState, {
        type: 'MOVE_TASK',
        payload: {
          taskId: 'task-1',
          sourceColumnId: 'col-1',
          targetColumnId: 'col-2',
          targetIndex: 999,
        },
      });

      expect(result.currentBoard?.columns[1]?.tasks).toHaveLength(1);
      expect(result.currentBoard?.columns[1]?.tasks[0]?.id).toBe('task-1');
    });

    it('should handle negative targetIndex', () => {
      const result = handleTaskActions(initialState, {
        type: 'MOVE_TASK',
        payload: {
          taskId: 'task-1',
          sourceColumnId: 'col-1',
          targetColumnId: 'col-2',
          targetIndex: -1,
        },
      });

      expect(result.currentBoard?.columns[1]?.tasks).toHaveLength(1);
      expect(result.currentBoard?.columns[1]?.tasks[0]?.id).toBe('task-1');
    });
  });

  describe('Unknown actions', () => {
    it('should return unchanged state for unknown action', () => {
      const result = handleTaskActions(initialState, {
        type: 'UNKNOWN_ACTION' as any,
        payload: {},
      });

      expect(result).toEqual(initialState);
    });
  });

  describe('Edge cases', () => {
    it('should handle adding task to column with existing tasks', () => {
      const result = handleTaskActions(initialState, {
        type: 'ADD_TASK',
        payload: {
          columnId: 'col-1',
          title: 'New Task',
        },
      });

      expect(result.currentBoard?.columns[0]?.tasks).toHaveLength(2);
    });

    it('should handle empty description', () => {
      const result = handleTaskActions(initialState, {
        type: 'ADD_TASK',
        payload: {
          columnId: 'col-2',
          title: 'New Task',
          description: '',
        },
      });

      const newTask = result.currentBoard?.columns[1]?.tasks[0];
      expect(newTask?.description).toBe('');
    });

    it('should handle undefined description', () => {
      const result = handleTaskActions(initialState, {
        type: 'ADD_TASK',
        payload: {
          columnId: 'col-2',
          title: 'New Task',
          description: undefined,
        },
      });

      const newTask = result.currentBoard?.columns[1]?.tasks[0];
      expect(newTask?.description).toBe('');
    });
  });
});
