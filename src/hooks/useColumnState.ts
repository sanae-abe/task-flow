import { useState, useEffect, useCallback } from 'react';
import type { Column, Label } from '../types';
import { useKanban } from '../contexts/KanbanContext';

interface UseColumnStateReturn {
  isAddingTask: boolean;
  setIsAddingTask: (value: boolean) => void;
  isEditingTitle: boolean;
  editingTitle: string;
  setEditingTitle: (title: string) => void;
  handleTitleEdit: () => void;
  handleTitleSave: () => void;
  handleTitleCancel: () => void;
  handleDeleteColumn: () => void;
  handleAddTask: (title: string, description: string, dueDate?: Date, labels?: Label[]) => void;
  handleCancelTask: () => void;
}

export const useColumnState = (column: Column): UseColumnStateReturn => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(column.title);
  const { createTask, updateColumn, deleteColumn } = useKanban();

  useEffect(() => {
    setEditingTitle(column.title);
  }, [column.title]);

  const handleTitleEdit = useCallback(() => {
    console.log('useColumnState: handleTitleEdit called for column:', column.title);
    setIsEditingTitle(true);
    setEditingTitle(column.title);
  }, [column.title]);

  const handleTitleSave = useCallback(() => {
    const trimmedTitle = editingTitle.trim();
    if (trimmedTitle && trimmedTitle !== column.title) {
      updateColumn(column.id, { title: trimmedTitle });
    } else if (!trimmedTitle) {
      setEditingTitle(column.title);
    }
    setIsEditingTitle(false);
  }, [editingTitle, column.title, column.id, updateColumn]);

  const handleTitleCancel = useCallback(() => {
    setEditingTitle(column.title);
    setIsEditingTitle(false);
  }, [column.title]);

  const handleDeleteColumn = useCallback(() => {
    if (window.confirm(`「${column.title}」カラムを削除しますか？このカラム内のすべてのタスクも削除されます。`)) {
      deleteColumn(column.id);
    }
  }, [column.title, column.id, deleteColumn]);

  const handleAddTask = useCallback((title: string, description: string, dueDate?: Date, labels?: Label[]) => {
    if (title.trim()) {
      createTask(column.id, title.trim(), description.trim(), dueDate, labels);
      setIsAddingTask(false);
    }
  }, [column.id, createTask]);

  const handleCancelTask = useCallback(() => {
    setIsAddingTask(false);
  }, []);

  return {
    isAddingTask,
    setIsAddingTask,
    isEditingTitle,
    editingTitle,
    setEditingTitle,
    handleTitleEdit,
    handleTitleSave,
    handleTitleCancel,
    handleDeleteColumn,
    handleAddTask,
    handleCancelTask
  };
};