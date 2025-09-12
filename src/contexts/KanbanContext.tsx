import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { KanbanBoard, Column, Task, Label, SubTask, FileAttachment, SortOption, TaskFilter } from '../types';
import { saveBoards, loadBoards } from '../utils/storage';
import { useNotify } from './NotificationContext';

interface KanbanState {
  boards: KanbanBoard[];
  currentBoard: KanbanBoard | null;
  sortOption: SortOption;
  taskFilter: TaskFilter;
}

type KanbanAction =
  | { type: 'LOAD_BOARDS'; payload: KanbanBoard[] }
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
  | { type: 'SET_TASK_FILTER'; payload: TaskFilter };

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
    updatedAt: new Date(),
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
    console.warn('LocalStorage access failed:', error);
  }
};

// ヘルパー関数: LocalStorageからcurrent-board-idを安全に取得
const getCurrentBoardId = (): string | null => {
  try {
    return localStorage.getItem('current-board-id');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('LocalStorage access failed:', error);
    return null;
  }
};

// ヘルパー関数: LocalStorageにソート設定を安全に保存
const saveSortOption = (sortOption: SortOption) => {
  try {
    localStorage.setItem('sort-option', sortOption);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('LocalStorage access failed:', error);
  }
};

// ヘルパー関数: LocalStorageからソート設定を安全に取得
const loadSortOption = (): SortOption => {
  try {
    const saved = localStorage.getItem('sort-option');
    return (saved as SortOption) ?? 'manual';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('LocalStorage access failed:', error);
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
        createdAt: new Date(),
        updatedAt: new Date(),
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
        dueDate: action.payload.dueDate,
        labels: action.payload.labels,
        attachments: action.payload.attachments,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        console.log('❌ MOVE_TASK: No current board');
        return state;
      }
      
      const { taskId, sourceColumnId, targetColumnId, targetIndex } = action.payload;
      console.log('🚀 MOVE_TASK Action:', { taskId, sourceColumnId, targetColumnId, targetIndex });
      
      // 移動するタスクを取得
      let taskToMove: Task | undefined;
      for (const column of state.currentBoard.columns) {
        if (column.id === sourceColumnId) {
          taskToMove = column.tasks.find(task => task.id === taskId);
          console.log('📋 Task to move found:', taskToMove?.title);
          break;
        }
      }
      
      if (!taskToMove) {
        console.log('❌ MOVE_TASK: Task to move not found');
        return state;
      }
      
      // 完了状態の判定（一番右のカラムかどうか）
      const rightmostColumnIndex = state.currentBoard.columns.length - 1;
      const targetColumnIndex = state.currentBoard.columns.findIndex(col => col.id === targetColumnId);
      const sourceColumnIndex = state.currentBoard.columns.findIndex(col => col.id === sourceColumnId);
      const isMovingToCompleted = targetColumnIndex === rightmostColumnIndex;
      const isMovingFromCompleted = sourceColumnIndex === rightmostColumnIndex;
      
      // タスクのcompletedAtを適切に設定
      const updatedTask = { ...taskToMove, updatedAt: new Date() };
      if (isMovingToCompleted && !isMovingFromCompleted) {
        // 完了状態に移動：completedAtを設定
        updatedTask.completedAt = new Date();
        console.log('✅ Setting completedAt for task completion');
      } else if (isMovingFromCompleted && !isMovingToCompleted) {
        // 完了状態から移動：completedAtをクリア
        updatedTask.completedAt = undefined;
        console.log('🔄 Clearing completedAt for task reopening');
      }
      
      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column => {
          console.log(`🔍 Processing column '${column.title}' (ID: ${column.id})`);
          
          // 同じカラム内での移動の場合
          if (sourceColumnId === targetColumnId && column.id === sourceColumnId) {
            console.log(`🔄 Same column reorder in '${column.title}'`);
            const newTasks = [...column.tasks];
            // まず、移動するタスクを削除
            const taskIndex = newTasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
              newTasks.splice(taskIndex, 1);
              console.log(`📤 Removed task from index ${taskIndex}`);
            }
            // 次に、新しい位置に挿入
            const safeTargetIndex = Math.max(0, Math.min(targetIndex, newTasks.length));
            newTasks.splice(safeTargetIndex, 0, updatedTask);
            console.log(`📥 Added task at index ${safeTargetIndex}: ${column.tasks.length} → ${newTasks.length}`);
            return {
              ...column,
              tasks: newTasks,
            };
          }
          
          // 異なるカラム間での移動の場合
          if (column.id === sourceColumnId) {
            const filteredTasks = column.tasks.filter(task => task.id !== taskId);
            console.log(`📤 Removing from source column '${column.title}': ${column.tasks.length} → ${filteredTasks.length}`);
            return {
              ...column,
              tasks: filteredTasks,
            };
          }
          if (column.id === targetColumnId) {
            const newTasks = [...column.tasks];
            const safeTargetIndex = Math.max(0, Math.min(targetIndex, newTasks.length));
            console.log(`📥 Adding to target column '${column.title}' at index ${safeTargetIndex}: ${newTasks.length} → ${newTasks.length + 1}`);
            newTasks.splice(safeTargetIndex, 0, updatedTask);
            return {
              ...column,
              tasks: newTasks,
            };
          }
          console.log(`⏭️ Skipping column '${column.title}' (not source or target)`);
          return column;
        }),
      });
      
      console.log('✅ MOVE_TASK: Board updated successfully');
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
              ? { ...task, ...action.payload.updates, updatedAt: new Date() }
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
        createdAt: new Date()
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
                  updatedAt: new Date()
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
                  updatedAt: new Date()
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
                  updatedAt: new Date()
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
        title: 'マイプロジェクト',
        columns: [
          {
            id: uuidv4(),
            title: 'To Do',
            tasks: [
              {
                id: uuidv4(),
                title: 'プロジェクトの企画',
                description: 'プロジェクトの目標と要件を明確にする',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            color: '#f6f8fa'
          },
          {
            id: uuidv4(),
            title: 'In Progress',
            tasks: [
              {
                id: uuidv4(),
                title: 'UIデザインの作成',
                description: 'ユーザーインターフェースのデザインを作成',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            color: '#fef3c7'
          },
          {
            id: uuidv4(),
            title: 'Complete',
            tasks: [
              {
                id: uuidv4(),
                title: '技術調査',
                description: '使用するフレームワークや技術の調査',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            color: '#d1fae5'
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
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
    notify.success('ボード作成完了', `「${title}」を作成しました`);
  }, [notify]);
  
  const setCurrentBoard = useCallback((boardId: string) => {
    updateCurrentBoardId(boardId);
    dispatch({ type: 'SET_CURRENT_BOARD', payload: boardId });
  }, []);

  const updateBoard = useCallback((boardId: string, updates: Partial<KanbanBoard>) => {
    dispatch({ type: 'UPDATE_BOARD', payload: { boardId, updates } });
    if (updates.title) {
      notify.success('ボード更新完了', `「${updates.title}」に更新しました`);
    }
  }, [notify]);

  const deleteBoard = useCallback((boardId: string) => {
    const boardToDelete = state.boards.find(board => board.id === boardId);
    dispatch({ type: 'DELETE_BOARD', payload: { boardId } });
    if (boardToDelete) {
      notify.success('ボード削除完了', `「${boardToDelete.title}」を削除しました`);
    }
  }, [notify, state.boards]);
  
  const createColumn = useCallback((title: string) => {
    if (!state.currentBoard) {
      return;
    }
    dispatch({ type: 'CREATE_COLUMN', payload: { boardId: state.currentBoard.id, title } });
    notify.success('カラム作成完了', `「${title}」を作成しました`);
  }, [state.currentBoard, notify]);
  
  const createTask = useCallback((columnId: string, title: string, description: string, dueDate?: Date, labels?: Label[], attachments?: FileAttachment[]) => {
    dispatch({ type: 'CREATE_TASK', payload: { columnId, title, description, dueDate, labels, attachments } });
    notify.success('タスク作成完了', `「${title}」を作成しました`);
  }, [notify]);
  
  const moveTask = useCallback((taskId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => {
    dispatch({ type: 'MOVE_TASK', payload: { taskId, sourceColumnId, targetColumnId, targetIndex } });
  }, []);
  
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { taskId, updates } });
    if (updates.title) {
      notify.success('タスク更新完了', `「${updates.title}」に更新しました`);
    }
  }, [notify]);
  
  const deleteTask = useCallback((taskId: string, columnId: string) => {
    // タスク名を取得してから削除
    const task = state.currentBoard?.columns
      .find(col => col.id === columnId)?.tasks
      .find(t => t.id === taskId);
    dispatch({ type: 'DELETE_TASK', payload: { taskId, columnId } });
    if (task) {
      notify.success('タスク削除完了', `「${task.title}」を削除しました`);
    }
  }, [notify, state.currentBoard]);
  
  const deleteColumn = useCallback((columnId: string) => {
    // カラム名を取得してから削除
    const column = state.currentBoard?.columns.find(col => col.id === columnId);
    dispatch({ type: 'DELETE_COLUMN', payload: { columnId } });
    if (column) {
      notify.success('カラム削除完了', `「${column.title}」を削除しました`);
    }
  }, [notify, state.currentBoard]);
  
  const updateColumn = useCallback((columnId: string, updates: Partial<Column>) => {
    dispatch({ type: 'UPDATE_COLUMN', payload: { columnId, updates } });
    if (updates.title) {
      notify.success('カラム更新完了', `「${updates.title}」に更新しました`);
    }
  }, [notify]);

  const clearCompletedTasks = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPLETED_TASKS' });
    notify.success('完了タスククリア', '完了したタスクをすべて削除しました');
  }, [notify]);

  const addSubTask = useCallback((taskId: string, title: string) => {
    dispatch({ type: 'ADD_SUBTASK', payload: { taskId, title } });
    notify.success('サブタスク追加', `「${title}」を追加しました`);
  }, [notify]);

  const toggleSubTask = useCallback((taskId: string, subTaskId: string) => {
    dispatch({ type: 'TOGGLE_SUBTASK', payload: { taskId, subTaskId } });
  }, []);

  const deleteSubTask = useCallback((taskId: string, subTaskId: string) => {
    dispatch({ type: 'DELETE_SUBTASK', payload: { taskId, subTaskId } });
    notify.success('サブタスク削除', 'サブタスクを削除しました');
  }, [notify]);

  const importBoards = useCallback((boards: KanbanBoard[], replaceAll: boolean = false) => {
    dispatch({ type: 'IMPORT_BOARDS', payload: { boards, replaceAll } });
    const action = replaceAll ? '置換' : '追加';
    notify.success('データインポート完了', `${boards.length}個のボードを${action}しました`);
  }, [notify]);

  const setSortOption = useCallback((option: SortOption) => {
    dispatch({ type: 'SET_SORT_OPTION', payload: option });
  }, []);

  const setTaskFilter = useCallback((filter: TaskFilter) => {
    dispatch({ type: 'SET_TASK_FILTER', payload: filter });
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