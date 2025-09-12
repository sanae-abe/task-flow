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
  columnId: string;
  setColumnId: (value: string) => void;
  statusOptions: Array<{ value: string; label: string }>;
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
  const { state, moveTask } = useKanban();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [completedAt, setCompletedAt] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [columnId, setColumnId] = useState('');
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
      
      // 現在のタスクがどのカラムにあるかを特定
      const currentColumn = state.currentBoard?.columns.find(column =>
        column.tasks.some(t => t.id === task.id)
      );
      setColumnId(currentColumn?.id ?? '');
    } else if (!isOpen) {
      // ダイアログが閉じられた時にフォームをリセット
      setTitle('');
      setDescription('');
      setDueDate('');
      setCompletedAt('');
      setLabels([]);
      setAttachments([]);
      setColumnId('');
    }
  }, [isOpen, task, state.currentBoard]);

  // ステータス変更時の完了日時の自動更新
  useEffect(() => {
    if (state.currentBoard?.columns && columnId) {
      const targetColumn = state.currentBoard.columns.find(col => col.id === columnId);
      const isLastColumn = targetColumn && 
        state.currentBoard.columns.indexOf(targetColumn) === state.currentBoard.columns.length - 1;
      
      // 完了カラムに移動した場合で、現在完了日時が空の場合
      if (isLastColumn && !completedAt) {
        const now = new Date().toISOString().slice(0, 16);
        setCompletedAt(now);
      }
      // 完了カラム以外に移動した場合で、完了日時が設定されている場合
      else if (!isLastColumn && completedAt) {
        setCompletedAt('');
      }
    }
  }, [columnId, state.currentBoard, completedAt]);

  const handleSave = useCallback(() => {
    if (task && title.trim()) {
      const dueDateObj = dueDate ? new Date(dueDate) : undefined;
      let completedAtObj = completedAt ? new Date(completedAt) : undefined;
      
      // カラムの変更があった場合は移動処理を実行
      const currentColumn = state.currentBoard?.columns.find(column =>
        column.tasks.some(t => t.id === task.id)
      );
      
      if (currentColumn && columnId && currentColumn.id !== columnId) {
        // 最後のカラム（完了カラム）への移動かどうかを判定
        const targetColumn = state.currentBoard?.columns.find(col => col.id === columnId);
        const isLastColumn = state.currentBoard?.columns && 
          targetColumn && 
          state.currentBoard.columns.indexOf(targetColumn) === state.currentBoard.columns.length - 1;
        
        // 完了カラムに移動する場合は完了日時を現在時刻に設定
        if (isLastColumn && !task.completedAt) {
          completedAtObj = new Date();
        }
        // 完了カラムから他のカラムに移動する場合は完了日時をクリア
        else if (!isLastColumn && task.completedAt) {
          completedAtObj = undefined;
        }
        
        // タスクを移動
        moveTask(task.id, currentColumn.id, columnId, 0);
      }
      
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
  }, [task, title, description, dueDate, completedAt, labels, attachments, columnId, state.currentBoard, moveTask, onSave]);

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

  // ステータス選択肢を生成
  const statusOptions = useMemo(() => {
    if (!state.currentBoard?.columns.length) {
      return [];
    }
    
    return state.currentBoard.columns.map(column => ({
      value: column.id,
      label: column.title
    }));
  }, [state.currentBoard]);

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
    columnId,
    setColumnId,
    statusOptions,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSave,
    handleDelete,
    handleConfirmDelete,
    handleKeyPress,
    isValid
  };
};