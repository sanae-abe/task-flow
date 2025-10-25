import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";

import type { KanbanBoard, Column, Label } from "../types";
import { saveBoards, loadBoards, protectDemoBoard } from "../utils/storage";
import { loadSettings } from "../utils/settingsStorage";
import { useSonnerNotify } from "../hooks/useSonnerNotify";
import { logger } from "../utils/logger";
import {
  moveBoardToRecycleBin,
  restoreBoardFromRecycleBin,
  moveColumnToRecycleBin,
  restoreColumnFromRecycleBin,
  permanentlyDeleteColumn
} from "../utils/recycleBin";

interface BoardState {
  boards: KanbanBoard[];
  currentBoard: KanbanBoard | null;
}

type BoardAction =
  | { type: "LOAD_BOARDS"; payload: KanbanBoard[] }
  | { type: "CREATE_BOARD"; payload: { title: string } }
  | { type: "SET_CURRENT_BOARD"; payload: string }
  | {
      type: "UPDATE_BOARD";
      payload: { boardId: string; updates: Partial<KanbanBoard> };
    }
  | { type: "DELETE_BOARD"; payload: { boardId: string } }
  | {
      type: "CREATE_COLUMN";
      payload: { boardId: string; title: string; insertIndex?: number };
    }
  | { type: "DELETE_COLUMN"; payload: { columnId: string } }
  | {
      type: "UPDATE_COLUMN";
      payload: { columnId: string; updates: Partial<Column> };
    }
  | {
      type: "MOVE_COLUMN";
      payload: { columnId: string; direction: "left" | "right" };
    }
  | {
      type: "IMPORT_BOARDS";
      payload: { boards: KanbanBoard[]; replaceAll?: boolean };
    }
  | { type: "REORDER_BOARDS"; payload: { boards: KanbanBoard[] } }
  | {
      type: "MOVE_TASK_TO_BOARD";
      payload: {
        taskId: string;
        sourceBoardId: string;
        sourceColumnId: string;
        targetBoardId: string;
        targetColumnId?: string;
      };
    }
  | { type: "ADD_LABEL"; payload: { label: Label } }
  | { type: "UPDATE_LABEL"; payload: { labelId: string; updates: Partial<Label> } }
  | { type: "DELETE_LABEL"; payload: { labelId: string } }
  | { type: "DELETE_LABEL_FROM_ALL_BOARDS"; payload: { labelId: string } }
  | { type: "RESTORE_BOARD"; payload: { boardId: string } }
  | { type: "PERMANENTLY_DELETE_BOARD"; payload: { boardId: string } }
  | { type: "EMPTY_BOARD_RECYCLE_BIN" }
  | { type: "RESTORE_COLUMN"; payload: { columnId: string } }
  | { type: "PERMANENTLY_DELETE_COLUMN"; payload: { columnId: string } };

interface BoardContextType {
  state: BoardState;
  currentBoard: KanbanBoard | null;
  dispatch: React.Dispatch<BoardAction>;
  createBoard: (title: string) => void;
  setCurrentBoard: (boardId: string) => void;
  updateBoard: (boardId: string, updates: Partial<KanbanBoard>) => void;
  deleteBoard: (boardId: string) => void;
  restoreBoard: (boardId: string) => void;
  permanentlyDeleteBoard: (boardId: string) => void;
  emptyBoardRecycleBin: () => void;
  createColumn: (title: string, insertIndex?: number) => void;
  deleteColumn: (columnId: string) => void;
  restoreColumn: (columnId: string) => void;
  permanentlyDeleteColumn: (columnId: string) => void;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  moveColumn: (columnId: string, direction: "left" | "right") => void;
  importBoards: (boards: KanbanBoard[], replaceAll?: boolean) => void;
  reorderBoards: (boards: KanbanBoard[]) => void;
  moveTaskToBoard: (
    taskId: string,
    sourceBoardId: string,
    sourceColumnId: string,
    targetBoardId: string,
    targetColumnId?: string,
  ) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

// ヘルパー関数: ボードのupdatedAtを更新
const updateBoardTimestamp = (board: KanbanBoard): KanbanBoard => ({
  ...board,
  updatedAt: new Date().toISOString(),
});

// ヘルパー関数: アクティブなボードのみを取得
const getActiveBoards = (boards: KanbanBoard[]): KanbanBoard[] =>
  boards.filter(board => board.deletionState !== "deleted");

// ヘルパー関数: LocalStorageのcurrent-board-idを安全に管理
const updateCurrentBoardId = (boardId: string | null) => {
  try {
    if (boardId) {
      localStorage.setItem("current-board-id", boardId);
    } else {
      localStorage.removeItem("current-board-id");
    }
  } catch (error) {
    logger.warn("Failed to update current board ID in localStorage:", error);
  }
};

const getCurrentBoardId = (): string | null => {
  try {
    return localStorage.getItem("current-board-id");
  } catch (error) {
    logger.warn("Failed to get current board ID from localStorage:", error);
    return null;
  }
};

const boardReducer = (state: BoardState, action: BoardAction): BoardState => {
  switch (action.type) {
    case "LOAD_BOARDS": {
      // デモデータ保護機能を適用
      const protectedBoards = protectDemoBoard(action.payload);
      const activeBoards = getActiveBoards(protectedBoards);

      // 保存された現在のボードIDを取得
      const savedCurrentBoardId = getCurrentBoardId();
      const currentBoard = savedCurrentBoardId
        ? activeBoards.find((board) => board.id === savedCurrentBoardId) || null
        : activeBoards.length > 0
          ? activeBoards[0]
          : null;

      // 現在のボードIDが無効な場合は更新
      if (currentBoard && currentBoard.id !== savedCurrentBoardId) {
        updateCurrentBoardId(currentBoard.id);
      }

      return {
        ...state,
        boards: protectedBoards,
        currentBoard: currentBoard as KanbanBoard | null,
      };
    }

    case "CREATE_BOARD": {
      // デフォルトカラム設定を読み込み
      const settings = loadSettings();
      const defaultColumns = settings.defaultColumns.map((columnConfig) => ({
        id: uuidv4(),
        title: columnConfig.name,
        tasks: [],
      }));

      const newBoard: KanbanBoard = {
        id: uuidv4(),
        title: action.payload.title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        columns: defaultColumns,
        labels: [],
        deletionState: "active",
        deletedAt: null,
      };

      const newBoards = [...state.boards, newBoard];

      return {
        ...state,
        boards: newBoards,
        currentBoard: newBoard,
      };
    }

    case "SET_CURRENT_BOARD": {
      const activeBoards = getActiveBoards(state.boards);
      const newCurrentBoard =
        activeBoards.find((board) => board.id === action.payload) || null;

      if (newCurrentBoard) {
        updateCurrentBoardId(newCurrentBoard.id);
      }

      return {
        ...state,
        currentBoard: newCurrentBoard as KanbanBoard | null,
      };
    }

    case "UPDATE_BOARD": {
      const boardToUpdate = state.boards.find(
        (board) => board.id === action.payload.boardId,
      );
      if (!boardToUpdate) {
        return state;
      }

      const updatedBoard = updateBoardTimestamp({
        ...boardToUpdate,
        ...action.payload.updates,
      });

      return {
        ...state,
        boards: state.boards.map((board) =>
          board.id === updatedBoard.id ? updatedBoard : board,
        ),
        currentBoard:
          state.currentBoard?.id === updatedBoard.id
            ? updatedBoard
            : state.currentBoard,
      };
    }

    case "DELETE_BOARD": {
      // ソフトデリート（ゴミ箱に移動）
      const newBoards = moveBoardToRecycleBin(state.boards, action.payload.boardId);
      const activeBoards = getActiveBoards(newBoards);

      let newCurrentBoard: KanbanBoard | null = state.currentBoard;
      if (state.currentBoard?.id === action.payload.boardId) {
        newCurrentBoard = (
          activeBoards.length > 0 ? activeBoards[0] : null
        ) as KanbanBoard | null;
        updateCurrentBoardId(newCurrentBoard?.id ?? null);
      }

      return {
        ...state,
        boards: newBoards,
        currentBoard: newCurrentBoard as KanbanBoard | null,
      };
    }

    case "CREATE_COLUMN": {
      if (!state.currentBoard) {
        return state;
      }

      const newColumn: Column = {
        id: uuidv4(),
        title: action.payload.title,
        tasks: [],
        deletionState: "active",
        deletedAt: null,
      };

      const currentColumns = [...state.currentBoard.columns];
      const insertIndex =
        action.payload.insertIndex !== undefined
          ? Math.max(
              0,
              Math.min(action.payload.insertIndex, currentColumns.length),
            )
          : currentColumns.length;

      currentColumns.splice(insertIndex, 0, newColumn);

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: currentColumns,
      });

      return {
        ...state,
        boards: state.boards.map((board) =>
          board.id === updatedBoard.id ? updatedBoard : board,
        ),
        currentBoard: updatedBoard,
      };
    }

    case "DELETE_COLUMN": {
      // ソフトデリート（ゴミ箱に移動）
      const newBoards = moveColumnToRecycleBin(state.boards, action.payload.columnId);

      // 現在のボードを更新
      const updatedCurrentBoard = state.currentBoard
        ? newBoards.find(board => board.id === state.currentBoard?.id) || null
        : null;

      return {
        ...state,
        boards: newBoards,
        currentBoard: updatedCurrentBoard,
      };
    }

    case "UPDATE_COLUMN": {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.map((column) =>
          column.id === action.payload.columnId
            ? { ...column, ...action.payload.updates }
            : column,
        ),
      });

      return {
        ...state,
        boards: state.boards.map((board) =>
          board.id === updatedBoard.id ? updatedBoard : board,
        ),
        currentBoard: updatedBoard,
      };
    }

    case "MOVE_COLUMN": {
      if (!state.currentBoard) {
        return state;
      }

      const columns = [...state.currentBoard.columns];
      const currentIndex = columns.findIndex(
        (column) => column.id === action.payload.columnId,
      );

      if (currentIndex === -1) {
        return state;
      }

      const direction = action.payload.direction;
      let newIndex: number;

      if (direction === "left") {
        newIndex = Math.max(0, currentIndex - 1);
      } else {
        newIndex = Math.min(columns.length - 1, currentIndex + 1);
      }

      // インデックスが同じ場合は移動しない
      if (currentIndex === newIndex) {
        return state;
      }

      // カラムを移動
      const [movedColumn] = columns.splice(currentIndex, 1);
      if (movedColumn) {
        columns.splice(newIndex, 0, movedColumn);
      }

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns,
      });

      return {
        ...state,
        boards: state.boards.map((board) =>
          board.id === updatedBoard.id ? updatedBoard : board,
        ),
        currentBoard: updatedBoard,
      };
    }

    case "IMPORT_BOARDS": {
      const { boards: importedBoards, replaceAll = false } = action.payload;

      // IDの重複をチェックして新しいIDを生成
      const existingBoardIds = new Set(state.boards.map((board) => board.id));
      const boardsToImport = importedBoards.map((board) => {
        if (existingBoardIds.has(board.id)) {
          return {
            ...board,
            id: uuidv4(),
            updatedAt: new Date().toISOString(),
          };
        }
        return board;
      });

      const newBoards = replaceAll
        ? boardsToImport
        : [...state.boards, ...boardsToImport];
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

    case "REORDER_BOARDS": {
      const { boards: reorderedBoards } = action.payload;

      return {
        ...state,
        boards: reorderedBoards,
      };
    }

    case "MOVE_TASK_TO_BOARD": {
      const {
        taskId,
        sourceBoardId,
        sourceColumnId,
        targetBoardId,
        targetColumnId,
      } = action.payload;

      // ソースボードとターゲットボードを取得
      const sourceBoard = state.boards.find(
        (board) => board.id === sourceBoardId,
      );
      const targetBoard = state.boards.find(
        (board) => board.id === targetBoardId,
      );

      if (!sourceBoard || !targetBoard) {
        return state;
      }

      // ソースカラムからタスクを取得
      const sourceColumn = sourceBoard.columns.find(
        (col) => col.id === sourceColumnId,
      );
      if (!sourceColumn) {
        return state;
      }

      const taskToMove = sourceColumn.tasks.find((task) => task.id === taskId);
      if (!taskToMove) {
        return state;
      }

      // ターゲットカラムを決定（指定されていない場合は最初のカラムを使用）
      const targetColumnToUse = targetColumnId
        ? targetBoard.columns.find((col) => col.id === targetColumnId)
        : targetBoard.columns[0];

      if (!targetColumnToUse) {
        return state;
      }

      // ソースボードからタスクを削除
      const updatedSourceBoard = updateBoardTimestamp({
        ...sourceBoard,
        columns: sourceBoard.columns.map((col) =>
          col.id === sourceColumnId
            ? { ...col, tasks: col.tasks.filter((task) => task.id !== taskId) }
            : col,
        ),
      });

      // ターゲットボードにタスクを追加（完了タスクの場合は未完了状態にリセット）
      const resetTask = taskToMove.completedAt
        ? {
            ...taskToMove,
            completedAt: null,
            // サブタスクも未完了状態にリセット
            subTasks:
              taskToMove.subTasks?.map((subTask) => ({
                ...subTask,
                completed: false,
              })) || [],
          }
        : taskToMove;

      const updatedTargetBoard = updateBoardTimestamp({
        ...targetBoard,
        columns: targetBoard.columns.map((col) =>
          col.id === targetColumnToUse.id
            ? { ...col, tasks: [...col.tasks, resetTask] }
            : col,
        ),
      });

      // 両方のボードを更新
      const updatedBoards = state.boards.map((board) => {
        if (board.id === sourceBoardId) {
          return updatedSourceBoard;
        }
        if (board.id === targetBoardId) {
          return updatedTargetBoard;
        }
        return board;
      });

      // currentBoardが更新された場合は反映
      let updatedCurrentBoard = state.currentBoard;
      if (state.currentBoard?.id === sourceBoardId) {
        updatedCurrentBoard = updatedSourceBoard;
      } else if (state.currentBoard?.id === targetBoardId) {
        updatedCurrentBoard = updatedTargetBoard;
      }

      return {
        ...state,
        boards: updatedBoards,
        currentBoard: updatedCurrentBoard,
      };
    }

    case "ADD_LABEL": {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        labels: [...state.currentBoard.labels, action.payload.label],
      });

      return {
        ...state,
        boards: state.boards.map((board) =>
          board.id === updatedBoard.id ? updatedBoard : board,
        ),
        currentBoard: updatedBoard,
      };
    }

    case "UPDATE_LABEL": {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        labels: state.currentBoard.labels.map((label) =>
          label.id === action.payload.labelId
            ? { ...label, ...action.payload.updates }
            : label,
        ),
        columns: state.currentBoard.columns.map((column) => ({
          ...column,
          tasks: column.tasks.map((task) => ({
            ...task,
            labels: task.labels.map((label) =>
              label.id === action.payload.labelId
                ? { ...label, ...action.payload.updates }
                : label,
            ),
          })),
        })),
      });

      return {
        ...state,
        boards: state.boards.map((board) =>
          board.id === updatedBoard.id ? updatedBoard : board,
        ),
        currentBoard: updatedBoard,
      };
    }

    case "DELETE_LABEL": {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        labels: state.currentBoard.labels.filter(
          (label) => label.id !== action.payload.labelId,
        ),
        columns: state.currentBoard.columns.map((column) => ({
          ...column,
          tasks: column.tasks.map((task) => ({
            ...task,
            labels: task.labels.filter(
              (label) => label.id !== action.payload.labelId,
            ),
          })),
        })),
      });

      return {
        ...state,
        boards: state.boards.map((board) =>
          board.id === updatedBoard.id ? updatedBoard : board,
        ),
        currentBoard: updatedBoard,
      };
    }

    case "DELETE_LABEL_FROM_ALL_BOARDS": {
      const { labelId } = action.payload;
      const currentTime = new Date().toISOString();

      // すべてのボードからラベルを削除し、タスクからも削除
      const updatedBoards = state.boards.map((board) =>
        updateBoardTimestamp({
          ...board,
          labels: board.labels.filter((label) => label.id !== labelId),
          columns: board.columns.map((column) => ({
            ...column,
            tasks: column.tasks.map((task) => ({
              ...task,
              labels: task.labels.filter((label) => label.id !== labelId),
            })),
          })),
          updatedAt: currentTime,
        }),
      );

      // 現在のボードも更新
      const updatedCurrentBoard = state.currentBoard
        ? updatedBoards.find((board) => board.id === state.currentBoard?.id) || null
        : null;

      return {
        ...state,
        boards: updatedBoards,
        currentBoard: updatedCurrentBoard,
      };
    }

    case "RESTORE_BOARD": {
      const restoredBoards = restoreBoardFromRecycleBin(state.boards, action.payload.boardId);

      // 復元されたボードを現在のボードに設定
      const restoredBoard = restoredBoards.find(board => board.id === action.payload.boardId);
      const newCurrentBoard = restoredBoard && restoredBoard.deletionState === "active"
        ? restoredBoard
        : state.currentBoard;

      if (newCurrentBoard && newCurrentBoard.id !== state.currentBoard?.id) {
        updateCurrentBoardId(newCurrentBoard.id);
      }

      return {
        ...state,
        boards: restoredBoards,
        currentBoard: newCurrentBoard,
      };
    }

    case "PERMANENTLY_DELETE_BOARD": {
      // 指定されたボードを完全に削除
      const updatedBoards = state.boards.filter(board => board.id !== action.payload.boardId);

      // 現在のボードが削除された場合は、最初のアクティブボードに変更
      let newCurrentBoard = state.currentBoard;
      if (state.currentBoard?.id === action.payload.boardId) {
        const activeBoards = getActiveBoards(updatedBoards);
        newCurrentBoard = activeBoards.length > 0 ? activeBoards[0]! : null;
        updateCurrentBoardId(newCurrentBoard?.id ?? null);
      }

      return {
        ...state,
        boards: updatedBoards,
        currentBoard: newCurrentBoard,
      };
    }

    case "EMPTY_BOARD_RECYCLE_BIN": {
      // 削除されたボードを完全に削除
      const activeBoards = getActiveBoards(state.boards);

      // 現在のボードが削除された場合は、最初のアクティブボードに変更
      const newCurrentBoard = activeBoards.length > 0 ? activeBoards[0]! : null;

      if (newCurrentBoard && newCurrentBoard.id !== state.currentBoard?.id) {
        updateCurrentBoardId(newCurrentBoard.id);
      } else if (!newCurrentBoard) {
        updateCurrentBoardId(null);
      }

      return {
        ...state,
        boards: activeBoards,
        currentBoard: newCurrentBoard,
      };
    }

    case "RESTORE_COLUMN": {
      const restoredBoards = restoreColumnFromRecycleBin(state.boards, action.payload.columnId);

      // 現在のボードを更新
      const updatedCurrentBoard = state.currentBoard
        ? restoredBoards.find(board => board.id === state.currentBoard?.id) || null
        : null;

      return {
        ...state,
        boards: restoredBoards,
        currentBoard: updatedCurrentBoard,
      };
    }

    case "PERMANENTLY_DELETE_COLUMN": {
      const { updatedBoards } = permanentlyDeleteColumn(state.boards, action.payload.columnId);

      // 現在のボードを更新
      const updatedCurrentBoard = state.currentBoard
        ? updatedBoards.find(board => board.id === state.currentBoard?.id) || null
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

interface BoardProviderProps {
  children: ReactNode;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const notify = useSonnerNotify();
  const [state, dispatch] = useReducer(boardReducer, {
    boards: [],
    currentBoard: null,
  });

  // 現在のボードを取得
  const currentBoard = useMemo(() => state.currentBoard, [state.currentBoard]);

  // ボードデータの初期化
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const boardsData = loadBoards();
        dispatch({ type: "LOAD_BOARDS", payload: boardsData });
      } catch (error) {
        logger.error("Failed to load boards:", error);
        notify.error("ボードデータの読み込みに失敗しました");
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 依存配列からnotifyを削除（初期化は1回のみ）

  // ボード変更時の自動保存
  useEffect(() => {
    if (state.boards.length > 0) {
      try {
        saveBoards(state.boards);
      } catch (error) {
        logger.error("Failed to save boards:", error);
        notify.error("ボードデータの保存に失敗しました");
      }
    }
  }, [state.boards, notify]);

  // アクション関数群の定義
  const createBoard = useCallback(
    (title: string) => {
      dispatch({ type: "CREATE_BOARD", payload: { title } });
      notify.success("新しいボードを作成しました");
    },
    [notify],
  );

  const setCurrentBoard = useCallback(
    (boardId: string) => {
      dispatch({ type: "SET_CURRENT_BOARD", payload: boardId });
    },
    [],
  );

  const updateBoard = useCallback(
    (boardId: string, updates: Partial<KanbanBoard>) => {
      dispatch({ type: "UPDATE_BOARD", payload: { boardId, updates } });
    },
    [],
  );

  const deleteBoard = useCallback(
    (boardId: string) => {
      dispatch({ type: "DELETE_BOARD", payload: { boardId } });
      notify.success("ボードをごみ箱に移動しました");
    },
    [notify],
  );

  const restoreBoard = useCallback(
    (boardId: string) => {
      dispatch({ type: "RESTORE_BOARD", payload: { boardId } });
      notify.success("ボードを復元しました");
    },
    [notify],
  );

  const permanentlyDeleteBoard = useCallback(
    (boardId: string) => {
      dispatch({ type: "PERMANENTLY_DELETE_BOARD", payload: { boardId } });
      notify.success("ボードを完全に削除しました");
    },
    [notify],
  );

  const emptyBoardRecycleBin = useCallback(() => {
    dispatch({ type: "EMPTY_BOARD_RECYCLE_BIN" });
    notify.success("ボードのごみ箱を空にしました");
  }, [notify]);

  const createColumn = useCallback(
    (title: string, insertIndex?: number) => {
      if (!currentBoard) {
        notify.error("ボードが選択されていません");
        return;
      }
      dispatch({
        type: "CREATE_COLUMN",
        payload: { boardId: currentBoard.id, title, insertIndex },
      });
      notify.success("新しいカラムを作成しました");
    },
    [currentBoard, notify],
  );

  const deleteColumn = useCallback(
    (columnId: string) => {
      dispatch({ type: "DELETE_COLUMN", payload: { columnId } });
      notify.success("カラムをごみ箱に移動しました");
    },
    [notify],
  );

  const restoreColumn = useCallback(
    (columnId: string) => {
      dispatch({ type: "RESTORE_COLUMN", payload: { columnId } });
      notify.success("カラムを復元しました");
    },
    [notify],
  );

  const permanentlyDeleteColumn = useCallback(
    (columnId: string) => {
      dispatch({ type: "PERMANENTLY_DELETE_COLUMN", payload: { columnId } });
      notify.success("カラムを完全に削除しました");
    },
    [notify],
  );

  const updateColumn = useCallback(
    (columnId: string, updates: Partial<Column>) => {
      dispatch({ type: "UPDATE_COLUMN", payload: { columnId, updates } });
    },
    [],
  );

  const moveColumn = useCallback(
    (columnId: string, direction: "left" | "right") => {
      dispatch({ type: "MOVE_COLUMN", payload: { columnId, direction } });
    },
    [],
  );

  const importBoards = useCallback(
    (boards: KanbanBoard[], replaceAll = false) => {
      dispatch({ type: "IMPORT_BOARDS", payload: { boards, replaceAll } });
      const message = replaceAll
        ? "ボードデータを置き換えました"
        : "ボードデータをインポートしました";
      notify.success(message);
    },
    [notify],
  );

  const reorderBoards = useCallback((boards: KanbanBoard[]) => {
    dispatch({ type: "REORDER_BOARDS", payload: { boards } });
  }, []);

  const moveTaskToBoard = useCallback(
    (
      taskId: string,
      sourceBoardId: string,
      sourceColumnId: string,
      targetBoardId: string,
      targetColumnId?: string,
    ) => {
      dispatch({
        type: "MOVE_TASK_TO_BOARD",
        payload: {
          taskId,
          sourceBoardId,
          sourceColumnId,
          targetBoardId,
          targetColumnId,
        },
      });
      notify.success("タスクを他のボードに移動しました");
    },
    [notify],
  );

  const contextValue = useMemo(
    () => ({
      state,
      currentBoard,
      dispatch,
      createBoard,
      setCurrentBoard,
      updateBoard,
      deleteBoard,
      restoreBoard,
      permanentlyDeleteBoard,
      emptyBoardRecycleBin,
      createColumn,
      deleteColumn,
      restoreColumn,
      permanentlyDeleteColumn,
      updateColumn,
      moveColumn,
      importBoards,
      reorderBoards,
      moveTaskToBoard,
    }),
    [
      state,
      currentBoard,
      createBoard,
      setCurrentBoard,
      updateBoard,
      deleteBoard,
      restoreBoard,
      permanentlyDeleteBoard,
      emptyBoardRecycleBin,
      createColumn,
      deleteColumn,
      restoreColumn,
      permanentlyDeleteColumn,
      updateColumn,
      moveColumn,
      importBoards,
      reorderBoards,
      moveTaskToBoard,
    ],
  );

  return (
    <BoardContext.Provider value={contextValue}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = (): BoardContextType => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
};