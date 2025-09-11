import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Task } from '../types';
import { useKanban } from '../contexts/KanbanContext';

interface UseTaskCardReturn {
  isEditing: boolean;
  editTitle: string;
  editDescription: string;
  editDueDate: string;
  showDeleteConfirm: boolean;
  setEditTitle: (title: string) => void;
  setEditDescription: (description: string) => void;
  setEditDueDate: (date: string) => void;
  handleEdit: () => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleDelete: () => void;
  handleConfirmDelete: () => void;
  handleCancelDelete: () => void;
  handleComplete: () => void;
  isOverdue: () => boolean;
  isDueToday: () => boolean;
  isDueTomorrow: () => boolean;
  formatDueDate: (date: Date) => string;
  isRightmostColumn: boolean;
}

export const useTaskCard = (task: Task, columnId: string): UseTaskCardReturn => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { updateTask, deleteTask, moveTask, state } = useKanban();

  useEffect(() => {
    const initialDueDate = (task.dueDate ? task.dueDate.toISOString().split('T')[0] : '') as string;
    setEditDueDate(initialDueDate);
  }, [task.dueDate]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(() => {
    const dueDate = editDueDate ? new Date(editDueDate) : undefined;
    updateTask(task.id, {
      title: editTitle,
      description: editDescription,
      dueDate,
      updatedAt: new Date(),
    });
    setIsEditing(false);
  }, [editTitle, editDescription, editDueDate, task.id, updateTask]);

  const handleCancel = useCallback(() => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    const dueDateValue = (task.dueDate ? task.dueDate.toISOString().split('T')[0] : '') as string;
    setEditDueDate(dueDateValue);
    setIsEditing(false);
  }, [task.title, task.description, task.dueDate]);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    deleteTask(task.id, columnId);
    setShowDeleteConfirm(false);
  }, [task.id, columnId, deleteTask]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const handleComplete = useCallback(() => {
    if (!state.currentBoard) {
      return;
    }
    
    // 一番右のカラム（最後のカラム）を取得
    const rightmostColumn = state.currentBoard.columns[state.currentBoard.columns.length - 1];
    
    if (!rightmostColumn || rightmostColumn.id === columnId) {
      // 既に一番右のカラムにある場合は何もしない
      return;
    }
    
    // 一番右のカラムに移動
    moveTask(task.id, columnId, rightmostColumn.id, rightmostColumn.tasks.length);
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
    isEditing,
    editTitle,
    editDescription,
    editDueDate,
    showDeleteConfirm,
    setEditTitle,
    setEditDescription,
    setEditDueDate,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleComplete,
    isOverdue,
    isDueToday,
    isDueTomorrow,
    formatDueDate,
    isRightmostColumn
  };
};