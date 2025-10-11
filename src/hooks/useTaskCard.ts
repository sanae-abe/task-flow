import { useState, useCallback, useMemo } from "react";

import { useKanban } from "../contexts/KanbanContext";
import type { Task } from "../types";

// 日付を正規化するヘルパー関数
const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

interface UseTaskCardReturn {
  showEditDialog: boolean;
  showDeleteConfirm: boolean;
  handleEdit: () => void;
  handleSave: (updatedTask: Task, targetColumnId?: string) => void;
  handleCancel: () => void;
  handleDelete: () => void;
  handleConfirmDelete: () => void;
  handleDeleteFromDialog: (taskId: string) => void;
  handleCancelDelete: () => void;
  handleComplete: () => void;
  isOverdue: () => boolean;
  isDueToday: () => boolean;
  isDueTomorrow: () => boolean;
  isRightmostColumn: boolean;
}

export const useTaskCard = (
  task: Task,
  columnId: string,
): UseTaskCardReturn => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { updateTask, deleteTask, moveTask, state } = useKanban();

  const handleEdit = useCallback(() => {
    setShowEditDialog(true);
  }, []);

  const handleSave = useCallback(
    (updatedTask: Task, targetColumnId?: string) => {
      updateTask(task.id, updatedTask);

      // カラム移動が必要な場合
      if (targetColumnId && targetColumnId !== columnId) {
        const targetColumn = state.currentBoard?.columns.find(
          (col) => col.id === targetColumnId,
        );
        if (targetColumn) {
          moveTask(
            task.id,
            columnId,
            targetColumnId,
            targetColumn.tasks.length,
          );
        }
      }

      setShowEditDialog(false);
    },
    [task.id, columnId, updateTask, moveTask, state.currentBoard],
  );

  const handleCancel = useCallback(() => {
    setShowEditDialog(false);
  }, []);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    deleteTask(task.id, columnId);
    setShowDeleteConfirm(false);
    setShowEditDialog(false);
  }, [task.id, columnId, deleteTask]);

  const handleDeleteFromDialog = useCallback(
    (taskId: string) => {
      deleteTask(taskId, columnId);
      setShowEditDialog(false);
    },
    [columnId, deleteTask],
  );

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const handleComplete = useCallback(() => {
    if (!state.currentBoard?.columns.length) {
      return;
    }

    const { columns } = state.currentBoard;
    const currentIndex = columns.findIndex((col) => col.id === columnId);

    if (currentIndex === -1) {
      return;
    }

    const isLastColumn = currentIndex === columns.length - 1;
    const targetColumn = isLastColumn
      ? columns[currentIndex - 1] // 左に戻る
      : columns[columns.length - 1]; // 最後のカラムに移動

    if (targetColumn) {
      // 完了カラムの一番上に配置
      moveTask(task.id, columnId, targetColumn.id, 0);
    }
  }, [task.id, columnId, moveTask, state.currentBoard]);

  // 日付関連の計算をメモ化
  const dateComparisons = useMemo(() => {
    if (!task.dueDate) {
      return {
        isOverdue: false,
        isDueToday: false,
        isDueTomorrow: false,
      };
    }

    const today = normalizeDate(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = normalizeDate(new Date(task.dueDate));

    return {
      isOverdue: dueDate < today,
      isDueToday: dueDate.getTime() === today.getTime(),
      isDueTomorrow: dueDate.getTime() === tomorrow.getTime(),
    };
  }, [task.dueDate]);

  const isOverdue = () => dateComparisons.isOverdue;
  const isDueToday = () => dateComparisons.isDueToday;
  const isDueTomorrow = () => dateComparisons.isDueTomorrow;

  const isRightmostColumn = useMemo(() => {
    if (!state.currentBoard?.columns.length) {
      return false;
    }
    const rightmostColumn =
      state.currentBoard.columns[state.currentBoard.columns.length - 1];
    return rightmostColumn ? columnId === rightmostColumn.id : false;
  }, [columnId, state.currentBoard]);

  return {
    showEditDialog,
    showDeleteConfirm,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleConfirmDelete,
    handleDeleteFromDialog,
    handleCancelDelete,
    handleComplete,
    isOverdue,
    isDueToday,
    isDueTomorrow,
    isRightmostColumn,
  };
};
