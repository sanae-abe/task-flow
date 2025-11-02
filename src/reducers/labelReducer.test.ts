/**
 * Label Reducer tests
 * ラベルアクション処理の包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleLabelActions } from './labelReducer';
import type { KanbanState, KanbanBoard, Label } from '../types';

// Mock logger
vi.mock('../utils/logger', () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Label Reducer', () => {
  let initialState: KanbanState;
  let mockBoard: KanbanBoard;
  let mockLabel: Label;

  beforeEach(() => {
    mockLabel = {
      id: 'label-1',
      name: 'Bug',
      color: '#ef4444',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

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
              description: '',
              status: 'todo',
              priority: 'medium',
              createdAt: '2025-01-01T00:00:00.000Z',
              updatedAt: '2025-01-01T00:00:00.000Z',
              labels: [mockLabel],
              subTasks: [],
              dueDate: null,
              completedAt: null,
            },
          ],
          color: '#6b7280',
        },
      ],
      labels: [mockLabel],
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

  describe('ADD_LABEL', () => {
    it('should add new label to current board', () => {
      const newLabel: Label = {
        id: 'label-2',
        name: 'Feature',
        color: '#10b981',
        createdAt: '2025-01-02T00:00:00.000Z',
      };

      const result = handleLabelActions(initialState, {
        type: 'ADD_LABEL',
        payload: { label: newLabel },
      });

      expect(result.currentBoard?.labels).toHaveLength(2);
      expect(result.currentBoard?.labels[1]).toEqual(newLabel);
    });

    it('should update board updatedAt timestamp', () => {
      const newLabel: Label = {
        id: 'label-2',
        name: 'Feature',
        color: '#10b981',
        createdAt: '2025-01-02T00:00:00.000Z',
      };

      const result = handleLabelActions(initialState, {
        type: 'ADD_LABEL',
        payload: { label: newLabel },
      });

      expect(result.currentBoard?.updatedAt).not.toBe(mockBoard.updatedAt);
    });

    it('should update board in boards array', () => {
      const newLabel: Label = {
        id: 'label-2',
        name: 'Feature',
        color: '#10b981',
        createdAt: '2025-01-02T00:00:00.000Z',
      };

      const result = handleLabelActions(initialState, {
        type: 'ADD_LABEL',
        payload: { label: newLabel },
      });

      expect(result.boards[0]?.labels).toHaveLength(2);
    });

    it('should return unchanged state when no current board', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const newLabel: Label = {
        id: 'label-2',
        name: 'Feature',
        color: '#10b981',
        createdAt: '2025-01-02T00:00:00.000Z',
      };

      const result = handleLabelActions(stateWithoutBoard, {
        type: 'ADD_LABEL',
        payload: { label: newLabel },
      });

      expect(result).toEqual(stateWithoutBoard);
    });

    it('should preserve existing labels when adding new one', () => {
      const newLabel: Label = {
        id: 'label-2',
        name: 'Feature',
        color: '#10b981',
        createdAt: '2025-01-02T00:00:00.000Z',
      };

      const result = handleLabelActions(initialState, {
        type: 'ADD_LABEL',
        payload: { label: newLabel },
      });

      expect(result.currentBoard?.labels[0]).toEqual(mockLabel);
    });
  });

  describe('UPDATE_LABEL', () => {
    it('should update label name', () => {
      const result = handleLabelActions(initialState, {
        type: 'UPDATE_LABEL',
        payload: {
          labelId: 'label-1',
          updates: { name: 'Critical Bug' },
        },
      });

      expect(result.currentBoard?.labels[0]?.name).toBe('Critical Bug');
    });

    it('should update label color', () => {
      const result = handleLabelActions(initialState, {
        type: 'UPDATE_LABEL',
        payload: {
          labelId: 'label-1',
          updates: { color: '#ff0000' },
        },
      });

      expect(result.currentBoard?.labels[0]?.color).toBe('#ff0000');
    });

    it('should update multiple label properties', () => {
      const result = handleLabelActions(initialState, {
        type: 'UPDATE_LABEL',
        payload: {
          labelId: 'label-1',
          updates: { name: 'Critical Bug', color: '#ff0000' },
        },
      });

      expect(result.currentBoard?.labels[0]?.name).toBe('Critical Bug');
      expect(result.currentBoard?.labels[0]?.color).toBe('#ff0000');
    });

    it('should update board updatedAt timestamp', () => {
      const result = handleLabelActions(initialState, {
        type: 'UPDATE_LABEL',
        payload: {
          labelId: 'label-1',
          updates: { name: 'Updated Label' },
        },
      });

      expect(result.currentBoard?.updatedAt).not.toBe(mockBoard.updatedAt);
    });

    it('should return unchanged state when no current board', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const result = handleLabelActions(stateWithoutBoard, {
        type: 'UPDATE_LABEL',
        payload: {
          labelId: 'label-1',
          updates: { name: 'Updated' },
        },
      });

      expect(result).toEqual(stateWithoutBoard);
    });

    it('should handle updating non-existent label gracefully', () => {
      const result = handleLabelActions(initialState, {
        type: 'UPDATE_LABEL',
        payload: {
          labelId: 'non-existent',
          updates: { name: 'Updated' },
        },
      });

      expect(result.currentBoard?.labels[0]?.name).toBe('Bug');
    });

    it('should preserve label ID when updating', () => {
      const result = handleLabelActions(initialState, {
        type: 'UPDATE_LABEL',
        payload: {
          labelId: 'label-1',
          updates: { name: 'Updated Bug' },
        },
      });

      expect(result.currentBoard?.labels[0]?.id).toBe('label-1');
    });
  });

  describe('DELETE_LABEL', () => {
    it('should delete label from board', () => {
      const result = handleLabelActions(initialState, {
        type: 'DELETE_LABEL',
        payload: { labelId: 'label-1' },
      });

      expect(result.currentBoard?.labels).toHaveLength(0);
    });

    it('should remove label from all tasks', () => {
      const result = handleLabelActions(initialState, {
        type: 'DELETE_LABEL',
        payload: { labelId: 'label-1' },
      });

      expect(result.currentBoard?.columns[0]?.tasks[0]?.labels).toHaveLength(0);
    });

    it('should update board updatedAt timestamp', () => {
      const result = handleLabelActions(initialState, {
        type: 'DELETE_LABEL',
        payload: { labelId: 'label-1' },
      });

      expect(result.currentBoard?.updatedAt).not.toBe(mockBoard.updatedAt);
    });

    it('should return unchanged state when no current board', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const result = handleLabelActions(stateWithoutBoard, {
        type: 'DELETE_LABEL',
        payload: { labelId: 'label-1' },
      });

      expect(result).toEqual(stateWithoutBoard);
    });

    it('should handle deleting non-existent label gracefully', () => {
      const result = handleLabelActions(initialState, {
        type: 'DELETE_LABEL',
        payload: { labelId: 'non-existent' },
      });

      expect(result.currentBoard?.labels).toHaveLength(1);
      expect(result.currentBoard?.columns[0]?.tasks[0]?.labels).toHaveLength(1);
    });

    it('should preserve other labels when deleting one', () => {
      const secondLabel: Label = {
        id: 'label-2',
        name: 'Feature',
        color: '#10b981',
        createdAt: '2025-01-02T00:00:00.000Z',
      };

      const boardWithMultipleLabels = {
        ...mockBoard,
        labels: [mockLabel, secondLabel],
      };

      const stateWithMultipleLabels: KanbanState = {
        ...initialState,
        currentBoard: boardWithMultipleLabels,
        boards: [boardWithMultipleLabels],
      };

      const result = handleLabelActions(stateWithMultipleLabels, {
        type: 'DELETE_LABEL',
        payload: { labelId: 'label-1' },
      });

      expect(result.currentBoard?.labels).toHaveLength(1);
      expect(result.currentBoard?.labels[0]?.id).toBe('label-2');
    });

    it('should only remove specified label from tasks', () => {
      const secondLabel: Label = {
        id: 'label-2',
        name: 'Feature',
        color: '#10b981',
        createdAt: '2025-01-02T00:00:00.000Z',
      };

      const boardWithTaskWithMultipleLabels = {
        ...mockBoard,
        labels: [mockLabel, secondLabel],
        columns: [
          {
            ...mockBoard.columns[0]!,
            tasks: [
              {
                ...mockBoard.columns[0]!.tasks[0]!,
                labels: [mockLabel, secondLabel],
              },
            ],
          },
        ],
      };

      const stateWithMultipleLabels: KanbanState = {
        ...initialState,
        currentBoard: boardWithTaskWithMultipleLabels,
        boards: [boardWithTaskWithMultipleLabels],
      };

      const result = handleLabelActions(stateWithMultipleLabels, {
        type: 'DELETE_LABEL',
        payload: { labelId: 'label-1' },
      });

      expect(result.currentBoard?.columns[0]?.tasks[0]?.labels).toHaveLength(1);
      expect(result.currentBoard?.columns[0]?.tasks[0]?.labels[0]?.id).toBe('label-2');
    });
  });

  describe('DELETE_LABEL_FROM_ALL_BOARDS', () => {
    it('should delete label from all boards', () => {
      const secondBoard = {
        ...mockBoard,
        id: 'board-2',
        title: 'Second Board',
      };

      const stateWithMultipleBoards: KanbanState = {
        ...initialState,
        boards: [mockBoard, secondBoard],
      };

      const result = handleLabelActions(stateWithMultipleBoards, {
        type: 'DELETE_LABEL_FROM_ALL_BOARDS',
        payload: { labelId: 'label-1' },
      });

      expect(result.boards[0]?.labels).toHaveLength(0);
      expect(result.boards[1]?.labels).toHaveLength(0);
    });

    it('should remove label from all tasks in all boards', () => {
      const secondBoard = {
        ...mockBoard,
        id: 'board-2',
        title: 'Second Board',
      };

      const stateWithMultipleBoards: KanbanState = {
        ...initialState,
        boards: [mockBoard, secondBoard],
      };

      const result = handleLabelActions(stateWithMultipleBoards, {
        type: 'DELETE_LABEL_FROM_ALL_BOARDS',
        payload: { labelId: 'label-1' },
      });

      expect(result.boards[0]?.columns[0]?.tasks[0]?.labels).toHaveLength(0);
      expect(result.boards[1]?.columns[0]?.tasks[0]?.labels).toHaveLength(0);
    });

    it('should update current board after deletion', () => {
      const result = handleLabelActions(initialState, {
        type: 'DELETE_LABEL_FROM_ALL_BOARDS',
        payload: { labelId: 'label-1' },
      });

      expect(result.currentBoard?.labels).toHaveLength(0);
      expect(result.currentBoard?.columns[0]?.tasks[0]?.labels).toHaveLength(0);
    });

    it('should update all boards updatedAt timestamp', () => {
      const secondBoard = {
        ...mockBoard,
        id: 'board-2',
        title: 'Second Board',
      };

      const stateWithMultipleBoards: KanbanState = {
        ...initialState,
        boards: [mockBoard, secondBoard],
      };

      const result = handleLabelActions(stateWithMultipleBoards, {
        type: 'DELETE_LABEL_FROM_ALL_BOARDS',
        payload: { labelId: 'label-1' },
      });

      expect(result.boards[0]?.updatedAt).not.toBe(mockBoard.updatedAt);
      expect(result.boards[1]?.updatedAt).not.toBe(secondBoard.updatedAt);
    });

    it('should handle state with null current board', () => {
      const stateWithoutCurrentBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const result = handleLabelActions(stateWithoutCurrentBoard, {
        type: 'DELETE_LABEL_FROM_ALL_BOARDS',
        payload: { labelId: 'label-1' },
      });

      expect(result.currentBoard).toBeNull();
      expect(result.boards[0]?.labels).toHaveLength(0);
    });

    it('should handle deleting non-existent label from all boards', () => {
      const result = handleLabelActions(initialState, {
        type: 'DELETE_LABEL_FROM_ALL_BOARDS',
        payload: { labelId: 'non-existent' },
      });

      expect(result.boards[0]?.labels).toHaveLength(1);
      expect(result.boards[0]?.columns[0]?.tasks[0]?.labels).toHaveLength(1);
    });
  });

  describe('Unknown actions', () => {
    it('should return unchanged state for unknown action', () => {
      const result = handleLabelActions(initialState, {
        type: 'UNKNOWN_ACTION' as any,
        payload: {},
      });

      expect(result).toEqual(initialState);
    });
  });

  describe('Edge cases', () => {
    it('should handle board with no labels', () => {
      const boardWithNoLabels = {
        ...mockBoard,
        labels: [],
      };

      const stateWithNoLabels: KanbanState = {
        ...initialState,
        currentBoard: boardWithNoLabels,
        boards: [boardWithNoLabels],
      };

      const newLabel: Label = {
        id: 'label-1',
        name: 'Bug',
        color: '#ef4444',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const result = handleLabelActions(stateWithNoLabels, {
        type: 'ADD_LABEL',
        payload: { label: newLabel },
      });

      expect(result.currentBoard?.labels).toHaveLength(1);
    });

    it('should handle tasks with no labels when deleting label', () => {
      const boardWithTaskWithoutLabels = {
        ...mockBoard,
        columns: [
          {
            ...mockBoard.columns[0]!,
            tasks: [
              {
                ...mockBoard.columns[0]!.tasks[0]!,
                labels: [],
              },
            ],
          },
        ],
      };

      const stateWithTaskWithoutLabels: KanbanState = {
        ...initialState,
        currentBoard: boardWithTaskWithoutLabels,
        boards: [boardWithTaskWithoutLabels],
      };

      const result = handleLabelActions(stateWithTaskWithoutLabels, {
        type: 'DELETE_LABEL',
        payload: { labelId: 'label-1' },
      });

      expect(result.currentBoard?.columns[0]?.tasks[0]?.labels).toHaveLength(0);
    });
  });
});
