/**
 * Kanban Reducer tests
 * メインreducerのアクションルーティングとサブタスク・フィルター処理の包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { kanbanReducer } from './index';
import type { KanbanState, KanbanBoard, SubTask } from '../types';

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

describe('Kanban Reducer (Main)', () => {
  let initialState: KanbanState;
  let mockBoard: KanbanBoard;

  beforeEach(() => {
    mockBoard = {
      id: 'board-1',
      title: 'Test Board',
      columns: [
        {
          id: 'col-1',
          title: 'To Do',
          tasks: [
            {
              id: 'task-1',
              title: 'Test Task',
              description: 'Test Description',
              status: 'todo',
              priority: 'medium',
              createdAt: '2025-01-01T00:00:00.000Z',
              updatedAt: '2025-01-01T00:00:00.000Z',
              labels: [],
              subTasks: [
                {
                  id: 'subtask-1',
                  title: 'Subtask 1',
                  completed: false,
                },
              ],
              dueDate: null,
              completedAt: null,
            },
          ],
          color: '#6b7280',
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
        priority: null,
        labels: [],
        dueDate: null,
        searchQuery: '',
      },
    };
  });

  describe('Action routing', () => {
    it('should route board actions to handleBoardActions', () => {
      const result = kanbanReducer(initialState, {
        type: 'CREATE_BOARD',
        payload: { title: 'New Board' },
      });

      expect(result.boards).toHaveLength(2);
      expect(result.boards[1]?.title).toBe('New Board');
    });

    it('should route column actions to handleColumnActions', () => {
      const result = kanbanReducer(initialState, {
        type: 'ADD_COLUMN',
        payload: { title: 'New Column' },
      });

      expect(result.currentBoard?.columns).toHaveLength(2);
      expect(result.currentBoard?.columns[1]?.title).toBe('New Column');
    });

    it('should route task actions to handleTaskActions', () => {
      const result = kanbanReducer(initialState, {
        type: 'ADD_TASK',
        payload: {
          columnId: 'col-1',
          title: 'New Task',
        },
      });

      expect(result.currentBoard?.columns[0]?.tasks).toHaveLength(2);
    });

    it('should route label actions to handleLabelActions', () => {
      const newLabel = {
        id: 'label-1',
        name: 'Bug',
        color: '#ef4444',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const result = kanbanReducer(initialState, {
        type: 'ADD_LABEL',
        payload: { label: newLabel },
      });

      expect(result.currentBoard?.labels).toHaveLength(1);
      expect(result.currentBoard?.labels[0]).toEqual(newLabel);
    });
  });

  describe('ADD_SUBTASK', () => {
    it('should add subtask to task', () => {
      const newSubTask: SubTask = {
        id: 'subtask-2',
        title: 'New Subtask',
        completed: false,
      };

      const result = kanbanReducer(initialState, {
        type: 'ADD_SUBTASK',
        payload: { taskId: 'task-1', subTask: newSubTask },
      });

      const task = result.currentBoard?.columns[0]?.tasks[0];
      expect(task?.subTasks).toHaveLength(2);
      expect(task?.subTasks[1]).toEqual(newSubTask);
    });

    it('should update task updatedAt when adding subtask', () => {
      const newSubTask: SubTask = {
        id: 'subtask-2',
        title: 'New Subtask',
        completed: false,
      };

      const result = kanbanReducer(initialState, {
        type: 'ADD_SUBTASK',
        payload: { taskId: 'task-1', subTask: newSubTask },
      });

      const task = result.currentBoard?.columns[0]?.tasks[0];
      expect(task?.updatedAt).not.toBe('2025-01-01T00:00:00.000Z');
    });

    it('should update board updatedAt when adding subtask', () => {
      const newSubTask: SubTask = {
        id: 'subtask-2',
        title: 'New Subtask',
        completed: false,
      };

      const result = kanbanReducer(initialState, {
        type: 'ADD_SUBTASK',
        payload: { taskId: 'task-1', subTask: newSubTask },
      });

      expect(result.currentBoard?.updatedAt).not.toBe(mockBoard.updatedAt);
    });

    it('should return unchanged state when no current board', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const newSubTask: SubTask = {
        id: 'subtask-2',
        title: 'New Subtask',
        completed: false,
      };

      const result = kanbanReducer(stateWithoutBoard, {
        type: 'ADD_SUBTASK',
        payload: { taskId: 'task-1', subTask: newSubTask },
      });

      expect(result).toEqual(stateWithoutBoard);
    });

    it('should not affect other tasks when adding subtask', () => {
      const secondTask = {
        id: 'task-2',
        title: 'Second Task',
        description: '',
        status: 'todo' as const,
        priority: 'medium' as const,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        labels: [],
        subTasks: [],
        dueDate: null,
        completedAt: null,
      };

      const boardWithMultipleTasks = {
        ...mockBoard,
        columns: [
          {
            ...mockBoard.columns[0]!,
            tasks: [mockBoard.columns[0]!.tasks[0]!, secondTask],
          },
        ],
      };

      const stateWithMultipleTasks: KanbanState = {
        ...initialState,
        currentBoard: boardWithMultipleTasks,
        boards: [boardWithMultipleTasks],
      };

      const newSubTask: SubTask = {
        id: 'subtask-2',
        title: 'New Subtask',
        completed: false,
      };

      const result = kanbanReducer(stateWithMultipleTasks, {
        type: 'ADD_SUBTASK',
        payload: { taskId: 'task-1', subTask: newSubTask },
      });

      expect(result.currentBoard?.columns[0]?.tasks[1]?.subTasks).toHaveLength(0);
    });
  });

  describe('UPDATE_SUBTASK', () => {
    it('should update subtask title', () => {
      const result = kanbanReducer(initialState, {
        type: 'UPDATE_SUBTASK',
        payload: {
          taskId: 'task-1',
          subTaskId: 'subtask-1',
          updates: { title: 'Updated Subtask' },
        },
      });

      const task = result.currentBoard?.columns[0]?.tasks[0];
      expect(task?.subTasks[0]?.title).toBe('Updated Subtask');
    });

    it('should update subtask completed status', () => {
      const result = kanbanReducer(initialState, {
        type: 'UPDATE_SUBTASK',
        payload: {
          taskId: 'task-1',
          subTaskId: 'subtask-1',
          updates: { completed: true },
        },
      });

      const task = result.currentBoard?.columns[0]?.tasks[0];
      expect(task?.subTasks[0]?.completed).toBe(true);
    });

    it('should update multiple subtask properties', () => {
      const result = kanbanReducer(initialState, {
        type: 'UPDATE_SUBTASK',
        payload: {
          taskId: 'task-1',
          subTaskId: 'subtask-1',
          updates: { title: 'Updated Subtask', completed: true },
        },
      });

      const task = result.currentBoard?.columns[0]?.tasks[0];
      expect(task?.subTasks[0]?.title).toBe('Updated Subtask');
      expect(task?.subTasks[0]?.completed).toBe(true);
    });

    it('should update task updatedAt when updating subtask', () => {
      const result = kanbanReducer(initialState, {
        type: 'UPDATE_SUBTASK',
        payload: {
          taskId: 'task-1',
          subTaskId: 'subtask-1',
          updates: { completed: true },
        },
      });

      const task = result.currentBoard?.columns[0]?.tasks[0];
      expect(task?.updatedAt).not.toBe('2025-01-01T00:00:00.000Z');
    });

    it('should update board updatedAt when updating subtask', () => {
      const result = kanbanReducer(initialState, {
        type: 'UPDATE_SUBTASK',
        payload: {
          taskId: 'task-1',
          subTaskId: 'subtask-1',
          updates: { completed: true },
        },
      });

      expect(result.currentBoard?.updatedAt).not.toBe(mockBoard.updatedAt);
    });

    it('should return unchanged state when no current board', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const result = kanbanReducer(stateWithoutBoard, {
        type: 'UPDATE_SUBTASK',
        payload: {
          taskId: 'task-1',
          subTaskId: 'subtask-1',
          updates: { completed: true },
        },
      });

      expect(result).toEqual(stateWithoutBoard);
    });

    it('should handle updating non-existent subtask gracefully', () => {
      const result = kanbanReducer(initialState, {
        type: 'UPDATE_SUBTASK',
        payload: {
          taskId: 'task-1',
          subTaskId: 'non-existent',
          updates: { completed: true },
        },
      });

      const task = result.currentBoard?.columns[0]?.tasks[0];
      expect(task?.subTasks[0]?.title).toBe('Subtask 1');
      expect(task?.subTasks[0]?.completed).toBe(false);
    });
  });

  describe('DELETE_SUBTASK', () => {
    it('should delete subtask from task', () => {
      const result = kanbanReducer(initialState, {
        type: 'DELETE_SUBTASK',
        payload: { taskId: 'task-1', subTaskId: 'subtask-1' },
      });

      const task = result.currentBoard?.columns[0]?.tasks[0];
      expect(task?.subTasks).toHaveLength(0);
    });

    it('should update task updatedAt when deleting subtask', () => {
      const result = kanbanReducer(initialState, {
        type: 'DELETE_SUBTASK',
        payload: { taskId: 'task-1', subTaskId: 'subtask-1' },
      });

      const task = result.currentBoard?.columns[0]?.tasks[0];
      expect(task?.updatedAt).not.toBe('2025-01-01T00:00:00.000Z');
    });

    it('should update board updatedAt when deleting subtask', () => {
      const result = kanbanReducer(initialState, {
        type: 'DELETE_SUBTASK',
        payload: { taskId: 'task-1', subTaskId: 'subtask-1' },
      });

      expect(result.currentBoard?.updatedAt).not.toBe(mockBoard.updatedAt);
    });

    it('should return unchanged state when no current board', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const result = kanbanReducer(stateWithoutBoard, {
        type: 'DELETE_SUBTASK',
        payload: { taskId: 'task-1', subTaskId: 'subtask-1' },
      });

      expect(result).toEqual(stateWithoutBoard);
    });

    it('should handle deleting non-existent subtask gracefully', () => {
      const result = kanbanReducer(initialState, {
        type: 'DELETE_SUBTASK',
        payload: { taskId: 'task-1', subTaskId: 'non-existent' },
      });

      const task = result.currentBoard?.columns[0]?.tasks[0];
      expect(task?.subTasks).toHaveLength(1);
    });

    it('should preserve other subtasks when deleting one', () => {
      const boardWithMultipleSubtasks = {
        ...mockBoard,
        columns: [
          {
            ...mockBoard.columns[0]!,
            tasks: [
              {
                ...mockBoard.columns[0]!.tasks[0]!,
                subTasks: [
                  { id: 'subtask-1', title: 'Subtask 1', completed: false },
                  { id: 'subtask-2', title: 'Subtask 2', completed: true },
                ],
              },
            ],
          },
        ],
      };

      const stateWithMultipleSubtasks: KanbanState = {
        ...initialState,
        currentBoard: boardWithMultipleSubtasks,
        boards: [boardWithMultipleSubtasks],
      };

      const result = kanbanReducer(stateWithMultipleSubtasks, {
        type: 'DELETE_SUBTASK',
        payload: { taskId: 'task-1', subTaskId: 'subtask-1' },
      });

      const task = result.currentBoard?.columns[0]?.tasks[0];
      expect(task?.subTasks).toHaveLength(1);
      expect(task?.subTasks[0]?.id).toBe('subtask-2');
    });
  });

  describe('SET_SORT_OPTION', () => {
    it('should set sort option to priority', () => {
      const result = kanbanReducer(initialState, {
        type: 'SET_SORT_OPTION',
        payload: 'priority',
      });

      expect(result.sortOption).toBe('priority');
    });

    it('should set sort option to dueDate', () => {
      const result = kanbanReducer(initialState, {
        type: 'SET_SORT_OPTION',
        payload: 'dueDate',
      });

      expect(result.sortOption).toBe('dueDate');
    });

    it('should set sort option to null', () => {
      const stateWithSort: KanbanState = {
        ...initialState,
        sortOption: 'priority',
      };

      const result = kanbanReducer(stateWithSort, {
        type: 'SET_SORT_OPTION',
        payload: null,
      });

      expect(result.sortOption).toBeNull();
    });
  });

  describe('SET_TASK_FILTER', () => {
    it('should set priority filter', () => {
      const result = kanbanReducer(initialState, {
        type: 'SET_TASK_FILTER',
        payload: {
          priority: 'high',
          labels: [],
          dueDate: null,
          searchQuery: '',
        },
      });

      expect(result.taskFilter.priority).toBe('high');
    });

    it('should set labels filter', () => {
      const result = kanbanReducer(initialState, {
        type: 'SET_TASK_FILTER',
        payload: {
          priority: null,
          labels: ['label-1', 'label-2'],
          dueDate: null,
          searchQuery: '',
        },
      });

      expect(result.taskFilter.labels).toEqual(['label-1', 'label-2']);
    });

    it('should set search query filter', () => {
      const result = kanbanReducer(initialState, {
        type: 'SET_TASK_FILTER',
        payload: {
          priority: null,
          labels: [],
          dueDate: null,
          searchQuery: 'test query',
        },
      });

      expect(result.taskFilter.searchQuery).toBe('test query');
    });

    it('should set multiple filters at once', () => {
      const result = kanbanReducer(initialState, {
        type: 'SET_TASK_FILTER',
        payload: {
          priority: 'critical',
          labels: ['label-1'],
          dueDate: 'today',
          searchQuery: 'urgent',
        },
      });

      expect(result.taskFilter.priority).toBe('critical');
      expect(result.taskFilter.labels).toEqual(['label-1']);
      expect(result.taskFilter.dueDate).toBe('today');
      expect(result.taskFilter.searchQuery).toBe('urgent');
    });
  });

  describe('CLEAR_TASK_FILTER', () => {
    it('should clear all filters', () => {
      const stateWithFilters: KanbanState = {
        ...initialState,
        taskFilter: {
          priority: 'high',
          labels: ['label-1'],
          dueDate: 'today',
          searchQuery: 'test',
        },
      };

      const result = kanbanReducer(stateWithFilters, {
        type: 'CLEAR_TASK_FILTER',
        payload: undefined,
      });

      expect(result.taskFilter.priority).toBeNull();
      expect(result.taskFilter.labels).toEqual([]);
      expect(result.taskFilter.dueDate).toBeNull();
      expect(result.taskFilter.searchQuery).toBe('');
    });
  });

  describe('SET_VIEW_MODE', () => {
    it('should set view mode to kanban', () => {
      const result = kanbanReducer(initialState, {
        type: 'SET_VIEW_MODE',
        payload: 'kanban',
      });

      expect(result.viewMode).toBe('kanban');
    });

    it('should set view mode to table', () => {
      const result = kanbanReducer(initialState, {
        type: 'SET_VIEW_MODE',
        payload: 'table',
      });

      expect(result.viewMode).toBe('table');
    });

    it('should set view mode to calendar', () => {
      const result = kanbanReducer(initialState, {
        type: 'SET_VIEW_MODE',
        payload: 'calendar',
      });

      expect(result.viewMode).toBe('calendar');
    });
  });

  describe('Unknown actions', () => {
    it('should return unchanged state for unknown action', () => {
      const result = kanbanReducer(initialState, {
        type: 'UNKNOWN_ACTION' as any,
        payload: {},
      });

      expect(result).toEqual(initialState);
    });
  });

  describe('Edge cases', () => {
    it('should handle state with null currentBoard for subtask operations', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const addResult = kanbanReducer(stateWithoutBoard, {
        type: 'ADD_SUBTASK',
        payload: {
          taskId: 'task-1',
          subTask: { id: 'sub-1', title: 'New', completed: false },
        },
      });

      const updateResult = kanbanReducer(stateWithoutBoard, {
        type: 'UPDATE_SUBTASK',
        payload: {
          taskId: 'task-1',
          subTaskId: 'sub-1',
          updates: { completed: true },
        },
      });

      const deleteResult = kanbanReducer(stateWithoutBoard, {
        type: 'DELETE_SUBTASK',
        payload: { taskId: 'task-1', subTaskId: 'sub-1' },
      });

      expect(addResult).toEqual(stateWithoutBoard);
      expect(updateResult).toEqual(stateWithoutBoard);
      expect(deleteResult).toEqual(stateWithoutBoard);
    });

    it('should update boards array when modifying subtasks', () => {
      const newSubTask: SubTask = {
        id: 'subtask-2',
        title: 'New Subtask',
        completed: false,
      };

      const result = kanbanReducer(initialState, {
        type: 'ADD_SUBTASK',
        payload: { taskId: 'task-1', subTask: newSubTask },
      });

      expect(result.boards[0]?.columns[0]?.tasks[0]?.subTasks).toHaveLength(2);
    });
  });
});
