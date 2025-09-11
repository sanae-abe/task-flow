import { useState, useCallback } from 'react';
import type { Column, Label } from '../types';
import { useKanban } from '../contexts/KanbanContext';

interface UseColumnStateReturn {
  showCreateDialog: boolean;
  setShowCreateDialog: (value: boolean) => void;
  showEditDialog: boolean;
  showDeleteConfirm: boolean;
  handleTitleEdit: () => void;
  handleTitleSave: (newTitle: string) => void;
  handleTitleCancel: () => void;
  handleDeleteColumn: () => void;
  handleConfirmDeleteColumn: () => void;
  handleCancelDeleteColumn: () => void;
  handleAddTask: (title: string, description: string, dueDate?: Date, labels?: Label[]) => void;
  handleCancelCreateTask: () => void;
}

export const useColumnState = (column: Column): UseColumnStateReturn => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { createTask, updateColumn, deleteColumn } = useKanban();

  const handleTitleEdit = useCallback(() => {
    setShowEditDialog(true);
  }, []);

  const handleTitleSave = useCallback((newTitle: string) => {
    const trimmedTitle = newTitle.trim();
    if (trimmedTitle && trimmedTitle !== column.title) {
      updateColumn(column.id, { title: trimmedTitle });
    }
    setShowEditDialog(false);
  }, [column.title, column.id, updateColumn]);

  const handleTitleCancel = useCallback(() => {
    setShowEditDialog(false);
  }, []);

  const handleDeleteColumn = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDeleteColumn = useCallback(() => {
    deleteColumn(column.id);
    setShowDeleteConfirm(false);
  }, [column.id, deleteColumn]);

  const handleCancelDeleteColumn = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const handleAddTask = useCallback((title: string, description: string, dueDate?: Date, labels?: Label[]) => {
    if (title.trim()) {
      createTask(column.id, title.trim(), description.trim(), dueDate, labels);
      setShowCreateDialog(false);
    }
  }, [column.id, createTask]);

  const handleCancelCreateTask = useCallback(() => {
    setShowCreateDialog(false);
  }, []);

  return {
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    showDeleteConfirm,
    handleTitleEdit,
    handleTitleSave,
    handleTitleCancel,
    handleDeleteColumn,
    handleConfirmDeleteColumn,
    handleCancelDeleteColumn,
    handleAddTask,
    handleCancelCreateTask
  };
};