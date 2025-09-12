import React, { memo, useMemo } from 'react';

import type { Label, FileAttachment } from '../types';

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
      attachments
    },
    {
      setTitle,
      setDescription,
      setDueDate,
      setCompletedAt,
      setLabels,
      setAttachments
    },
    {
      isCompleted,
      showLabels: true,
      showAttachments: true,
      onKeyPress
    }
  ), [
    title, description, dueDate, completedAt, labels, attachments,
    setTitle, setDescription, setDueDate, setCompletedAt, setLabels, setAttachments,
    isCompleted, onKeyPress
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
    attachments
  }), [title, description, dueDate, completedAt, labels, attachments]);

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