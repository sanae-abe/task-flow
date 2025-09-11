import { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditDueDate(task.dueDate?.toISOString().split('T')[0] || '');
      setEditLabels(task.labels || []);
      setIsEditing(false);
    }
  }, [task]);

  const handleCancelEdit = useCallback(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditDueDate(task.dueDate?.toISOString().split('T')[0] || '');
      setEditLabels(task.labels || []);
    }
    setIsEditing(false);
  }, [task]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const canSave = Boolean(editTitle.trim());

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