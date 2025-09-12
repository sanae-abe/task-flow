import { useState, useEffect, useCallback, useMemo } from 'react';

import type { Task, Label, FileAttachment } from '../types';

interface UseTaskEditProps {
  task: Task | null;
  isOpen: boolean;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  onCancel: () => void;
}

interface UseTaskEditReturn {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  labels: Label[];
  setLabels: (labels: Label[]) => void;
  attachments: FileAttachment[];
  setAttachments: (attachments: FileAttachment[]) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  handleSave: () => void;
  handleDelete: () => void;
  handleConfirmDelete: () => void;
  handleKeyPress: (event: React.KeyboardEvent) => void;
  isValid: boolean;
}

export const useTaskEdit = ({
  task,
  isOpen,
  onSave,
  onDelete,
  onCancel
}: UseTaskEditProps): UseTaskEditReturn => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      const dateValue = task.dueDate ? task.dueDate.toISOString().split('T')[0] : '';
      setDueDate(dateValue ?? '');
      setLabels(task.labels ?? []);
      setAttachments(task.attachments ?? []);
    }
  }, [isOpen, task]);

  const handleSave = useCallback(() => {
    if (task && title.trim()) {
      const dueDateObj = dueDate ? new Date(dueDate) : undefined;
      const updatedTask: Task = {
        ...task,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDateObj,
        labels,
        attachments,
        updatedAt: new Date()
      };
      onSave(updatedTask);
    }
  }, [task, title, description, dueDate, labels, attachments, onSave]);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (task) {
      onDelete(task.id);
    }
    setShowDeleteConfirm(false);
  }, [task, onDelete]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCancel();
    }
  }, [onCancel]);

  const isValid = useMemo(() => title.trim().length > 0, [title]);

  return {
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    labels,
    setLabels,
    attachments,
    setAttachments,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSave,
    handleDelete,
    handleConfirmDelete,
    handleKeyPress,
    isValid
  };
};