import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { KanbanBoard, Column } from '../types';
import { saveBoards, loadBoards } from '../utils/storage';
import { useNotify } from './NotificationContext';
import { logger } from '../utils/logger';

interface BoardState {
  boards: KanbanBoard[];
  currentBoard: KanbanBoard | null;
}

type BoardAction =
  | { type: 'LOAD_BOARDS'; payload: KanbanBoard[] }
  | { type: 'CREATE_BOARD'; payload: { title: string } }
  | { type: 'SET_CURRENT_BOARD'; payload: string }
  | { type: 'UPDATE_BOARD'; payload: { boardId: string; updates: Partial<KanbanBoard> } }
  | { type: 'DELETE_BOARD'; payload: { boardId: string } }
  | { type: 'CREATE_COLUMN'; payload: { boardId: string; title: string } }
  | { type: 'DELETE_COLUMN'; payload: { columnId: string } }
  | { type: 'UPDATE_COLUMN'; payload: { columnId: string; updates: Partial<Column> } }
  | { type: 'IMPORT_BOARDS'; payload: { boards: KanbanBoard[]; replaceAll?: boolean } };

interface BoardContextType {
  state: BoardState;
  currentBoard: KanbanBoard | null;
  dispatch: React.Dispatch<BoardAction>;
  createBoard: (title: string) => void;
  setCurrentBoard: (boardId: string) => void;
  updateBoard: (boardId: string, updates: Partial<KanbanBoard>) => void;
  deleteBoard: (boardId: string) => void;
  createColumn: (title: string) => void;
  deleteColumn: (columnId: string) => void;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  importBoards: (boards: KanbanBoard[], replaceAll?: boolean) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

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
    logger.warn('Failed to update current board ID in localStorage:', error);
  }
};

const getCurrentBoardId = (): string | null => {
  try {
    return localStorage.getItem('current-board-id');
  } catch (error) {
    logger.warn('Failed to get current board ID from localStorage:', error);
    return null;
  }
};

const boardReducer = (state: BoardState, action: BoardAction): BoardState => {
  switch (action.type) {
    case 'LOAD_BOARDS': {
      const boards = action.payload;

      // 保存された現在のボードIDを取得
      const savedCurrentBoardId = getCurrentBoardId();
      const currentBoard = savedCurrentBoardId
        ? (boards.find(board => board.id === savedCurrentBoardId) || null)
        : (boards.length > 0 ? boards[0] : null);

      // 現在のボードIDが無効な場合は更新
      if (currentBoard && currentBoard.id !== savedCurrentBoardId) {
        updateCurrentBoardId(currentBoard.id);
      }

      return {
        ...state,
        boards,
        currentBoard: currentBoard as KanbanBoard | null,
      };
    }

    case 'CREATE_BOARD': {
      const newBoard: KanbanBoard = {
        id: uuidv4(),
        title: action.payload.title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        columns: [
          { id: uuidv4(), title: 'To Do', tasks: [] },
          { id: uuidv4(), title: 'In Progress', tasks: [] },
          { id: uuidv4(), title: 'Done', tasks: [] },
        ],
        labels: [],
      };

      const newBoards = [...state.boards, newBoard];

      return {
        ...state,
        boards: newBoards,
        currentBoard: newBoard,
      };
    }

    case 'SET_CURRENT_BOARD': {
      const newCurrentBoard = state.boards.find(board => board.id === action.payload) || null;

      if (newCurrentBoard) {
        updateCurrentBoardId(newCurrentBoard.id);
      }

      return {
        ...state,
        currentBoard: newCurrentBoard as KanbanBoard | null,
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

      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board
        ),
        currentBoard: state.currentBoard?.id === updatedBoard.id ? updatedBoard : state.currentBoard,
      };
    }

    case 'DELETE_BOARD': {
      const newBoards = state.boards.filter(board => board.id !== action.payload.boardId);

      let newCurrentBoard: KanbanBoard | null = state.currentBoard;
      if (state.currentBoard?.id === action.payload.boardId) {
        newCurrentBoard = (newBoards.length > 0 ? newBoards[0] : null) as KanbanBoard | null;
        updateCurrentBoardId(newCurrentBoard?.id ?? null);
      }

      return {
        ...state,
        boards: newBoards,
        currentBoard: newCurrentBoard as KanbanBoard | null,
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
      };

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: [...state.currentBoard.columns, newColumn],
      });

      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard,
      };
    }

    case 'DELETE_COLUMN': {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.filter(column => column.id !== action.payload.columnId),
      });

      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard,
      };
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

      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard,
      };
    }

    case 'IMPORT_BOARDS': {
      const { boards: importedBoards, replaceAll = false } = action.payload;

      // IDの重複をチェックして新しいIDを生成
      const existingBoardIds = new Set(state.boards.map(board => board.id));
      const boardsToImport = importedBoards.map(board => {
        if (existingBoardIds.has(board.id)) {
          return {
            ...board,
            id: uuidv4(),
            title: `${board.title} (インポート)`,
            updatedAt: new Date().toISOString(),
          };
        }
        return board;
      });

      const newBoards = replaceAll ? boardsToImport : [...state.boards, ...boardsToImport];
      const newCurrentBoard = newBoards.length > 0 ? newBoards[0] : null;

      if (newCurrentBoard) {
        updateCurrentBoardId(newCurrentBoard.id);
      }

      return {
        ...state,
        boards: newBoards,
        currentBoard: newCurrentBoard as KanbanBoard | null,
      };
    }

    default:
      return state;
  }
};

interface BoardProviderProps {
  children: ReactNode;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const notify = useNotify();

  const [state, dispatch] = useReducer(boardReducer, {
    boards: [],
    currentBoard: null,
  });

  // 初期データの読み込み
  useEffect(() => {
    const loadInitialData = () => {
      try {
        const boards = loadBoards();
        dispatch({ type: 'LOAD_BOARDS', payload: boards });
      } catch (error) {
        logger.error('Failed to load initial board data:', error);
        notify.error('ボードデータの読み込みに失敗しました');
      }
    };

    loadInitialData();
  }, [notify]);

  // データの永続化
  useEffect(() => {
    if (state.boards.length > 0) {
      try {
        saveBoards(state.boards, state.currentBoard?.id);
      } catch (error) {
        logger.error('Failed to save board data:', error);
        notify.error('ボードデータの保存に失敗しました');
      }
    }
  }, [state.boards, state.currentBoard, notify]);

  // メモ化されたアクション関数
  const createBoard = useCallback((title: string) => {
    dispatch({ type: 'CREATE_BOARD', payload: { title } });
    notify.success(`ボード「${title}」を作成しました`);
  }, [notify]);

  const setCurrentBoard = useCallback((boardId: string) => {
    dispatch({ type: 'SET_CURRENT_BOARD', payload: boardId });
  }, []);

  const updateBoard = useCallback((boardId: string, updates: Partial<KanbanBoard>) => {
    dispatch({ type: 'UPDATE_BOARD', payload: { boardId, updates } });
    notify.success('ボードを更新しました');
  }, [notify]);

  const deleteBoard = useCallback((boardId: string) => {
    const boardToDelete = state.boards.find(board => board.id === boardId);
    if (boardToDelete) {
      dispatch({ type: 'DELETE_BOARD', payload: { boardId } });
      notify.success(`ボード「${boardToDelete.title}」を削除しました`);
    }
  }, [state.boards, notify]);

  const createColumn = useCallback((title: string) => {
    if (!state.currentBoard) {
      notify.error('ボードが選択されていません');
      return;
    }
    dispatch({ type: 'CREATE_COLUMN', payload: { boardId: state.currentBoard.id, title } });
    notify.success(`カラム「${title}」を作成しました`);
  }, [state.currentBoard, notify]);

  const deleteColumn = useCallback((columnId: string) => {
    dispatch({ type: 'DELETE_COLUMN', payload: { columnId } });
    notify.success('カラムを削除しました');
  }, [notify]);

  const updateColumn = useCallback((columnId: string, updates: Partial<Column>) => {
    dispatch({ type: 'UPDATE_COLUMN', payload: { columnId, updates } });
    notify.success('カラムを更新しました');
  }, [notify]);

  const importBoards = useCallback((boards: KanbanBoard[], replaceAll = false) => {
    dispatch({ type: 'IMPORT_BOARDS', payload: { boards, replaceAll } });
    const message = replaceAll
      ? `${boards.length}個のボードをインポートしました（既存データを置換）`
      : `${boards.length}個のボードをインポートしました`;
    notify.success(message);
  }, [notify]);

  // メモ化されたコンテキスト値
  const contextValue = useMemo(() => ({
    state,
    currentBoard: state.currentBoard,
    dispatch,
    createBoard,
    setCurrentBoard,
    updateBoard,
    deleteBoard,
    createColumn,
    deleteColumn,
    updateColumn,
    importBoards,
  }), [
    state,
    createBoard,
    setCurrentBoard,
    updateBoard,
    deleteBoard,
    createColumn,
    deleteColumn,
    updateColumn,
    importBoards,
  ]);

  return (
    <BoardContext.Provider value={contextValue}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = (): BoardContextType => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

export default BoardContext;