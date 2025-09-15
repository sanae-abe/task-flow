import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { KanbanBoard, Column, Task, Label, SubTask, FileAttachment, SortOption, TaskFilter, ViewMode, RecurrenceConfig } from '../types';
import { saveBoards, loadBoards } from '../utils/storage';
import { useNotify } from './NotificationContext';
import { calculateNextDueDate, isRecurrenceComplete } from '../utils/recurrence';
import logger from '../utils/logger';

interface KanbanState {
  boards: KanbanBoard[];
  currentBoard: KanbanBoard | null;
  sortOption: SortOption;
  taskFilter: TaskFilter;
  viewMode: ViewMode;
  labels: Label[];
  selectedTaskId: string | null;
  isTaskDetailOpen: boolean;
  isTaskFormOpen: boolean;
  taskFormDefaultDate?: Date;
}

type KanbanAction =
  | { type: 'LOAD_BOARDS'; payload: KanbanBoard[] }
  | { type: 'LOAD_INITIAL_DATA'; payload: { boards: KanbanBoard[]; labels: Label[] } }
  | { type: 'IMPORT_BOARDS'; payload: { boards: KanbanBoard[]; replaceAll?: boolean } }
  | { type: 'CREATE_BOARD'; payload: { title: string } }
  | { type: 'SET_CURRENT_BOARD'; payload: string }
  | { type: 'UPDATE_BOARD'; payload: { boardId: string; updates: Partial<KanbanBoard> } }
  | { type: 'DELETE_BOARD'; payload: { boardId: string } }
  | { type: 'CREATE_COLUMN'; payload: { boardId: string; title: string } }
  | { type: 'CREATE_TASK'; payload: { columnId: string; title: string; description: string; dueDate?: Date; labels?: Label[]; attachments?: FileAttachment[]; recurrence?: RecurrenceConfig } }
  | { type: 'MOVE_TASK'; payload: { taskId: string; sourceColumnId: string; targetColumnId: string; targetIndex: number } }
  | { type: 'UPDATE_TASK'; payload: { taskId: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: { taskId: string; columnId: string } }
  | { type: 'DELETE_COLUMN'; payload: { columnId: string } }
  | { type: 'UPDATE_COLUMN'; payload: { columnId: string; updates: Partial<Column> } }
  | { type: 'CLEAR_COMPLETED_TASKS' }
  | { type: 'ADD_SUBTASK'; payload: { taskId: string; title: string } }
  | { type: 'TOGGLE_SUBTASK'; payload: { taskId: string; subTaskId: string } }
  | { type: 'DELETE_SUBTASK'; payload: { taskId: string; subTaskId: string } }
  | { type: 'SET_SORT_OPTION'; payload: SortOption }
  | { type: 'SET_TASK_FILTER'; payload: TaskFilter }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'OPEN_TASK_DETAIL'; payload: { taskId: string } }
  | { type: 'CLOSE_TASK_DETAIL' }
  | { type: 'OPEN_TASK_FORM'; payload?: { defaultDate?: Date } }
  | { type: 'CLOSE_TASK_FORM' }
  | { type: 'CHECK_OVERDUE_RECURRING_TASKS' };

interface KanbanContextType {
  state: KanbanState;
  dispatch: React.Dispatch<KanbanAction>;
  createBoard: (title: string) => void;
  setCurrentBoard: (boardId: string) => void;
  updateBoard: (boardId: string, updates: Partial<KanbanBoard>) => void;
  deleteBoard: (boardId: string) => void;
  createColumn: (title: string) => void;
  createTask: (columnId: string, title: string, description: string, dueDate?: Date, labels?: Label[], attachments?: FileAttachment[], recurrence?: RecurrenceConfig) => void;
  moveTask: (taskId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string, columnId: string) => void;
  deleteColumn: (columnId: string) => void;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  clearCompletedTasks: () => void;
  addSubTask: (taskId: string, title: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
  importBoards: (boards: KanbanBoard[], replaceAll?: boolean) => void;
  setSortOption: (option: SortOption) => void;
  setTaskFilter: (filter: TaskFilter) => void;
  setViewMode: (mode: ViewMode) => void;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;
  openTaskForm: (defaultDate?: Date) => void;
  closeTaskForm: () => void;
  getAllLabels: () => Label[];
  loadInitialData: (data: { boards: KanbanBoard[]; labels: Label[]; tasks: Task[]; columns: Column[] }) => void;
  checkOverdueRecurringTasks: () => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

// ヘルパー関数: ボードを更新してstateに反映
const updateBoardInState = (state: KanbanState, updatedBoard: KanbanBoard): KanbanState => ({
    ...state,
    boards: state.boards.map(board => 
      board.id === updatedBoard.id ? updatedBoard : board
    ),
    currentBoard: state.currentBoard?.id === updatedBoard.id ? updatedBoard : state.currentBoard,
  });

// ヘルパー関数: ボードのupdatedAtを更新
const updateBoardTimestamp = (board: KanbanBoard): KanbanBoard => ({
    ...board,
    updatedAt: new Date().toISOString(),
  });

// ヘルパー関数: LocalStorageのcurrent-board-idを安全に管理
const updateCurrentBoardId = (boardId: string | null) => {
  try {
    if (boardId) {
      localStorage.setItem('current-board-id', boardId);
    } else {
      localStorage.removeItem('current-board-id');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    logger.warn('LocalStorage access failed:', error);
  }
};

// ヘルパー関数: LocalStorageからcurrent-board-idを安全に取得
const getCurrentBoardId = (): string | null => {
  try {
    return localStorage.getItem('current-board-id');
  } catch (error) {
    // eslint-disable-next-line no-console
    logger.warn('LocalStorage access failed:', error);
    return null;
  }
};

// ヘルパー関数: LocalStorageにソート設定を安全に保存
const saveSortOption = (sortOption: SortOption) => {
  try {
    localStorage.setItem('sort-option', sortOption);
  } catch (error) {
    // eslint-disable-next-line no-console
    logger.warn('LocalStorage access failed:', error);
  }
};

// ヘルパー関数: LocalStorageからソート設定を安全に取得
const loadSortOption = (): SortOption => {
  try {
    const saved = localStorage.getItem('sort-option');
    return (saved as SortOption) ?? 'manual';
  } catch (error) {
    // eslint-disable-next-line no-console
    logger.warn('LocalStorage access failed:', error);
    return 'manual';
  }
};


const kanbanReducer = (state: KanbanState, action: KanbanAction): KanbanState => {
  switch (action.type) {
    case 'LOAD_BOARDS': {
      const boards = action.payload;
      let currentBoard: KanbanBoard | null = null;
      
      if (boards.length > 0) {
        const savedCurrentBoardId = getCurrentBoardId();
        if (savedCurrentBoardId) {
          currentBoard = boards.find(board => board.id === savedCurrentBoardId) ?? boards[0] ?? null;
        } else {
          currentBoard = boards[0] ?? null;
        }
      }
      
      return {
        ...state,
        boards,
        currentBoard,
      };
    }

    case 'LOAD_INITIAL_DATA': {
      const { boards, labels } = action.payload;
      let currentBoard: KanbanBoard | null = null;
      
      if (boards.length > 0) {
        const savedCurrentBoardId = getCurrentBoardId();
        if (savedCurrentBoardId) {
          currentBoard = boards.find(board => board.id === savedCurrentBoardId) ?? boards[0] ?? null;
        } else {
          currentBoard = boards[0] ?? null;
        }
      }
      
      return {
        ...state,
        boards,
        currentBoard,
        labels,
      };
    }

    case 'IMPORT_BOARDS': {
      const { boards: importedBoards, replaceAll = false } = action.payload;
      
      // IDの重複を避けるため、既存のボードIDをチェック
      const existingBoardIds = new Set(state.boards.map(board => board.id));
      const boardsToImport = importedBoards.map(board => {
        if (existingBoardIds.has(board.id) && !replaceAll) {
          // IDが重複している場合は新しいIDを生成
          return { ...board, id: uuidv4() };
        }
        return board;
      });

      let newBoards: KanbanBoard[];
      if (replaceAll) {
        newBoards = boardsToImport;
      } else {
        // 既存のボードと結合
        newBoards = [...state.boards, ...boardsToImport];
      }

      // カレントボードの設定
      let newCurrentBoard = state.currentBoard;
      if (replaceAll || !newCurrentBoard) {
        newCurrentBoard = newBoards.length > 0 ? newBoards[0] ?? null : null;
      }

      return {
        ...state,
        boards: newBoards,
        currentBoard: newCurrentBoard,
      };
    }
    
    case 'CREATE_BOARD': {
      const newBoard: KanbanBoard = {
        id: uuidv4(),
        title: action.payload.title,
        labels: [],
        columns: [
          {
            id: uuidv4(),
            title: 'To Do',
            tasks: [],
            color: '#f6f8fa'
          },
          {
            id: uuidv4(),
            title: 'In Progress',
            tasks: [],
            color: '#fef3c7'
          },
          {
            id: uuidv4(),
            title: 'Complete',
            tasks: [],
            color: '#d1fae5'
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateCurrentBoardId(newBoard.id);
      return {
        ...state,
        boards: [...state.boards, newBoard],
        currentBoard: newBoard,
      };
    }
    
    case 'SET_CURRENT_BOARD': {
      const newCurrentBoard = state.boards.find(board => board.id === action.payload) ?? null;
      if (newCurrentBoard) {
        updateCurrentBoardId(newCurrentBoard.id);
      }
      return {
        ...state,
        currentBoard: newCurrentBoard,
      };
    }
    
    case 'UPDATE_BOARD': {
      const boardToUpdate = state.boards.find(board => board.id === action.payload.boardId);
      if (!boardToUpdate) {
        return state;
      }
      
      const updatedBoard = updateBoardTimestamp({
        ...boardToUpdate,
        ...action.payload.updates,
      });
      
      return updateBoardInState(state, updatedBoard);
    }
    
    case 'DELETE_BOARD': {
      const newBoards = state.boards.filter(board => board.id !== action.payload.boardId);
      let newCurrentBoard = state.currentBoard;
      
      if (state.currentBoard?.id === action.payload.boardId) {
        newCurrentBoard = newBoards.length > 0 ? newBoards[0] ?? null : null;
        updateCurrentBoardId(newCurrentBoard?.id ?? null);
      }
      
      return {
        ...state,
        boards: newBoards,
        currentBoard: newCurrentBoard,
      };
    }
    
    case 'CREATE_COLUMN': {
      if (!state.currentBoard) {
        return state;
      }
      
      const newColumn: Column = {
        id: uuidv4(),
        title: action.payload.title,
        tasks: [],
        color: '#f6f8fa',
      };
      
      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: [...state.currentBoard.columns, newColumn],
      });
      
      return updateBoardInState(state, updatedBoard);
    }
    
    case 'CREATE_TASK': {
      if (!state.currentBoard) {
        return state;
      }
      
      const newTask: Task = {
        id: uuidv4(),
        title: action.payload.title,
        description: action.payload.description,
        dueDate: action.payload.dueDate?.toISOString() || null,
        labels: action.payload.labels || [],
        files: action.payload.attachments || [],
        priority: 'medium',
        subTasks: [],
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        recurrence: action.payload.recurrence,
        recurrenceId: action.payload.recurrence?.enabled ? uuidv4() : undefined,
        occurrenceCount: action.payload.recurrence?.enabled ? 1 : undefined,
      };
      
      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column =>
          column.id === action.payload.columnId
            ? { ...column, tasks: [...column.tasks, newTask] }
            : column
        ),
      });
      
      return updateBoardInState(state, updatedBoard);
    }
    
    case 'MOVE_TASK': {
      if (!state.currentBoard) {
        logger.debug('❌ MOVE_TASK: No current board');
        return state;
      }
      
      const { taskId, sourceColumnId, targetColumnId, targetIndex } = action.payload;
// eslint-disable-next-line no-console
      logger.debug('🚀 MOVE_TASK Action:', { taskId, sourceColumnId, targetColumnId, targetIndex });
      
      // 移動するタスクを取得
      let taskToMove: Task | undefined;
      for (const column of state.currentBoard.columns) {
        if (column.id === sourceColumnId) {
          taskToMove = column.tasks.find(task => task.id === taskId);
// eslint-disable-next-line no-console
          logger.debug('📋 Task to move found:', taskToMove?.title);
          break;
        }
      }
      
      if (!taskToMove) {
// eslint-disable-next-line no-console
        logger.debug('❌ MOVE_TASK: Task to move not found');
        return state;
      }
      
      // 完了状態の判定（一番右のカラムかどうか）
      const rightmostColumnIndex = state.currentBoard.columns.length - 1;
      const targetColumnIndex = state.currentBoard.columns.findIndex(col => col.id === targetColumnId);
      const sourceColumnIndex = state.currentBoard.columns.findIndex(col => col.id === sourceColumnId);
      const isMovingToCompleted = targetColumnIndex === rightmostColumnIndex;
      const isMovingFromCompleted = sourceColumnIndex === rightmostColumnIndex;
      
      // タスクのcompletedAtを適切に設定
      const updatedTask = { ...taskToMove, updatedAt: new Date().toISOString() };
      if (isMovingToCompleted && !isMovingFromCompleted) {
        // 完了状態に移動：completedAtを設定
        updatedTask.completedAt = new Date().toISOString();
// eslint-disable-next-line no-console
        logger.debug('✅ Setting completedAt for task completion');

        // 繰り返しタスクの処理
        if (updatedTask.recurrence?.enabled && updatedTask.dueDate) {
          const nextDueDate = calculateNextDueDate(updatedTask.dueDate, updatedTask.recurrence);
          const currentCount = (updatedTask.occurrenceCount || 1) + 1;

          if (nextDueDate && !isRecurrenceComplete(updatedTask.recurrence, currentCount, nextDueDate)) {
            // 次回期限を設定して未完了状態に戻す
            updatedTask.dueDate = nextDueDate;
            updatedTask.completedAt = null;
            updatedTask.occurrenceCount = currentCount;
            updatedTask.updatedAt = new Date().toISOString();

// eslint-disable-next-line no-console
            logger.debug('🔄 Recurring task: next due date set to', nextDueDate);
          } else {
            // 繰り返し終了
// eslint-disable-next-line no-console
            logger.debug('✅ Recurring task completed all occurrences');
          }
        }
      } else if (isMovingFromCompleted && !isMovingToCompleted) {
        // 完了状態から移動：completedAtをクリア
        updatedTask.completedAt = null;
// eslint-disable-next-line no-console
        logger.debug('🔄 Clearing completedAt for task reopening');
      }
      
      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column => {
// eslint-disable-next-line no-console
          logger.debug(`🔍 Processing column '${column.title}' (ID: ${column.id})`);
          
          // 同じカラム内での移動の場合
          if (sourceColumnId === targetColumnId && column.id === sourceColumnId) {
// eslint-disable-next-line no-console
            logger.debug(`🔄 Same column reorder in '${column.title}'`);
            const newTasks = [...column.tasks];
            // まず、移動するタスクを削除
            const taskIndex = newTasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
              newTasks.splice(taskIndex, 1);
// eslint-disable-next-line no-console
              logger.debug(`📤 Removed task from index ${taskIndex}`);
            }
            // 次に、新しい位置に挿入
            const safeTargetIndex = Math.max(0, Math.min(targetIndex, newTasks.length));
            newTasks.splice(safeTargetIndex, 0, updatedTask);
// eslint-disable-next-line no-console
            logger.debug(`📥 Added task at index ${safeTargetIndex}: ${column.tasks.length} → ${newTasks.length}`);
            return {
              ...column,
              tasks: newTasks,
            };
          }
          
          // 異なるカラム間での移動の場合
          if (column.id === sourceColumnId) {
            const filteredTasks = column.tasks.filter(task => task.id !== taskId);
// eslint-disable-next-line no-console
            logger.debug(`📤 Removing from source column '${column.title}': ${column.tasks.length} → ${filteredTasks.length}`);
            return {
              ...column,
              tasks: filteredTasks,
            };
          }
          if (column.id === targetColumnId) {
            const newTasks = [...column.tasks];
            const safeTargetIndex = Math.max(0, Math.min(targetIndex, newTasks.length));
// eslint-disable-next-line no-console
            logger.debug(`📥 Adding to target column '${column.title}' at index ${safeTargetIndex}: ${newTasks.length} → ${newTasks.length + 1}`);
            newTasks.splice(safeTargetIndex, 0, updatedTask);
            return {
              ...column,
              tasks: newTasks,
            };
          }
// eslint-disable-next-line no-console
          logger.debug(`⏭️ Skipping column '${column.title}' (not source or target)`);
          return column;
        }),
      });
      
// eslint-disable-next-line no-console
      logger.debug('✅ MOVE_TASK: Board updated successfully');
      return updateBoardInState(state, updatedBoard);
    }

    case 'UPDATE_TASK': {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task =>
            task.id === action.payload.taskId
              ? { ...task, ...action.payload.updates, updatedAt: new Date().toISOString() }
              : task
          ),
        })),
      });

      return updateBoardInState(state, updatedBoard);
    }

    case 'DELETE_TASK': {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column =>
          column.id === action.payload.columnId
            ? { ...column, tasks: column.tasks.filter(task => task.id !== action.payload.taskId) }
            : column
        ),
      });

      return updateBoardInState(state, updatedBoard);
    }

    case 'DELETE_COLUMN': {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.filter(column => column.id !== action.payload.columnId),
      });

      return updateBoardInState(state, updatedBoard);
    }

    case 'UPDATE_COLUMN': {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column =>
          column.id === action.payload.columnId
            ? { ...column, ...action.payload.updates }
            : column
        ),
      });

      return updateBoardInState(state, updatedBoard);
    }
    
    case 'CLEAR_COMPLETED_TASKS': {
      if (!state.currentBoard) {
        return state;
      }

      // 右端のカラム（完了カラム）のIDを取得
      const rightmostColumnId = state.currentBoard.columns[state.currentBoard.columns.length - 1]?.id;
      
      if (!rightmostColumnId) {
        return state;
      }

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column =>
          column.id === rightmostColumnId
            ? {
                ...column,
                // 繰り返しタスクは削除せずに保持
                tasks: column.tasks.filter(task => task.recurrence?.enabled)
              }
            : column
        ),
      });

      return updateBoardInState(state, updatedBoard);
    }

    case 'ADD_SUBTASK': {
      if (!state.currentBoard) {
        return state;
      }

      const { taskId, title } = action.payload;
      const newSubTask: SubTask = {
        id: uuidv4(),
        title,
        completed: false,
        createdAt: new Date().toISOString()
      };

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: [...(task.subTasks ?? []), newSubTask],
                  updatedAt: new Date().toISOString()
                }
              : task
          )
        })),
      });

      return updateBoardInState(state, updatedBoard);
    }

    case 'TOGGLE_SUBTASK': {
      if (!state.currentBoard) {
        return state;
      }

      const { taskId, subTaskId } = action.payload;

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: task.subTasks?.map(subTask =>
                    subTask.id === subTaskId
                      ? { ...subTask, completed: !subTask.completed }
                      : subTask
                  ),
                  updatedAt: new Date().toISOString()
                }
              : task
          )
        })),
      });

      return updateBoardInState(state, updatedBoard);
    }

    case 'DELETE_SUBTASK': {
      if (!state.currentBoard) {
        return state;
      }

      const { taskId, subTaskId } = action.payload;

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: task.subTasks?.filter(subTask => subTask.id !== subTaskId),
                  updatedAt: new Date().toISOString()
                }
              : task
          )
        })),
      });

      return updateBoardInState(state, updatedBoard);
    }

    case 'SET_SORT_OPTION': {
      saveSortOption(action.payload);
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

    case 'SET_VIEW_MODE': {
      return {
        ...state,
        viewMode: action.payload,
      };
    }
    case 'OPEN_TASK_DETAIL': {
      return {
        ...state,
        selectedTaskId: action.payload.taskId,
        isTaskDetailOpen: true,
      };
    }
    case 'CLOSE_TASK_DETAIL': {
      return {
        ...state,
        selectedTaskId: null,
        isTaskDetailOpen: false,
      };
    }
    case 'OPEN_TASK_FORM': {
      return {
        ...state,
        isTaskFormOpen: true,
        taskFormDefaultDate: action.payload?.defaultDate,
      };
    }
    case 'CLOSE_TASK_FORM': {
      return {
        ...state,
        isTaskFormOpen: false,
        taskFormDefaultDate: undefined,
      };
    }

    case 'CHECK_OVERDUE_RECURRING_TASKS': {
      if (!state.currentBoard) {
        return state;
      }

      const now = new Date();
      let hasChanges = false;
      const updatedColumns = state.currentBoard.columns.map((column, columnIndex) => {
        // 一番左のカラム（最初のカラム）ではない場合のみチェック
        if (columnIndex === 0) {
          return column;
        }

        const { remainingTasks } = column.tasks.reduce(
          (acc, task) => {
            // 繰り返しタスクで、期限が過ぎていて、まだ完了していない場合
            if (
              task.recurrence?.enabled &&
              task.dueDate &&
              !task.completedAt &&
              new Date(task.dueDate) <= now
            ) {
              hasChanges = true;
            } else {
              acc.remainingTasks.push(task);
            }
            return acc;
          },
          { remainingTasks: [] as Task[] }
        );

        return {
          ...column,
          tasks: remainingTasks,
        };
      });

      if (!hasChanges) {
        return state;
      }

      // 移動されたタスクを一番左のカラムに追加
      const firstColumn = updatedColumns[0];
      if (!firstColumn) {
        return state;
      }

      const allMovedTasks = state.currentBoard.columns.slice(1).flatMap(column =>
        column.tasks.filter(task =>
          task.recurrence?.enabled &&
          task.dueDate &&
          !task.completedAt &&
          new Date(task.dueDate) <= now
        )
      );

      if (allMovedTasks.length > 0) {
        updatedColumns[0] = {
          ...firstColumn,
          tasks: [...firstColumn.tasks, ...allMovedTasks],
        };

        logger.debug(`🔄 Moved ${allMovedTasks.length} overdue recurring tasks to first column`);
      }

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: updatedColumns,
      });

      return updateBoardInState(state, updatedBoard);
    }

    default:
      return state;
  }
};

export const KanbanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(kanbanReducer, {
    boards: [],
    currentBoard: null,
    sortOption: loadSortOption(),
    taskFilter: { type: 'all', label: 'すべてのタスク' },
    viewMode: 'kanban',
    labels: [],
    selectedTaskId: null,
    isTaskDetailOpen: false,
    isTaskFormOpen: false,
  });
  const [isInitialized, setIsInitialized] = React.useState(false);
  const notify = useNotify();
  
  useEffect(() => {
    if (isInitialized) {
      return;
    }
    
    // 既存のフィルター設定をlocal storageから削除
    try {
      localStorage.removeItem('task-filter');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to remove task-filter from localStorage:', error);
    }
    
    const boards = loadBoards();
    
    if (boards.length === 0) {
      const defaultBoard: KanbanBoard = {
        id: uuidv4(),
        title: 'TaskFlow デモプロジェクト',
        labels: [],
        columns: [
          {
            id: uuidv4(),
            title: '📋 計画中',
            tasks: [
              {
                id: uuidv4(),
                title: 'TaskFlow リッチテキスト機能の実装',
                description: '<p><strong>リッチテキストエディタの実装</strong></p><p>TaskFlowにリッチテキスト編集機能を追加し、ユーザーがより表現力豊かなタスク説明を作成できるようにする。</p><p><strong>主要機能：</strong></p><ul><li>太字、斜体、下線のテキスト装飾</li><li>リンクの自動挿入とプレビュー</li><li>Slackスタイルのインラインコード: <code>npm install</code></li><li>GitHub風のコードブロック機能</li></ul><p><strong>参考リンク：</strong><br><a href="https://github.com/facebook/lexical" target="_blank" rel="noopener noreferrer">Lexical Editor</a><br><a href="https://www.npmjs.com/package/react-quill" target="_blank" rel="noopener noreferrer">React Quill</a></p>',
                dueDate: (() => {
                  const date = new Date(Date.now() - 12 * 60 * 60 * 1000);
                  date.setHours(23, 59, 59, 999);
                  return date.toISOString();
                })(), // 昨日期限（期限切れ・23:59）
                labels: [
                  { id: uuidv4(), name: '🔥 緊急', color: 'danger' },
                  { id: uuidv4(), name: '⚡ フロントエンド', color: 'primary' }
                ],
                subTasks: [
                  { id: uuidv4(), title: 'RichTextEditor コンポーネント設計', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'リンク挿入ダイアログの実装', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'コードブロック機能の追加', completed: false, createdAt: new Date().toISOString() }
                ],
                priority: 'high',
                files: [],
                completedAt: null,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: uuidv4(),
                title: 'API ドキュメントの作成',
                description: '<p><strong>REST API ドキュメンテーションの作成</strong></p><p>TaskFlow の API エンドポイントに関する包括的なドキュメントを作成し、開発者が簡単に統合できるようにする。</p><div style="background-color: #f6f8fa; border: 1px solid #d0d7de; border-radius: 6px; padding: 8px; font-family: \'SFMono-Regular\', \'Consolas\', \'Liberation Mono\', \'Menlo\', monospace; font-size: 13px; line-height: 1.45; overflow-x: auto; color: #24292f;"><pre style="margin: 0 !important; white-space: pre; overflow-wrap: normal; color: inherit; background: transparent; border: none; padding: 0;" contenteditable="true" spellcheck="false"># API エンドポイント例\nGET /api/tasks          # タスク一覧取得\nPOST /api/tasks         # 新規タスク作成\nPUT /api/tasks/:id      # タスク更新\nDELETE /api/tasks/:id   # タスク削除</pre></div><p><strong>必要なドキュメント：</strong></p><ul><li>OpenAPI 仕様書の作成</li><li>Postman コレクションの準備</li><li>使用例とコードサンプル</li></ul>',
                dueDate: null, // 期限なし
                labels: [
                  { id: uuidv4(), name: '📚 ドキュメント', color: 'default' },
                  { id: uuidv4(), name: '🔧 API', color: 'secondary' }
                ],
                subTasks: [
                  { id: uuidv4(), title: 'OpenAPI 3.0 仕様書の作成', completed: false, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'Postman コレクションの準備', completed: false, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'サンプルコードの作成', completed: false, createdAt: new Date().toISOString() }
                ],
                priority: 'medium',
                files: [
                  {
                    id: uuidv4(),
                    name: 'api-specification.yaml',
                    type: 'text/yaml',
                    size: 4096,
                    data: 'data:text/yaml;base64,b3BlbmFwaTogMy4wLjAKaW5mbzoKICB0aXRsZTogVGFza0Zsb3cgQVBJCiAgdmVyc2lvbjogMS4wLjA=',
                    uploadedAt: new Date().toISOString()
                  }
                ],
                completedAt: null,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              },
            ],
            color: '#fff2cc'
          },
          {
            id: uuidv4(),
            title: '🚀 開発中',
            tasks: [
              {
                id: uuidv4(),
                title: 'TypeScript型定義の改善',
                description: '<p><strong>型安全性の向上とDX改善</strong></p><p>TaskFlowの型定義を改善し、開発者体験を向上させます。</p><p><strong>改善項目：</strong></p><ul><li>ジェネリクス型の活用</li><li>Union型とDiscriminated Union</li><li>型ガードの実装</li><li>Utilityタイプの活用</li></ul><p><code>TypeScript 5.0</code> の新機能を活用してより堅牢なコードベースを構築します。</p><p><strong>参考：</strong> <a href="https://www.typescriptlang.org/docs/" target="_blank" rel="noopener noreferrer">TypeScript公式ドキュメント</a></p>',
                dueDate: (() => {
                  const date = new Date();
                  date.setHours(23, 59, 59, 999);
                  return date.toISOString();
                })(), // 本日期限（23:59）
                labels: [
                  { id: uuidv4(), name: '⚡ フロントエンド', color: 'accent' },
                  { id: uuidv4(), name: '🔷 TypeScript', color: 'primary' }
                ],
                subTasks: [
                  { id: uuidv4(), title: 'Generic型の定義見直し', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: '型ガードの実装', completed: false, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'Utilityタイプの活用', completed: false, createdAt: new Date().toISOString() }
                ],
                priority: 'medium',
                files: [],
                completedAt: null,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
              },
              {
                id: uuidv4(),
                title: 'パフォーマンステストとレポート作成',
                description: '<p><strong>アプリケーションのパフォーマンス測定と最適化</strong></p><p>TaskFlowアプリケーションの<em>Lighthouse</em>スコア向上と<u>Web Vitals</u>指標の改善を行います。</p><p><strong>測定項目：</strong></p><ul><li><strong>FCP</strong>: 1.8秒以下</li><li><strong>LCP</strong>: 2.5秒以下</li><li><strong>CLS</strong>: 0.1以下</li><li><strong>FID</strong>: 100ms以下</li></ul><p><code>npm run lighthouse</code> でパフォーマンステストを実行します。</p><p><strong>参考ツール：</strong><br><a href="https://developers.google.com/web/tools/lighthouse" target="_blank" rel="noopener noreferrer">Google Lighthouse</a></p>',
                dueDate: (() => {
                  const date = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
                  date.setHours(17, 0, 0, 0);
                  return date.toISOString();
                })(), // 2日後17:00期限
                labels: [
                  { id: uuidv4(), name: '📊 パフォーマンス', color: 'primary' },
                  { id: uuidv4(), name: '🔄 定例', color: 'default' }
                ],
                subTasks: [
                  { id: uuidv4(), title: 'Lighthouse テストの実行', completed: false, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'Bundle サイズの分析', completed: false, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: '最適化レポートの作成', completed: false, createdAt: new Date().toISOString() }
                ],
                priority: 'high',
                files: [],
                completedAt: null,
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                recurrence: {
                  enabled: true,
                  pattern: 'weekly',
                  interval: 1,
                  daysOfWeek: [5] // 金曜日
                }
              },
            ],
            color: '#dbeafe'
          },
          {
            id: uuidv4(),
            title: '✅ 完了',
            tasks: [
              {
                id: uuidv4(),
                title: 'ユーザー認証システムの実装',
                description: '<p><strong>セキュアな認証機能の実装完了</strong></p><p>JWT ベースの認証システムを実装し、<u>セキュリティベストプラクティス</u>に従った堅牢な認証機能を構築しました。</p><p><strong>実装された機能：</strong></p><ul><li><em>JWT トークンベース認証</em></li><li><strong>パスワードハッシュ化</strong> (bcrypt)</li><li>セッション管理とリフレッシュトークン</li><li>ロールベースアクセス制御 (RBAC)</li></ul><p><code>jwt.sign()</code> と <code>bcrypt</code> を使用した安全な実装です。</p><p><strong>参考：</strong><br><a href="https://jwt.io/" target="_blank" rel="noopener noreferrer">JWT.io</a> | <a href="https://owasp.org/www-project-top-ten/" target="_blank" rel="noopener noreferrer">OWASP Top 10</a></p>',
                dueDate: (() => {
                  const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
                  date.setHours(12, 0, 0, 0);
                  return date.toISOString();
                })(), // 2日前12:00期限（期限内に完了）
                labels: [
                  { id: uuidv4(), name: '🔐 セキュリティ', color: 'primary' },
                  { id: uuidv4(), name: '✅ 完了', color: 'success' }
                ],
                subTasks: [
                  { id: uuidv4(), title: 'JWT ライブラリの選定と導入', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'ユーザー登録・ログイン API の実装', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'パスワードハッシュ化の実装', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'セッション管理機能の追加', completed: true, createdAt: new Date().toISOString() }
                ],
                priority: 'medium',
                files: [],
                completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                recurrence: {
                  enabled: true,
                  pattern: 'monthly',
                  interval: 1,
                  dayOfMonth: 28
                },
                recurrenceId: 'monthly-report-2024',
                occurrenceCount: 2
              },
              {
                id: uuidv4(),
                title: 'Git ワークフローの標準化',
                description: '<p><strong>チーム開発でのGitワークフロー統一</strong></p><p>開発チームで統一されたGitワークフローを確立し、<em>コードレビュー</em>プロセスとブランチ戦略を標準化しました。</p><p><strong>採用したワークフロー：</strong><br><code>GitHub Flow</code> ベースのシンプルなワークフロー</p><p><strong>ブランチルール：</strong></p><ol><li><strong>main</strong> ブランチは常にデプロイ可能状態を保つ</li><li>機能開発は <code>feature/</code> ブランチで行う</li><li>バグ修正は <code>fix/</code> ブランチで行う</li><li>全てのマージは Pull Request 経由で実施</li></ol><p><strong>参考：</strong> <a href="https://guides.github.com/introduction/flow/" target="_blank" rel="noopener noreferrer">GitHub Flow</a></p>',
                dueDate: (() => {
                  const date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
                  date.setHours(16, 30, 0, 0);
                  return date.toISOString();
                })(), // 5日前16:30期限（期限内に完了）
                labels: [
                  { id: uuidv4(), name: '🔧 開発環境', color: 'secondary' },
                  { id: uuidv4(), name: '✅ 完了', color: 'success' }
                ],
                subTasks: [
                  { id: uuidv4(), title: 'ブランチ命名規則の策定', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'プルリクエストテンプレートの作成', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'CI/CD パイプラインの設定', completed: true, createdAt: new Date().toISOString() }
                ],
                priority: 'medium',
                files: [
                  {
                    id: uuidv4(),
                    name: 'git-workflow-guide.md',
                    type: 'text/markdown',
                    size: 3072,
                    data: 'data:text/markdown;base64,IyBHaXQgV29ya2Zsb3cgR3VpZGUKCiMjIOODluODqeODs+ODgOaImeetpCrjZqrmAl...',
                    uploadedAt: new Date().toISOString()
                  }
                ],
                completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              },
            ],
            color: '#d1fae5'
          },
        ],
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const initialBoards = [defaultBoard];
      updateCurrentBoardId(defaultBoard.id);
      saveBoards(initialBoards, defaultBoard.id);
      dispatch({ type: 'LOAD_BOARDS', payload: initialBoards });
    } else {
      dispatch({ type: 'LOAD_BOARDS', payload: boards });
    }
    
    setIsInitialized(true);
  }, [isInitialized]);
  
  useEffect(() => {
    if (isInitialized && state.boards.length > 0) {
      saveBoards(state.boards, state.currentBoard?.id);
    }
  }, [state.boards, state.currentBoard, isInitialized]);

  
  const createBoard = useCallback((title: string) => {
    dispatch({ type: 'CREATE_BOARD', payload: { title } });
    notify.success(`「${title}」を作成しました`);
  }, [notify]);
  
  const setCurrentBoard = useCallback((boardId: string) => {
    updateCurrentBoardId(boardId);
    dispatch({ type: 'SET_CURRENT_BOARD', payload: boardId });
  }, []);

  const updateBoard = useCallback((boardId: string, updates: Partial<KanbanBoard>) => {
    dispatch({ type: 'UPDATE_BOARD', payload: { boardId, updates } });
    if (updates.title) {
      notify.success(`「${updates.title}」に更新しました`);
    }
  }, [notify]);

  const deleteBoard = useCallback((boardId: string) => {
    const boardToDelete = state.boards.find(board => board.id === boardId);
    dispatch({ type: 'DELETE_BOARD', payload: { boardId } });
    if (boardToDelete) {
      notify.success(`「${boardToDelete.title}」を削除しました`);
    }
  }, [notify, state.boards]);
  
  const createColumn = useCallback((title: string) => {
    if (!state.currentBoard) {
      return;
    }
    dispatch({ type: 'CREATE_COLUMN', payload: { boardId: state.currentBoard.id, title } });
    notify.success(`「${title}」を作成しました`);
  }, [state.currentBoard, notify]);
  
  const createTask = useCallback((columnId: string, title: string, description: string, dueDate?: Date, labels?: Label[], attachments?: FileAttachment[], recurrence?: RecurrenceConfig) => {
    dispatch({ type: 'CREATE_TASK', payload: { columnId, title, description, dueDate, labels, attachments, recurrence } });
    notify.success(`「${title}」を作成しました`);
  }, [notify]);
  
  const moveTask = useCallback((taskId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => {
    dispatch({ type: 'MOVE_TASK', payload: { taskId, sourceColumnId, targetColumnId, targetIndex } });
  }, []);
  
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { taskId, updates } });
    if (updates.title) {
      notify.success(`「${updates.title}」に更新しました`);
    }
  }, [notify]);
  
  const deleteTask = useCallback((taskId: string, columnId: string) => {
    // タスク名を取得してから削除
    const task = state.currentBoard?.columns
      .find(col => col.id === columnId)?.tasks
      .find(t => t.id === taskId);
    dispatch({ type: 'DELETE_TASK', payload: { taskId, columnId } });
    if (task) {
      notify.success(`「${task.title}」を削除しました`);
    }
  }, [notify, state.currentBoard]);
  
  const deleteColumn = useCallback((columnId: string) => {
    // カラム名を取得してから削除
    const column = state.currentBoard?.columns.find(col => col.id === columnId);
    dispatch({ type: 'DELETE_COLUMN', payload: { columnId } });
    if (column) {
      notify.success(`「${column.title}」を削除しました`);
    }
  }, [notify, state.currentBoard]);
  
  const updateColumn = useCallback((columnId: string, updates: Partial<Column>) => {
    dispatch({ type: 'UPDATE_COLUMN', payload: { columnId, updates } });
    if (updates.title) {
      notify.success(`「${updates.title}」に更新しました`);
    }
  }, [notify]);

  const clearCompletedTasks = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPLETED_TASKS' });
    notify.success('完了したタスクをすべて削除しました');
  }, [notify]);

  const addSubTask = useCallback((taskId: string, title: string) => {
    dispatch({ type: 'ADD_SUBTASK', payload: { taskId, title } });
    notify.success(`「${title}」を追加しました`);
  }, [notify]);

  const toggleSubTask = useCallback((taskId: string, subTaskId: string) => {
    dispatch({ type: 'TOGGLE_SUBTASK', payload: { taskId, subTaskId } });
  }, []);

  const deleteSubTask = useCallback((taskId: string, subTaskId: string) => {
    dispatch({ type: 'DELETE_SUBTASK', payload: { taskId, subTaskId } });
    notify.success('サブタスクを削除しました');
  }, [notify]);

  const importBoards = useCallback((boards: KanbanBoard[], replaceAll: boolean = false) => {
    dispatch({ type: 'IMPORT_BOARDS', payload: { boards, replaceAll } });
    const action = replaceAll ? '置換' : '追加';
    notify.success(`${boards.length}個のボードを${action}しました`);
  }, [notify]);

  const setSortOption = useCallback((option: SortOption) => {
    dispatch({ type: 'SET_SORT_OPTION', payload: option });
  }, []);

  const setTaskFilter = useCallback((filter: TaskFilter) => {
    dispatch({ type: 'SET_TASK_FILTER', payload: filter });
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const openTaskDetail = useCallback((taskId: string) => {
    dispatch({ type: 'OPEN_TASK_DETAIL', payload: { taskId } });
  }, []);

  const closeTaskDetail = useCallback(() => {
    dispatch({ type: 'CLOSE_TASK_DETAIL' });
  }, []);

  const openTaskForm = useCallback((defaultDate?: Date) => {
    dispatch({ type: 'OPEN_TASK_FORM', payload: { defaultDate } });
  }, []);

  const closeTaskForm = useCallback(() => {
    dispatch({ type: 'CLOSE_TASK_FORM' });
  }, []);

  // 全ボードから全ラベルを取得（名前でユニーク化）
  const getAllLabels = useCallback((): Label[] => {
    const labelMap = new Map<string, Label>();
    
    state.boards.forEach(board => {
      board.columns.forEach(column => {
        column.tasks.forEach(task => {
          task.labels?.forEach(label => {
            // ラベル名でユニーク化（最初に見つかったものを保持）
            if (!labelMap.has(label.name)) {
              labelMap.set(label.name, label);
            }
          });
        });
      });
    });
    
    return Array.from(labelMap.values());
  }, [state.boards]);

  const loadInitialData = useCallback((data: { boards: KanbanBoard[]; labels: Label[]; tasks: Task[]; columns: Column[] }) => {
    dispatch({ type: 'LOAD_INITIAL_DATA', payload: { boards: data.boards, labels: data.labels } });
  }, []);

  const checkOverdueRecurringTasks = useCallback(() => {
    dispatch({ type: 'CHECK_OVERDUE_RECURRING_TASKS' });
  }, []);

  
  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      createBoard,
      setCurrentBoard,
      updateBoard,
      deleteBoard,
      createColumn,
      createTask,
      moveTask,
      updateTask,
      deleteTask,
      deleteColumn,
      updateColumn,
      clearCompletedTasks,
      addSubTask,
      toggleSubTask,
      deleteSubTask,
      importBoards,
      setSortOption,
      setTaskFilter,
      setViewMode,
      openTaskDetail,
      closeTaskDetail,
      openTaskForm,
      closeTaskForm,
      getAllLabels,
      loadInitialData,
      checkOverdueRecurringTasks,
    }),
    [
      state,
      createBoard,
      setCurrentBoard,
      updateBoard,
      deleteBoard,
      createColumn,
      createTask,
      moveTask,
      updateTask,
      deleteTask,
      deleteColumn,
      updateColumn,
      clearCompletedTasks,
      addSubTask,
      toggleSubTask,
      deleteSubTask,
      importBoards,
      setSortOption,
      setTaskFilter,
      setViewMode,
      openTaskDetail,
      closeTaskDetail,
      openTaskForm,
      closeTaskForm,
      getAllLabels,
      loadInitialData,
      checkOverdueRecurringTasks,
    ]
  );

  // 繰り返しタスクの期限日チェック
  useEffect(() => {
    if (!isInitialized || !state.currentBoard) {
      return;
    }

    // 初回チェック
    checkOverdueRecurringTasks();

    // 10分ごとにチェック
    const interval = setInterval(() => {
      checkOverdueRecurringTasks();
    }, 10 * 60 * 1000); // 10分

    return () => clearInterval(interval);
  }, [isInitialized, state.currentBoard?.id, checkOverdueRecurringTasks]);

  return (
    <KanbanContext.Provider value={contextValue}>
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = (): KanbanContextType => {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};