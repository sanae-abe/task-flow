import { useState, useEffect, useCallback, useMemo } from 'react';

import { useKanban } from '../contexts/KanbanContext';
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
  completedAt: string;
  setCompletedAt: (value: string) => void;
  isCompleted: boolean;
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
  const { state } = useKanban();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [completedAt, setCompletedAt] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      const dateValue = task.dueDate ? task.dueDate.toISOString().split('T')[0] : '';
      setDueDate(dateValue ?? '');
      
      // completedAtをdatetime-local形式（YYYY-MM-DDTHH:mm）にフォーマット
      const completedAtValue = task.completedAt 
        ? new Date(task.completedAt).toISOString().slice(0, 16)
        : '';
      setCompletedAt(completedAtValue);
      
      setLabels(task.labels ?? []);
      setAttachments(task.attachments ?? []);
    } else if (!isOpen) {
      // ダイアログが閉じられた時にフォームをリセット
      setTitle('');
      setDescription('');
      setDueDate('');
      setCompletedAt('');
      setLabels([]);
      setAttachments([]);
    }
  }, [isOpen, task]);

  const handleSave = useCallback(() => {
    if (task && title.trim()) {
      const dueDateObj = dueDate ? new Date(dueDate) : undefined;
      const completedAtObj = completedAt ? new Date(completedAt) : undefined;
      
      const updatedTask: Task = {
        ...task,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDateObj,
        completedAt: completedAtObj,
        labels,
        attachments,
        updatedAt: new Date()
      };
      
      onSave(updatedTask);
    }
  }, [task, title, description, dueDate, completedAt, labels, attachments, onSave]);

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

  // タスクが完了状態（一番右のカラム）にあるかどうかを判定
  const isCompleted = useMemo(() => {
    if (!task || !state.currentBoard?.columns.length) {
      return false;
    }
    
    const rightmostColumn = state.currentBoard.columns[state.currentBoard.columns.length - 1];
    if (!rightmostColumn) {
      return false;
    }
    
    return rightmostColumn.tasks.some(t => t.id === task.id);
  }, [task, state.currentBoard]);

  return {
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    completedAt,
    setCompletedAt,
    isCompleted,
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