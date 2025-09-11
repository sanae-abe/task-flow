import { useState, useCallback, useMemo } from 'react';
import type { Task } from '../types';
import { useKanban } from '../contexts/KanbanContext';

interface UseTaskCardReturn {
  showEditDialog: boolean;
  showDeleteConfirm: boolean;
  handleEdit: () => void;
  handleSave: (updatedTask: Task) => void;
  handleCancel: () => void;
  handleDelete: () => void;
  handleConfirmDelete: () => void;
  handleDeleteFromDialog: (taskId: string) => void;
  handleCancelDelete: () => void;
  handleComplete: () => void;
  isOverdue: () => boolean;
  isDueToday: () => boolean;
  isDueTomorrow: () => boolean;
  formatDueDate: (date: Date) => string;
  isRightmostColumn: boolean;
}

export const useTaskCard = (task: Task, columnId: string): UseTaskCardReturn => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { updateTask, deleteTask, moveTask, state } = useKanban();

  const handleEdit = useCallback(() => {
    setShowEditDialog(true);
  }, []);

  const handleSave = useCallback((updatedTask: Task) => {
    updateTask(task.id, updatedTask);
    setShowEditDialog(false);
  }, [task.id, updateTask]);

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

  const handleDeleteFromDialog = useCallback((taskId: string) => {
    deleteTask(taskId, columnId);
    setShowEditDialog(false);
  }, [columnId, deleteTask]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const handleComplete = useCallback(() => {
    if (!state.currentBoard) {
      return;
    }
    
    // 現在のカラムのインデックスを取得
    const currentColumnIndex = state.currentBoard.columns.findIndex(col => col.id === columnId);
    
    if (currentColumnIndex === -1) {
      return;
    }
    
    // 右端のカラムかどうかを判定
    const isAtRightmostColumn = currentColumnIndex === state.currentBoard.columns.length - 1;
    
    if (isAtRightmostColumn) {
      // 右端のカラムにある場合は、1つ左のカラムに移動
      if (currentColumnIndex > 0) {
        const previousColumn = state.currentBoard.columns[currentColumnIndex - 1];
        if (previousColumn) {
          moveTask(task.id, columnId, previousColumn.id, previousColumn.tasks.length);
        }
      }
    } else {
      // 右端以外のカラムにある場合は、右端のカラムに移動
      const rightmostColumn = state.currentBoard.columns[state.currentBoard.columns.length - 1];
      if (rightmostColumn) {
        moveTask(task.id, columnId, rightmostColumn.id, rightmostColumn.tasks.length);
      }
    }
  }, [task.id, columnId, moveTask, state.currentBoard]);

  const isOverdue = useCallback(() => {
    if (!task.dueDate) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }, [task.dueDate]);

  const isDueToday = useCallback(() => {
    if (!task.dueDate) {
      return false;
    }
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  }, [task.dueDate]);

  const isDueTomorrow = useCallback(() => {
    if (!task.dueDate) {
      return false;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = new Date(task.dueDate);
    tomorrow.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === tomorrow.getTime();
  }, [task.dueDate]);

  const formatDueDate = useCallback((date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const isRightmostColumn = useMemo(() => {
    if (!state.currentBoard) {
      return false;
    }
    const rightmostColumnId = state.currentBoard.columns[state.currentBoard.columns.length - 1]?.id;
    return columnId === rightmostColumnId;
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
    formatDueDate,
    isRightmostColumn
  };
};