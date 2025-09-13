import { useState, useEffect, useCallback, useMemo } from 'react';

import type { Task, Label } from '../types';

interface UseTaskDetailEditResult {
  isEditing: boolean;
  editTitle: string;
  editDescription: string;
  editDueDate: string;
  editLabels: Label[];
  setEditTitle: (value: string) => void;
  setEditDescription: (value: string) => void;
  setEditDueDate: (value: string) => void;
  setEditLabels: (labels: Label[]) => void;
  handleEdit: () => void;
  handleCancelEdit: () => void;
  canSave: boolean;
}

export const useTaskDetailEdit = (task: Task | null): UseTaskDetailEditResult => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editLabels, setEditLabels] = useState<Label[]>([]);

  // フォームをタスクデータでリセットするヘルパー関数
  const resetFormToTask = useCallback(() => {
    if (!task) {return;}
    
    setEditTitle(task.title);
    setEditDescription(task.description ?? '');
    const editDueDateValue = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
    setEditDueDate(editDueDateValue as string);
    setEditLabels(task.labels ?? []);
  }, [task]);

  // タスクが変更された時にフォームをリセット
  useEffect(() => {
    if (task) {
      resetFormToTask();
      setIsEditing(false);
    }
  }, [task, resetFormToTask]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    resetFormToTask();
    setIsEditing(false);
  }, [resetFormToTask]);

  // 保存可能かどうかの判定をメモ化
  const canSave = useMemo(() => Boolean(editTitle.trim()), [editTitle]);

  return {
    isEditing,
    editTitle,
    editDescription,
    editDueDate,
    editLabels,
    setEditTitle,
    setEditDescription,
    setEditDueDate,
    setEditLabels,
    handleEdit,
    handleCancelEdit,
    canSave,
  };
};