import React, { memo, useMemo } from 'react';

import type { Label, FileAttachment, RecurrenceConfig } from '../types';

import { UnifiedForm, createTaskFormFields } from './shared/Form';

interface TaskEditFormProps {
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
  recurrence: RecurrenceConfig;
  setRecurrence: (recurrence: RecurrenceConfig) => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
}

const TaskEditForm = memo<TaskEditFormProps>(({
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
  recurrence,
  setRecurrence,
  onKeyPress
}) => {
  // フォームフィールド設定を生成
  const formFields = useMemo(() => createTaskFormFields(
    {
      title,
      description,
      dueDate,
      completedAt,
      labels,
      attachments,
      columnId,
      recurrence
    },
    {
      setTitle,
      setDescription,
      setDueDate,
      setCompletedAt,
      setLabels,
      setAttachments,
      setColumnId,
      setRecurrence
    },
    {
      isCompleted,
      showLabels: true,
      showAttachments: true,
      showStatus: true,
      showRecurrence: true,
      statusOptions,
      onKeyPress
    }
  ), [
    title, description, dueDate, completedAt, labels, attachments, columnId, recurrence,
    setTitle, setDescription, setDueDate, setCompletedAt, setLabels, setAttachments, setColumnId, setRecurrence,
    isCompleted, statusOptions, onKeyPress
  ]);

  // 統合フォームではonSubmitは不要（親コンポーネントで管理）
  const handleSubmit = () => {
    // 空実装：親コンポーネントで送信処理を管理
  };

  // 初期値を明示的に設定
  const initialValues = useMemo(() => ({
    title,
    description,
    dueDate,
    completedAt,
    labels,
    attachments,
    columnId,
    recurrence
  }), [title, description, dueDate, completedAt, labels, attachments, columnId, recurrence]);

  return (
    <UnifiedForm
      fields={formFields}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      showCancelButton={false}
      validateOnChange
      validateOnBlur
    />
  );
});

export default TaskEditForm;