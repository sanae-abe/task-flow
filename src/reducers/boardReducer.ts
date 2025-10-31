import { v4 as uuidv4 } from 'uuid';
import type { KanbanState, KanbanAction, KanbanBoard } from '../types';
import logger from '../utils/logger';

export const handleBoardActions = (
  state: KanbanState,
  action: KanbanAction
): KanbanState => {
  switch (action.type) {
    case 'SET_BOARDS': {
      const boards = action.payload;
      return {
        ...state,
        boards,
        currentBoard: boards.length > 0 ? boards[0] || null : null,
      };
    }

    case 'CREATE_BOARD': {
      const { title } = action.payload;
      const newBoard: KanbanBoard = {
        id: uuidv4(),
        title,
        columns: [
          {
            id: uuidv4(),
            title: 'To Do',
            tasks: [],
          },
          {
            id: uuidv4(),
            title: 'In Progress',
            tasks: [],
          },
          {
            id: uuidv4(),
            title: 'Done',
            tasks: [],
          },
        ],
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        boards: [...state.boards, newBoard],
        currentBoard: newBoard,
      };
    }

    case 'SWITCH_BOARD': {
      const { boardId } = action.payload;
      const board = state.boards.find(b => b.id === boardId);
      return {
        ...state,
        currentBoard: board || null,
      };
    }

    case 'UPDATE_BOARD': {
      const { boardId, updates } = action.payload;
      const boardIndex = state.boards.findIndex(board => board.id === boardId);

      if (boardIndex === -1) {
        logger.warn('Board not found for update:', boardId);
        return state;
      }

      const baseBoard = state.boards[boardIndex];
      if (!baseBoard) {
        logger.warn('Board not found at index:', boardIndex);
        return state;
      }

      const updatedBoard: KanbanBoard = {
        id: baseBoard.id,
        title: baseBoard.title,
        columns: baseBoard.columns,
        labels: baseBoard.labels,
        createdAt: baseBoard.createdAt,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const newBoards = [...state.boards];
      newBoards[boardIndex] = updatedBoard;

      return {
        ...state,
        boards: newBoards,
        currentBoard:
          state.currentBoard?.id === boardId
            ? updatedBoard
            : state.currentBoard,
      };
    }

    case 'DELETE_BOARD': {
      const { boardId } = action.payload;
      const newBoards = state.boards.filter(board => board.id !== boardId);

      let newCurrentBoard: KanbanBoard | null = state.currentBoard;
      if (state.currentBoard?.id === boardId) {
        newCurrentBoard = newBoards.length > 0 ? newBoards[0] || null : null;
      }

      return {
        ...state,
        boards: newBoards,
        currentBoard: newCurrentBoard,
      };
    }

    default:
      return state;
  }
};
