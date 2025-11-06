/**
 * Column Reducer tests
 * カラムアクション処理の包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleColumnActions } from './columnReducer';
import type { KanbanState, KanbanBoard } from '../types';

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

describe('Column Reducer', () => {
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
          tasks: [],
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

  describe('ADD_COLUMN', () => {
    it('should add new column to current board', () => {
      const result = handleColumnActions(initialState, {
        type: 'ADD_COLUMN',
        payload: { title: 'New Column' },
      });

      expect(result.currentBoard?.columns).toHaveLength(4);
      const newColumn = result.currentBoard?.columns[3];
      expect(newColumn?.title).toBe('New Column');
      expect(newColumn?.tasks).toEqual([]);
    });

    it('should update updatedAt timestamp', () => {
      const result = handleColumnActions(initialState, {
        type: 'ADD_COLUMN',
        payload: { title: 'New Column' },
      });

      expect(result.currentBoard?.updatedAt).not.toBe(mockBoard.updatedAt);
    });

    it('should update board in boards array', () => {
      const result = handleColumnActions(initialState, {
        type: 'ADD_COLUMN',
        payload: { title: 'New Column' },
      });

      expect(result.boards[0]?.columns).toHaveLength(4);
    });

    it('should return unchanged state when no current board', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const result = handleColumnActions(stateWithoutBoard, {
        type: 'ADD_COLUMN',
        payload: { title: 'New Column' },
      });

      expect(result).toEqual(stateWithoutBoard);
    });

    it('should preserve existing columns when adding new one', () => {
      const result = handleColumnActions(initialState, {
        type: 'ADD_COLUMN',
        payload: { title: 'New Column' },
      });

      expect(result.currentBoard?.columns[0]?.title).toBe('To Do');
      expect(result.currentBoard?.columns[1]?.title).toBe('In Progress');
      expect(result.currentBoard?.columns[2]?.title).toBe('Done');
    });
  });

  describe('UPDATE_COLUMN', () => {
    it('should update column title', () => {
      const result = handleColumnActions(initialState, {
        type: 'UPDATE_COLUMN',
        payload: { columnId: 'col-1', title: 'Updated To Do' },
      });

      expect(result.currentBoard?.columns[0]?.title).toBe('Updated To Do');
    });

    it('should update updatedAt timestamp', () => {
      const result = handleColumnActions(initialState, {
        type: 'UPDATE_COLUMN',
        payload: { columnId: 'col-1', title: 'Updated To Do' },
      });

      expect(result.currentBoard?.updatedAt).not.toBe(mockBoard.updatedAt);
    });

    it('should update board in boards array', () => {
      const result = handleColumnActions(initialState, {
        type: 'UPDATE_COLUMN',
        payload: { columnId: 'col-1', title: 'Updated To Do' },
      });

      expect(result.boards[0]?.columns[0]?.title).toBe('Updated To Do');
    });

    it('should return unchanged state when no current board', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const result = handleColumnActions(stateWithoutBoard, {
        type: 'UPDATE_COLUMN',
        payload: { columnId: 'col-1', title: 'Updated' },
      });

      expect(result).toEqual(stateWithoutBoard);
    });

    it('should not modify other columns when updating one column', () => {
      const result = handleColumnActions(initialState, {
        type: 'UPDATE_COLUMN',
        payload: { columnId: 'col-2', title: 'Updated In Progress' },
      });

      expect(result.currentBoard?.columns[0]?.title).toBe('To Do');
      expect(result.currentBoard?.columns[1]?.title).toBe(
        'Updated In Progress'
      );
      expect(result.currentBoard?.columns[2]?.title).toBe('Done');
    });

    it('should handle updating non-existent column gracefully', () => {
      const result = handleColumnActions(initialState, {
        type: 'UPDATE_COLUMN',
        payload: { columnId: 'non-existent', title: 'Updated' },
      });

      expect(result.currentBoard?.columns).toHaveLength(3);
      expect(result.currentBoard?.columns[0]?.title).toBe('To Do');
    });

    it('should preserve column tasks when updating title', () => {
      const boardWithTasks = {
        ...mockBoard,
        columns: [
          {
            ...mockBoard.columns[0]!,
            tasks: [
              {
                id: 'task-1',
                title: 'Task 1',
                description: '',
                status: 'todo' as const,
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z',
                labels: [],
                subTasks: [],
              },
            ],
          },
          ...mockBoard.columns.slice(1),
        ],
      };

      const stateWithTasks: KanbanState = {
        ...initialState,
        currentBoard: boardWithTasks,
        boards: [boardWithTasks],
      };

      const result = handleColumnActions(stateWithTasks, {
        type: 'UPDATE_COLUMN',
        payload: { columnId: 'col-1', title: 'Updated To Do' },
      });

      expect(result.currentBoard?.columns[0]?.tasks).toHaveLength(1);
      expect(result.currentBoard?.columns[0]?.tasks[0]?.id).toBe('task-1');
    });
  });

  describe('DELETE_COLUMN', () => {
    it('should delete specified column', () => {
      const result = handleColumnActions(initialState, {
        type: 'DELETE_COLUMN',
        payload: { columnId: 'col-2' },
      });

      expect(result.currentBoard?.columns).toHaveLength(2);
      expect(result.currentBoard?.columns[0]?.id).toBe('col-1');
      expect(result.currentBoard?.columns[1]?.id).toBe('col-3');
    });

    it('should update updatedAt timestamp', () => {
      const result = handleColumnActions(initialState, {
        type: 'DELETE_COLUMN',
        payload: { columnId: 'col-2' },
      });

      expect(result.currentBoard?.updatedAt).not.toBe(mockBoard.updatedAt);
    });

    it('should update board in boards array', () => {
      const result = handleColumnActions(initialState, {
        type: 'DELETE_COLUMN',
        payload: { columnId: 'col-2' },
      });

      expect(result.boards[0]?.columns).toHaveLength(2);
    });

    it('should return unchanged state when no current board', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const result = handleColumnActions(stateWithoutBoard, {
        type: 'DELETE_COLUMN',
        payload: { columnId: 'col-1' },
      });

      expect(result).toEqual(stateWithoutBoard);
    });

    it('should handle deleting non-existent column gracefully', () => {
      const result = handleColumnActions(initialState, {
        type: 'DELETE_COLUMN',
        payload: { columnId: 'non-existent' },
      });

      expect(result.currentBoard?.columns).toHaveLength(3);
    });

    it('should allow deleting last column', () => {
      const boardWithOneColumn = {
        ...mockBoard,
        columns: [mockBoard.columns[0]!],
      };

      const stateWithOneColumn: KanbanState = {
        ...initialState,
        currentBoard: boardWithOneColumn,
        boards: [boardWithOneColumn],
      };

      const result = handleColumnActions(stateWithOneColumn, {
        type: 'DELETE_COLUMN',
        payload: { columnId: 'col-1' },
      });

      expect(result.currentBoard?.columns).toHaveLength(0);
    });
  });

  describe('REORDER_COLUMNS', () => {
    it('should reorder columns by moving first column to last', () => {
      const result = handleColumnActions(initialState, {
        type: 'REORDER_COLUMNS',
        payload: { sourceIndex: 0, targetIndex: 2 },
      });

      expect(result.currentBoard?.columns[0]?.id).toBe('col-2');
      expect(result.currentBoard?.columns[1]?.id).toBe('col-3');
      expect(result.currentBoard?.columns[2]?.id).toBe('col-1');
    });

    it('should reorder columns by moving last column to first', () => {
      const result = handleColumnActions(initialState, {
        type: 'REORDER_COLUMNS',
        payload: { sourceIndex: 2, targetIndex: 0 },
      });

      expect(result.currentBoard?.columns[0]?.id).toBe('col-3');
      expect(result.currentBoard?.columns[1]?.id).toBe('col-1');
      expect(result.currentBoard?.columns[2]?.id).toBe('col-2');
    });

    it('should reorder columns by moving middle column up', () => {
      const result = handleColumnActions(initialState, {
        type: 'REORDER_COLUMNS',
        payload: { sourceIndex: 1, targetIndex: 0 },
      });

      expect(result.currentBoard?.columns[0]?.id).toBe('col-2');
      expect(result.currentBoard?.columns[1]?.id).toBe('col-1');
      expect(result.currentBoard?.columns[2]?.id).toBe('col-3');
    });

    it('should update updatedAt timestamp', () => {
      const result = handleColumnActions(initialState, {
        type: 'REORDER_COLUMNS',
        payload: { sourceIndex: 0, targetIndex: 2 },
      });

      expect(result.currentBoard?.updatedAt).not.toBe(mockBoard.updatedAt);
    });

    it('should update board in boards array', () => {
      const result = handleColumnActions(initialState, {
        type: 'REORDER_COLUMNS',
        payload: { sourceIndex: 0, targetIndex: 2 },
      });

      expect(result.boards[0]?.columns[0]?.id).toBe('col-2');
    });

    it('should return unchanged state when no current board', () => {
      const stateWithoutBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const result = handleColumnActions(stateWithoutBoard, {
        type: 'REORDER_COLUMNS',
        payload: { sourceIndex: 0, targetIndex: 2 },
      });

      expect(result).toEqual(stateWithoutBoard);
    });

    it('should handle same source and target index', () => {
      const result = handleColumnActions(initialState, {
        type: 'REORDER_COLUMNS',
        payload: { sourceIndex: 1, targetIndex: 1 },
      });

      expect(result.currentBoard?.columns[0]?.id).toBe('col-1');
      expect(result.currentBoard?.columns[1]?.id).toBe('col-2');
      expect(result.currentBoard?.columns[2]?.id).toBe('col-3');
    });

    it('should preserve column properties when reordering', () => {
      const result = handleColumnActions(initialState, {
        type: 'REORDER_COLUMNS',
        payload: { sourceIndex: 0, targetIndex: 2 },
      });

      const movedColumn = result.currentBoard?.columns[2];
      expect(movedColumn?.title).toBe('To Do');
      expect(movedColumn?.tasks).toEqual([]);
    });
  });

  describe('Unknown actions', () => {
    it('should return unchanged state for unknown action', () => {
      const result = handleColumnActions(initialState, {
        type: 'UNKNOWN_ACTION' as any,
        payload: {},
      });

      expect(result).toEqual(initialState);
    });
  });

  describe('Edge cases', () => {
    it('should handle board with no columns', () => {
      const boardWithNoColumns = {
        ...mockBoard,
        columns: [],
      };

      const stateWithNoColumns: KanbanState = {
        ...initialState,
        currentBoard: boardWithNoColumns,
        boards: [boardWithNoColumns],
      };

      const result = handleColumnActions(stateWithNoColumns, {
        type: 'ADD_COLUMN',
        payload: { title: 'First Column' },
      });

      expect(result.currentBoard?.columns).toHaveLength(1);
      expect(result.currentBoard?.columns[0]?.title).toBe('First Column');
    });

    it('should handle reordering with out of bounds index', () => {
      const result = handleColumnActions(initialState, {
        type: 'REORDER_COLUMNS',
        payload: { sourceIndex: 0, targetIndex: 10 },
      });

      // Should still work, just moves to end
      expect(result.currentBoard?.columns).toHaveLength(3);
    });
  });
});
