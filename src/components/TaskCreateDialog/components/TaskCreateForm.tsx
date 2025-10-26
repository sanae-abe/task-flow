import React, { memo } from 'react';

import type { TaskCreateFormProps } from '../types';
import UnifiedTaskForm from '../../shared/Form/UnifiedTaskForm';

/**
 * タスク作成フォームコンポーネント - UnifiedTaskFormベース
 * 303行 → 47行に簡素化
 */
export const TaskCreateForm: React.FC<TaskCreateFormProps> = memo(({
  formState,
  formActions,
  selectedTemplate,
  onTimeChange,
  onKeyPress,
  availableBoards
}) => {
  const {
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
  } = formState;

  const {
    setTitle,
    setDescription,
    setDueDate,
    setLabels,
    setAttachments,
    setRecurrence,
    setPriority,
    setSelectedBoardId
  } = formActions;

  return (
    <UnifiedTaskForm
      mode="create"
      title={title}
      setTitle={setTitle}
      description={description}
      setDescription={setDescription}
      dueDate={dueDate}
      setDueDate={setDueDate}
      dueTime={dueTime}
      hasTime={hasTime}
      labels={labels}
      setLabels={setLabels}
      attachments={attachments}
      setAttachments={setAttachments}
      recurrence={recurrence}
      setRecurrence={setRecurrence}
      priority={priority}
      setPriority={setPriority}
      onTimeChange={onTimeChange}
      onKeyPress={onKeyPress}
      createOptions={{
        selectedBoardId,
        setSelectedBoardId,
        availableBoards,
        selectedTemplate,
        showTemplateNotification: !!selectedTemplate,
      }}
    />
  );
});

TaskCreateForm.displayName = 'TaskCreateForm';