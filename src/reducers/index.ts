import type { KanbanState, KanbanAction } from '../types';
import { handleBoardActions } from './boardReducer';
import { handleColumnActions } from './columnReducer';
import { handleTaskActions } from './taskReducer';
import { handleLabelActions } from './labelReducer';
import logger from '../utils/logger';

export const kanbanReducer = (
  state: KanbanState,
  action: KanbanAction
): KanbanState => {
  logger.debug('Reducer action:', action.type);

  // Board actions
  if (
    [
      'SET_BOARDS',
      'CREATE_BOARD',
      'SWITCH_BOARD',
      'UPDATE_BOARD',
      'DELETE_BOARD',
    ].includes(action.type)
  ) {
    return handleBoardActions(state, action);
  }

  // Column actions
  if (
    [
      'ADD_COLUMN',
      'UPDATE_COLUMN',
      'DELETE_COLUMN',
      'REORDER_COLUMNS',
    ].includes(action.type)
  ) {
    return handleColumnActions(state, action);
  }

  // Task actions
  if (
    ['ADD_TASK', 'UPDATE_TASK', 'DELETE_TASK', 'MOVE_TASK'].includes(
      action.type
    )
  ) {
    return handleTaskActions(state, action);
  }

  // Label actions
  if (
    [
      'ADD_LABEL',
      'UPDATE_LABEL',
      'DELETE_LABEL',
      'DELETE_LABEL_FROM_ALL_BOARDS',
    ].includes(action.type)
  ) {
    return handleLabelActions(state, action);
  }

  // Other actions
  switch (action.type) {
    case 'ADD_SUBTASK': {
      if (!state.currentBoard) {
        logger.warn('ADD_SUBTASK: No current board');
        return state;
      }

      const { taskId, subTask } = action.payload;
      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: [...task.subTasks, subTask],
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
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

    case 'UPDATE_SUBTASK': {
      if (!state.currentBoard) {
        logger.warn('UPDATE_SUBTASK: No current board');
        return state;
      }

      const { taskId, subTaskId, updates } = action.payload;
      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: task.subTasks.map(subTask =>
                    subTask.id === subTaskId
                      ? { ...subTask, ...updates }
                      : subTask
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
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

    case 'DELETE_SUBTASK': {
      if (!state.currentBoard) {
        logger.warn('DELETE_SUBTASK: No current board');
        return state;
      }

      const { taskId, subTaskId } = action.payload;
      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: task.subTasks.filter(
                    subTask => subTask.id !== subTaskId
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
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

    case 'SET_SORT_OPTION': {
      return {
        ...state,
        sortOption: action.payload,
      };
    }

    case 'SET_TASK_FILTER': {
      return {
        ...state,
        taskFilter: action.payload,
      };
    }

    case 'CLEAR_TASK_FILTER': {
      return {
        ...state,
        taskFilter: {
          priority: null,
          labels: [],
          dueDate: null,
          searchQuery: '',
        },
      };
    }

    case 'SET_VIEW_MODE': {
      return {
        ...state,
        viewMode: action.payload,
      };
    }

    default:
      logger.warn('Unknown action type:', action);
      return state;
  }
};

export default kanbanReducer;
