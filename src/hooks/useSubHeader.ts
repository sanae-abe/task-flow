import { useState, useMemo, useCallback } from 'react';

import { useKanban } from '../contexts/KanbanContext';

import { useTaskStats } from './useTaskStats';

type SubHeaderDialogState = {
  readonly isCreatingColumn: boolean;
  readonly showDeleteConfirm: boolean;
  readonly showEditDialog: boolean;
  readonly showClearCompletedConfirm: boolean;
};

type SubHeaderHandlers = {
  readonly startCreateColumn: () => void;
  readonly editBoardTitle: (newTitle: string) => void;
  readonly createColumn: (title: string) => void;
  readonly cancelCreateColumn: () => void;
  readonly deleteBoard: () => void;
  readonly clearCompletedTasks: () => void;
  readonly openEditDialog: () => void;
  readonly closeEditDialog: () => void;
  readonly openDeleteConfirm: () => void;
  readonly closeDeleteConfirm: () => void;
  readonly openClearCompletedConfirm: () => void;
  readonly closeClearCompletedConfirm: () => void;
};

type UseSubHeaderReturn = {
  readonly state: ReturnType<typeof useKanban>['state'];
  readonly dialogState: SubHeaderDialogState;
  readonly taskStats: ReturnType<typeof useTaskStats>;
  readonly hasCompletedTasks: boolean;
  readonly canDeleteBoard: boolean;
  readonly handlers: SubHeaderHandlers;
};

export const useSubHeader = (): UseSubHeaderReturn => {
  const { state, updateBoard, createColumn, deleteBoard, clearCompletedTasks } = useKanban();
  
  const [dialogState, setDialogState] = useState<SubHeaderDialogState>({
    isCreatingColumn: false,
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
      .flatMap(column => column.tasks);
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

  const canDeleteBoard = useMemo(() => state.boards.length > 1, [state.boards.length]);

  const updateDialogState = useCallback((updates: Partial<SubHeaderDialogState>): void => {
    setDialogState(prev => ({ ...prev, ...updates }));
  }, []);
  const handlers = useMemo((): SubHeaderHandlers => {
    const currentBoardId = state.currentBoard?.id;
    
    return {
      startCreateColumn: () => updateDialogState({ isCreatingColumn: true }),
      
      editBoardTitle: (newTitle: string) => {
        if (currentBoardId) {
          updateBoard(currentBoardId, { title: newTitle });
          updateDialogState({ showEditDialog: false });
        }
      },
      
      createColumn: (title: string) => {
        createColumn(title);
        updateDialogState({ isCreatingColumn: false });
      },
      
      cancelCreateColumn: () => updateDialogState({ isCreatingColumn: false }),
      
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
      openClearCompletedConfirm: () => updateDialogState({ showClearCompletedConfirm: true }),
      closeClearCompletedConfirm: () => updateDialogState({ showClearCompletedConfirm: false }),
    };
  }, [
    state.currentBoard?.id,
    canDeleteBoard,
    updateDialogState,
    updateBoard,
    createColumn,
    deleteBoard,
    clearCompletedTasks,
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