/**
 * Board Reducer tests
 * ボードアクション処理の包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleBoardActions } from './boardReducer';
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

describe('Board Reducer', () => {
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

  describe('SET_BOARDS', () => {
    it('should set boards and set first board as current', () => {
      const boards: KanbanBoard[] = [
        { ...mockBoard, id: 'board-1', title: 'Board 1' },
        { ...mockBoard, id: 'board-2', title: 'Board 2' },
      ];

      const result = handleBoardActions(initialState, {
        type: 'SET_BOARDS',
        payload: boards,
      });

      expect(result.boards).toEqual(boards);
      expect(result.currentBoard).toEqual(boards[0]);
    });

    it('should set currentBoard to null when boards array is empty', () => {
      const result = handleBoardActions(initialState, {
        type: 'SET_BOARDS',
        payload: [],
      });

      expect(result.boards).toEqual([]);
      expect(result.currentBoard).toBeNull();
    });

    it('should handle setting boards when initial state has no boards', () => {
      const emptyState: KanbanState = {
        ...initialState,
        boards: [],
        currentBoard: null,
      };

      const boards: KanbanBoard[] = [mockBoard];

      const result = handleBoardActions(emptyState, {
        type: 'SET_BOARDS',
        payload: boards,
      });

      expect(result.boards).toEqual(boards);
      expect(result.currentBoard).toEqual(boards[0]);
    });
  });

  describe('CREATE_BOARD', () => {
    it('should create a new board with default columns', () => {
      const result = handleBoardActions(initialState, {
        type: 'CREATE_BOARD',
        payload: { title: 'New Board' },
      });

      expect(result.boards).toHaveLength(2);
      const newBoard = result.boards[1];
      expect(newBoard?.title).toBe('New Board');
      expect(newBoard?.columns).toHaveLength(3);
      expect(newBoard?.columns[0]?.title).toBe('To Do');
      expect(newBoard?.columns[1]?.title).toBe('In Progress');
      expect(newBoard?.columns[2]?.title).toBe('Done');
    });

    it('should set newly created board as current board', () => {
      const result = handleBoardActions(initialState, {
        type: 'CREATE_BOARD',
        payload: { title: 'New Board' },
      });

      expect(result.currentBoard?.title).toBe('New Board');
      expect(result.currentBoard).toBe(result.boards[1]);
    });

    it('should initialize new board with empty labels array', () => {
      const result = handleBoardActions(initialState, {
        type: 'CREATE_BOARD',
        payload: { title: 'New Board' },
      });

      const newBoard = result.boards[1];
      expect(newBoard?.labels).toEqual([]);
    });

    it('should set createdAt and updatedAt timestamps', () => {
      const result = handleBoardActions(initialState, {
        type: 'CREATE_BOARD',
        payload: { title: 'New Board' },
      });

      const newBoard = result.boards[1];
      expect(newBoard?.createdAt).toBeDefined();
      expect(newBoard?.updatedAt).toBeDefined();
      expect(typeof newBoard?.createdAt).toBe('string');
      expect(typeof newBoard?.updatedAt).toBe('string');
    });
  });

  describe('SWITCH_BOARD', () => {
    it('should switch to specified board', () => {
      const secondBoard = { ...mockBoard, id: 'board-2', title: 'Board 2' };
      const stateWithMultipleBoards: KanbanState = {
        ...initialState,
        boards: [mockBoard, secondBoard],
      };

      const result = handleBoardActions(stateWithMultipleBoards, {
        type: 'SWITCH_BOARD',
        payload: { boardId: 'board-2' },
      });

      expect(result.currentBoard?.id).toBe('board-2');
      expect(result.currentBoard?.title).toBe('Board 2');
    });

    it('should set currentBoard to null when board not found', () => {
      const result = handleBoardActions(initialState, {
        type: 'SWITCH_BOARD',
        payload: { boardId: 'non-existent-id' },
      });

      expect(result.currentBoard).toBeNull();
    });

    it('should not modify boards array when switching', () => {
      const secondBoard = { ...mockBoard, id: 'board-2', title: 'Board 2' };
      const stateWithMultipleBoards: KanbanState = {
        ...initialState,
        boards: [mockBoard, secondBoard],
      };

      const result = handleBoardActions(stateWithMultipleBoards, {
        type: 'SWITCH_BOARD',
        payload: { boardId: 'board-2' },
      });

      expect(result.boards).toEqual(stateWithMultipleBoards.boards);
    });
  });

  describe('UPDATE_BOARD', () => {
    it('should update board title', () => {
      const result = handleBoardActions(initialState, {
        type: 'UPDATE_BOARD',
        payload: {
          boardId: 'board-1',
          updates: { title: 'Updated Board Title' },
        },
      });

      expect(result.boards[0]?.title).toBe('Updated Board Title');
    });

    it('should update currentBoard when updating the current board', () => {
      const result = handleBoardActions(initialState, {
        type: 'UPDATE_BOARD',
        payload: {
          boardId: 'board-1',
          updates: { title: 'Updated Title' },
        },
      });

      expect(result.currentBoard?.title).toBe('Updated Title');
    });

    it('should not update currentBoard when updating a different board', () => {
      const secondBoard = { ...mockBoard, id: 'board-2', title: 'Board 2' };
      const stateWithMultipleBoards: KanbanState = {
        ...initialState,
        boards: [mockBoard, secondBoard],
        currentBoard: mockBoard,
      };

      const result = handleBoardActions(stateWithMultipleBoards, {
        type: 'UPDATE_BOARD',
        payload: {
          boardId: 'board-2',
          updates: { title: 'Updated Board 2' },
        },
      });

      expect(result.currentBoard?.id).toBe('board-1');
      expect(result.currentBoard?.title).toBe('Test Board');
      expect(result.boards[1]?.title).toBe('Updated Board 2');
    });

    it('should return unchanged state when board not found', () => {
      const result = handleBoardActions(initialState, {
        type: 'UPDATE_BOARD',
        payload: {
          boardId: 'non-existent-id',
          updates: { title: 'Updated Title' },
        },
      });

      expect(result).toEqual(initialState);
    });

    it('should update updatedAt timestamp', () => {
      const result = handleBoardActions(initialState, {
        type: 'UPDATE_BOARD',
        payload: {
          boardId: 'board-1',
          updates: { title: 'Updated Title' },
        },
      });

      expect(result.boards[0]?.updatedAt).not.toBe(mockBoard.updatedAt);
    });

    it('should preserve columns when updating title', () => {
      const result = handleBoardActions(initialState, {
        type: 'UPDATE_BOARD',
        payload: {
          boardId: 'board-1',
          updates: { title: 'Updated Title' },
        },
      });

      expect(result.boards[0]?.columns).toEqual(mockBoard.columns);
    });

    it('should preserve labels when updating title', () => {
      const result = handleBoardActions(initialState, {
        type: 'UPDATE_BOARD',
        payload: {
          boardId: 'board-1',
          updates: { title: 'Updated Title' },
        },
      });

      expect(result.boards[0]?.labels).toEqual(mockBoard.labels);
    });
  });

  describe('DELETE_BOARD', () => {
    it('should delete specified board', () => {
      const secondBoard = { ...mockBoard, id: 'board-2', title: 'Board 2' };
      const stateWithMultipleBoards: KanbanState = {
        ...initialState,
        boards: [mockBoard, secondBoard],
      };

      const result = handleBoardActions(stateWithMultipleBoards, {
        type: 'DELETE_BOARD',
        payload: { boardId: 'board-2' },
      });

      expect(result.boards).toHaveLength(1);
      expect(result.boards[0]?.id).toBe('board-1');
    });

    it('should set currentBoard to first remaining board when deleting current board', () => {
      const secondBoard = { ...mockBoard, id: 'board-2', title: 'Board 2' };
      const stateWithMultipleBoards: KanbanState = {
        ...initialState,
        boards: [mockBoard, secondBoard],
        currentBoard: mockBoard,
      };

      const result = handleBoardActions(stateWithMultipleBoards, {
        type: 'DELETE_BOARD',
        payload: { boardId: 'board-1' },
      });

      expect(result.currentBoard?.id).toBe('board-2');
    });

    it('should set currentBoard to null when deleting last board', () => {
      const result = handleBoardActions(initialState, {
        type: 'DELETE_BOARD',
        payload: { boardId: 'board-1' },
      });

      expect(result.boards).toHaveLength(0);
      expect(result.currentBoard).toBeNull();
    });

    it('should not change currentBoard when deleting a different board', () => {
      const secondBoard = { ...mockBoard, id: 'board-2', title: 'Board 2' };
      const stateWithMultipleBoards: KanbanState = {
        ...initialState,
        boards: [mockBoard, secondBoard],
        currentBoard: mockBoard,
      };

      const result = handleBoardActions(stateWithMultipleBoards, {
        type: 'DELETE_BOARD',
        payload: { boardId: 'board-2' },
      });

      expect(result.currentBoard?.id).toBe('board-1');
    });

    it('should handle deleting non-existent board gracefully', () => {
      const result = handleBoardActions(initialState, {
        type: 'DELETE_BOARD',
        payload: { boardId: 'non-existent-id' },
      });

      expect(result.boards).toEqual(initialState.boards);
      expect(result.currentBoard).toEqual(initialState.currentBoard);
    });
  });

  describe('Unknown actions', () => {
    it('should return unchanged state for unknown action', () => {
      const result = handleBoardActions(initialState, {
        type: 'UNKNOWN_ACTION' as any,
        payload: {},
      });

      expect(result).toEqual(initialState);
    });
  });

  describe('Edge cases', () => {
    it('should handle state with null currentBoard', () => {
      const stateWithNullBoard: KanbanState = {
        ...initialState,
        currentBoard: null,
      };

      const result = handleBoardActions(stateWithNullBoard, {
        type: 'CREATE_BOARD',
        payload: { title: 'New Board' },
      });

      expect(result.currentBoard).toBeDefined();
      expect(result.currentBoard?.title).toBe('New Board');
    });

    it('should handle empty boards array', () => {
      const emptyState: KanbanState = {
        ...initialState,
        boards: [],
        currentBoard: null,
      };

      const result = handleBoardActions(emptyState, {
        type: 'CREATE_BOARD',
        payload: { title: 'First Board' },
      });

      expect(result.boards).toHaveLength(1);
      expect(result.currentBoard?.title).toBe('First Board');
    });
  });
});
