import { v4 as uuidv4 } from "uuid";
import type { KanbanState, KanbanAction } from "../types";
import logger from "../utils/logger";

export const handleColumnActions = (
  state: KanbanState,
  action: KanbanAction,
): KanbanState => {
  switch (action.type) {
    case "ADD_COLUMN": {
      if (!state.currentBoard) {
        logger.warn("ADD_COLUMN: No current board");
        return state;
      }

      const { title } = action.payload;
      const newColumn = {
        id: uuidv4(),
        title,
        tasks: [],
      };

      const updatedBoard = {
        ...state.currentBoard,
        columns: [...state.currentBoard.columns, newColumn],
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        currentBoard: updatedBoard,
        boards: state.boards.map((board) =>
          board.id === state.currentBoard?.id ? updatedBoard : board,
        ),
      };
    }

    case "UPDATE_COLUMN": {
      if (!state.currentBoard) {
        logger.warn("UPDATE_COLUMN: No current board");
        return state;
      }

      const { columnId, title } = action.payload;
      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map((column) =>
          column.id === columnId ? { ...column, title } : column,
        ),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        currentBoard: updatedBoard,
        boards: state.boards.map((board) =>
          board.id === state.currentBoard?.id ? updatedBoard : board,
        ),
      };
    }

    case "DELETE_COLUMN": {
      if (!state.currentBoard) {
        logger.warn("DELETE_COLUMN: No current board");
        return state;
      }

      const { columnId } = action.payload;
      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.filter(
          (column) => column.id !== columnId,
        ),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        currentBoard: updatedBoard,
        boards: state.boards.map((board) =>
          board.id === state.currentBoard?.id ? updatedBoard : board,
        ),
      };
    }

    case "REORDER_COLUMNS": {
      if (!state.currentBoard) {
        logger.warn("REORDER_COLUMNS: No current board");
        return state;
      }

      const { sourceIndex, targetIndex } = action.payload;
      const columns = [...state.currentBoard.columns];
      const [movedColumn] = columns.splice(sourceIndex, 1);
      if (movedColumn) {
        columns.splice(targetIndex, 0, movedColumn);
      }

      const updatedBoard = {
        ...state.currentBoard,
        columns,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        currentBoard: updatedBoard,
        boards: state.boards.map((board) =>
          board.id === state.currentBoard?.id ? updatedBoard : board,
        ),
      };
    }

    default:
      return state;
  }
};
