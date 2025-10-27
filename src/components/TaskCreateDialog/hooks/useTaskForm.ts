import { useState, useCallback, useEffect } from 'react';
import type { TaskFormState, TaskFormActions } from '../types';
import type { Label as LabelType, FileAttachment, RecurrenceConfig, Priority } from '../../../types';

/**
 * タスクフォーム状態管理カスタムフック
 *
 * タスク作成フォームの全ての状態とアクションを管理します。
 * フォームのリセット機能も提供します。
 */
export const useTaskForm = (
  isDialogOpen: boolean,
  defaultDate?: string,
  currentBoardId?: string
) => {
  // フォーム状態
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [hasTime, setHasTime] = useState(false);
  const [labels, setLabels] = useState<LabelType[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [recurrence, setRecurrence] = useState<RecurrenceConfig | undefined>();
  const [priority, setPriority] = useState<Priority | undefined>();
  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>(currentBoardId);

  // ダイアログが開かれた時の初期化処理
  const [isDialogFirstOpen, setIsDialogFirstOpen] = useState(false);

  // フォームリセット
  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    if (!defaultDate) {
      setDueDate('');
    }
    setDueTime('');
    setHasTime(false);
    setLabels([]);
    setAttachments([]);
    setRecurrence(undefined);
    setPriority(undefined);
    setSelectedBoardId(currentBoardId);
  }, [defaultDate, currentBoardId]);

  // デフォルト日付が設定されている場合は期限日に設定
  useEffect(() => {
    if (defaultDate) {
      const defaultDateObj = new Date(defaultDate);
      const dateString = defaultDateObj.toISOString().split('T')[0]; // YYYY-MM-DD形式
      setDueDate(dateString || '');
    }
  }, [defaultDate]);

  // ダイアログが開かれた時の初期化処理
  useEffect(() => {
    if (isDialogOpen && !isDialogFirstOpen) {
      // ダイアログが新しく開かれた時のみフォームリセット
      resetForm();
      setIsDialogFirstOpen(true);
    } else if (!isDialogOpen) {
      // ダイアログが閉じられた時
      setIsDialogFirstOpen(false);
    }
  }, [isDialogOpen, defaultDate, isDialogFirstOpen, resetForm]);

  // 時刻変更ハンドラー
  const handleTimeChange = useCallback((newHasTime: boolean, newTime: string) => {
    setHasTime(newHasTime);
    setDueTime(newTime);
  }, []);

  // フォーム状態とアクション
  const formState: TaskFormState = {
    title,
    description,
    dueDate,
    dueTime,
    hasTime,
    labels,
    attachments,
    recurrence,
    priority,
    selectedBoardId
  };

  // DatePicker対応のラッパー関数
  const handleSetDueDate = useCallback((date: string | null) => {
    setDueDate(date || '');
  }, []);

  const formActions: TaskFormActions = {
    setTitle,
    setDescription,
    setDueDate: handleSetDueDate,
    setDueTime,
    setHasTime,
    setLabels,
    setAttachments,
    setRecurrence,
    setPriority,
    setSelectedBoardId,
    resetForm
  };

  // バリデーション
  const isFormValid = title.trim().length > 0;

  return {
    formState,
    formActions,
    handleTimeChange,
    isFormValid
  };
};