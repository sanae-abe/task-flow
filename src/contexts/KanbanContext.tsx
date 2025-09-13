import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { KanbanBoard, Column, Task, Label, SubTask, FileAttachment, SortOption, TaskFilter, ViewMode } from '../types';
import { saveBoards, loadBoards } from '../utils/storage';
import { useNotify } from './NotificationContext';
import logger from '../utils/logger';

interface KanbanState {
  boards: KanbanBoard[];
  currentBoard: KanbanBoard | null;
  sortOption: SortOption;
  taskFilter: TaskFilter;
  viewMode: ViewMode;
  labels: Label[];
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
  | { type: 'CREATE_TASK'; payload: { columnId: string; title: string; description: string; dueDate?: Date; labels?: Label[]; attachments?: FileAttachment[] } }
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
  | { type: 'SET_VIEW_MODE'; payload: ViewMode };

interface KanbanContextType {
  state: KanbanState;
  dispatch: React.Dispatch<KanbanAction>;
  createBoard: (title: string) => void;
  setCurrentBoard: (boardId: string) => void;
  updateBoard: (boardId: string, updates: Partial<KanbanBoard>) => void;
  deleteBoard: (boardId: string) => void;
  createColumn: (title: string) => void;
  createTask: (columnId: string, title: string, description: string, dueDate?: Date, labels?: Label[], attachments?: FileAttachment[]) => void;
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
  getAllLabels: () => Label[];
  loadInitialData: (data: { boards: KanbanBoard[]; labels: Label[]; tasks: Task[]; columns: Column[] }) => void;
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
            ? { ...column, tasks: [] }
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
        title: 'デモプロジェクト',
        labels: [],
        columns: [
          {
            id: uuidv4(),
            title: 'バックログ',
            tasks: [
              {
                id: uuidv4(),
                title: '重要タスク - プロジェクト企画',
                description: 'プロジェクトの目標設定、要件定義、スコープの明確化\n\n詳細:\n• ステークホルダーとの要件整理\n• プロジェクトスコープの決定\n• 成功指標の設定',
                dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 昨日期限（期限切れ）
                labels: [
                  { id: uuidv4(), name: '緊急', color: 'danger' },
                  { id: uuidv4(), name: '企画', color: 'primary' }
                ],
                subTasks: [
                  { id: uuidv4(), title: 'ステークホルダー分析', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: '要件定義書作成', completed: false, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'スコープ確定', completed: false, createdAt: new Date().toISOString() }
                ],
                priority: 'high',
                files: [],
                completedAt: null,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: uuidv4(),
                title: 'データベース設計',
                description: 'データベーススキーマの設計と最適化',
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 明日期限
                labels: [
                  { id: uuidv4(), name: '設計', color: 'primary' },
                  { id: uuidv4(), name: 'データベース', color: 'success' }
                ],
                subTasks: [
                  { id: uuidv4(), title: 'ER図作成', completed: false, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'インデックス設計', completed: false, createdAt: new Date().toISOString() }
                ],
                priority: 'medium',
                files: [],
                completedAt: null,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              },
            ],
            color: '#f6f8fa'
          },
          {
            id: uuidv4(),
            title: '進行中',
            tasks: [
              {
                id: uuidv4(),
                title: 'UIコンポーネント開発',
                description: 'React コンポーネントライブラリの構築\nPrimerデザインシステムを使用してコンポーネントを実装',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1週間後
                labels: [
                  { id: uuidv4(), name: 'フロントエンド', color: 'success' },
                  { id: uuidv4(), name: 'React', color: 'primary' }
                ],
                subTasks: [
                  { id: uuidv4(), title: 'ボタンコンポーネント', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'フォームコンポーネント', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'モーダルコンポーネント', completed: false, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'ドロップダウンコンポーネント', completed: false, createdAt: new Date().toISOString() }
                ],
                files: [
                  {
                    id: uuidv4(),
                    name: 'design-spec.md',
                    type: 'text/markdown',
                    size: 2048,
                    data: 'data:text/markdown;base64,IyDjg4fjgrbjgqTjg7Pjgrnjg5rjg4Pjgq/KU2ljqrjgobnjgovjgqjjgreHRmLjg7HjGV0aqW1tbLm5lbnAL',
                    uploadedAt: new Date().toISOString()
                  }
                ],
                priority: 'medium',
                completedAt: null,
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
              },
              {
                id: uuidv4(),
                title: 'API開発',
                description: 'REST API エンドポイントの実装\n認証、CRUD操作、エラーハンドリングを含む',
                dueDate: new Date().toISOString(), // 今日期限
                labels: [
                  { id: uuidv4(), name: 'バックエンド', color: 'severe' },
                  { id: uuidv4(), name: 'API', color: 'attention' }
                ],
                subTasks: [
                  { id: uuidv4(), title: 'ユーザー認証API', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'タスク管理API', completed: false, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'ファイルアップロードAPI', completed: false, createdAt: new Date().toISOString() }
                ],
                priority: 'high',
                files: [],
                completedAt: null,
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
              },
            ],
            color: '#fef3c7'
          },
          {
            id: uuidv4(),
            title: 'レビュー待ち',
            tasks: [
              {
                id: uuidv4(),
                title: 'テストケース作成',
                description: 'ユニットテストとE2Eテストの実装',
                labels: [
                  { id: uuidv4(), name: 'テスト', color: 'done' },
                  { id: uuidv4(), name: '品質保証', color: 'attention' }
                ],
                subTasks: [
                  { id: uuidv4(), title: 'ユニットテスト', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'インテグレーションテスト', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'E2Eテスト', completed: true, createdAt: new Date().toISOString() }
                ],
                files: [
                  {
                    id: uuidv4(),
                    name: 'test-results.json',
                    type: 'application/json',
                    size: 1024,
                    data: 'data:application/json;base64,eyJ0ZXN0UmVzdWx0cyI6ICJwYXNzZWQifQ==',
                    uploadedAt: new Date().toISOString()
                  }
                ],
                priority: 'low',
                dueDate: null,
                completedAt: null,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              },
            ],
            color: '#e0e7ff'
          },
          {
            id: uuidv4(),
            title: '完了',
            tasks: [
              {
                id: uuidv4(),
                title: '技術調査と検証',
                description: '使用するフレームワークとライブラリの技術検証\n\n調査結果をドキュメント化済み',
                labels: [
                  { id: uuidv4(), name: '調査', color: 'done' },
                  { id: uuidv4(), name: '完了', color: 'success' }
                ],
                subTasks: [
                  { id: uuidv4(), title: 'React 19調査', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'TypeScript 5.7調査', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'Primer React調査', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: '調査結果まとめ', completed: true, createdAt: new Date().toISOString() }
                ],
                files: [
                  {
                    id: uuidv4(),
                    name: 'tech-research.pdf',
                    type: 'application/pdf',
                    size: 5120,
                    data: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iagoKZW5kb2JqCg==',
                    uploadedAt: new Date().toISOString()
                  }
                ],
                priority: 'low',
                dueDate: null,
                completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: uuidv4(),
                title: 'セキュリティ監査',
                description: 'アプリケーションのセキュリティ脆弱性チェック',
                labels: [
                  { id: uuidv4(), name: 'セキュリティ', color: 'danger' },
                  { id: uuidv4(), name: '監査', color: 'default' },
                  { id: uuidv4(), name: '完了', color: 'success' }
                ],
                subTasks: [
                  { id: uuidv4(), title: '脆弱性スキャン', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'ペネトレーションテスト', completed: true, createdAt: new Date().toISOString() },
                  { id: uuidv4(), title: 'セキュリティレポート作成', completed: true, createdAt: new Date().toISOString() }
                ],
                priority: 'medium',
                dueDate: null,
                files: [],
                completedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
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
  
  const createTask = useCallback((columnId: string, title: string, description: string, dueDate?: Date, labels?: Label[], attachments?: FileAttachment[]) => {
    dispatch({ type: 'CREATE_TASK', payload: { columnId, title, description, dueDate, labels, attachments } });
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
      getAllLabels,
      loadInitialData,
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
      getAllLabels,
      loadInitialData,
    ]
  );

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