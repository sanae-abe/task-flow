import type { KanbanState, KanbanAction } from '../types';
import logger from '../utils/logger';

export const handleLabelActions = (
  state: KanbanState,
  action: KanbanAction
): KanbanState => {
  switch (action.type) {
    case 'ADD_LABEL': {
      if (!state.currentBoard) {
        logger.warn('ADD_LABEL: No current board');
        return state;
      }

      const { label } = action.payload;
      const updatedBoard = {
        ...state.currentBoard,
        labels: [...state.currentBoard.labels, label],
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        currentBoard: updatedBoard,
        boards: state.boards.map(board =>
          board.id === state.currentBoard?.id ? updatedBoard : board
        ),
      };
    }

    case 'UPDATE_LABEL': {
      if (!state.currentBoard) {
        logger.warn('UPDATE_LABEL: No current board');
        return state;
      }

      const { labelId, updates } = action.payload;
      const updatedBoard = {
        ...state.currentBoard,
        labels: state.currentBoard.labels.map(label =>
          label.id === labelId ? { ...label, ...updates } : label
        ),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        currentBoard: updatedBoard,
        boards: state.boards.map(board =>
          board.id === state.currentBoard?.id ? updatedBoard : board
        ),
      };
    }

    case 'DELETE_LABEL': {
      if (!state.currentBoard) {
        logger.warn('DELETE_LABEL: No current board');
        return state;
      }

      const { labelId } = action.payload;
      const updatedBoard = {
        ...state.currentBoard,
        labels: state.currentBoard.labels.filter(label => label.id !== labelId),
        // タスクからも該当するラベルを削除
        columns: state.currentBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task => ({
            ...task,
            labels: task.labels.filter(label => label.id !== labelId),
          })),
        })),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        currentBoard: updatedBoard,
        boards: state.boards.map(board =>
          board.id === state.currentBoard?.id ? updatedBoard : board
        ),
      };
    }

    case 'DELETE_LABEL_FROM_ALL_BOARDS': {
      const { labelId } = action.payload;
      const currentTime = new Date().toISOString();

      // すべてのボードからラベルを削除し、タスクからも削除
      const updatedBoards = state.boards.map(board => ({
        ...board,
        labels: board.labels.filter(label => label.id !== labelId),
        columns: board.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task => ({
            ...task,
            labels: task.labels.filter(label => label.id !== labelId),
          })),
        })),
        updatedAt: currentTime,
      }));

      // 現在のボードも更新
      const updatedCurrentBoard = state.currentBoard
        ? updatedBoards.find(board => board.id === state.currentBoard?.id) ||
          null
        : null;

      return {
        ...state,
        boards: updatedBoards,
        currentBoard: updatedCurrentBoard,
      };
    }

    default:
      return state;
  }
};
