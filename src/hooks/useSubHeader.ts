import { useState, useMemo, useCallback } from "react";

import { useKanban } from "../contexts/KanbanContext";
import { useNotify } from "../contexts/NotificationContext";
import { exportData, exportBoard } from "../utils/dataExport";
import type { KanbanBoard } from "../types";

import { useTaskStats } from "./useTaskStats";

type SubHeaderDialogState = {
  readonly isCreatingColumn: boolean;
  readonly isCreatingBoard: boolean;
  readonly showDeleteConfirm: boolean;
  readonly showEditDialog: boolean;
  readonly showClearCompletedConfirm: boolean;
};

type SubHeaderHandlers = {
  readonly startCreateColumn: () => void;
  readonly startCreateBoard: () => void;
  readonly editBoardTitle: (title: string) => void;
  readonly createColumn: (title: string, insertIndex?: number) => void;
  readonly createBoard: (title: string) => void;
  readonly cancelCreateColumn: () => void;
  readonly cancelCreateBoard: () => void;
  readonly deleteBoard: () => void;
  readonly clearCompletedTasks: () => void;
  readonly openEditDialog: () => void;
  readonly closeEditDialog: () => void;
  readonly openDeleteConfirm: () => void;
  readonly closeDeleteConfirm: () => void;
  readonly openClearCompletedConfirm: () => void;
  readonly closeClearCompletedConfirm: () => void;
  readonly exportAllData: () => void;
  readonly exportCurrentBoard: (board?: KanbanBoard) => void;
};

type UseSubHeaderReturn = {
  readonly state: ReturnType<typeof useKanban>["state"];
  readonly dialogState: SubHeaderDialogState;
  readonly taskStats: ReturnType<typeof useTaskStats>;
  readonly hasCompletedTasks: boolean;
  readonly canDeleteBoard: boolean;
  readonly handlers: SubHeaderHandlers;
};

export const useSubHeader = (): UseSubHeaderReturn => {
  const {
    state,
    updateBoard,
    createColumn,
    createBoard,
    deleteBoard,
    clearCompletedTasks,
  } = useKanban();
  const notify = useNotify();

  const [dialogState, setDialogState] = useState<SubHeaderDialogState>({
    isCreatingColumn: false,
    isCreatingBoard: false,
    showDeleteConfirm: false,
    showEditDialog: false,
    showClearCompletedConfirm: false,
  });

  const allTasks = useMemo(() => {
    if (!state.currentBoard?.columns.length) {
      return [];
    }
    return state.currentBoard.columns
      .slice(0, -1)
      .flatMap((column) => column.tasks);
  }, [state.currentBoard?.columns]);

  const taskStats = useTaskStats(allTasks);

  const hasCompletedTasks = useMemo(() => {
    const columns = state.currentBoard?.columns;
    if (!columns?.length) {
      return false;
    }

    const rightmostColumn = columns[columns.length - 1];
    return (rightmostColumn?.tasks?.length ?? 0) > 0;
  }, [state.currentBoard?.columns]);

  const canDeleteBoard = useMemo(
    () => {
      const activeBoards = state.boards.filter(board => board.deletionState !== "deleted");
      return activeBoards.length > 1;
    },
    [state.boards],
  );

  const updateDialogState = useCallback(
    (updates: Partial<SubHeaderDialogState>): void => {
      setDialogState((prev) => ({ ...prev, ...updates }));
    },
    [],
  );
  const handlers = useMemo((): SubHeaderHandlers => {
    const currentBoardId = state.currentBoard?.id;

    return {
      startCreateColumn: () => updateDialogState({ isCreatingColumn: true }),
      startCreateBoard: () => updateDialogState({ isCreatingBoard: true }),

      editBoardTitle: (newTitle: string) => {
        if (currentBoardId) {
          updateBoard(currentBoardId, { title: newTitle });
          updateDialogState({ showEditDialog: false });
        }
      },

      createColumn: (title: string, insertIndex?: number) => {
        createColumn(title, insertIndex);
        updateDialogState({ isCreatingColumn: false });
      },

      createBoard: (title: string) => {
        createBoard(title);
        updateDialogState({ isCreatingBoard: false });
      },

      cancelCreateColumn: () => updateDialogState({ isCreatingColumn: false }),
      cancelCreateBoard: () => updateDialogState({ isCreatingBoard: false }),

      deleteBoard: () => {
        if (currentBoardId && canDeleteBoard) {
          deleteBoard(currentBoardId);
          updateDialogState({ showDeleteConfirm: false });
        }
      },

      clearCompletedTasks: () => {
        clearCompletedTasks();
        updateDialogState({ showClearCompletedConfirm: false });
      },

      openEditDialog: () => updateDialogState({ showEditDialog: true }),
      closeEditDialog: () => updateDialogState({ showEditDialog: false }),
      openDeleteConfirm: () => updateDialogState({ showDeleteConfirm: true }),
      closeDeleteConfirm: () => updateDialogState({ showDeleteConfirm: false }),
      openClearCompletedConfirm: () =>
        updateDialogState({ showClearCompletedConfirm: true }),
      closeClearCompletedConfirm: () =>
        updateDialogState({ showClearCompletedConfirm: false }),

      exportAllData: () => {
        exportData(state.boards);
      },

      exportCurrentBoard: (board?: KanbanBoard) => {
        // ボードが指定されている場合はそのボードを、指定されていない場合は現在のボードをエクスポート
        const targetBoard = board || state.currentBoard;
        if (targetBoard) {
          exportBoard(targetBoard);
        } else {
          notify.error("エクスポートするボードが選択されていません");
        }
      },
    };
  }, [
    state.boards,
    state.currentBoard,
    canDeleteBoard,
    updateDialogState,
    updateBoard,
    createColumn,
    createBoard,
    deleteBoard,
    clearCompletedTasks,
    notify,
  ]);

  return {
    state,
    dialogState,
    taskStats,
    hasCompletedTasks,
    canDeleteBoard,
    handlers,
  };
};
