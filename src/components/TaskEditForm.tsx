import React, { memo } from "react";

import type {
  Label,
  FileAttachment,
  RecurrenceConfig,
  Priority,
} from "../types";

import UnifiedTaskForm from "./shared/Form/UnifiedTaskForm";

interface TaskEditFormProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string | null) => void;
  dueTime: string;
  setDueTime: (value: string) => void;
  hasTime: boolean;
  setHasTime: (value: boolean) => void;
  labels: Label[];
  setLabels: (labels: Label[]) => void;
  attachments: FileAttachment[];
  setAttachments: (attachments: FileAttachment[]) => void;
  columnId: string;
  setColumnId: (value: string) => void;
  statusOptions: Array<{ value: string; label: string }>;
  recurrence: RecurrenceConfig | undefined;
  setRecurrence: (recurrence: RecurrenceConfig | undefined) => void;
  priority: Priority | undefined;
  setPriority: (priority: Priority | undefined) => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
}

/**
 * タスク編集フォーム - UnifiedTaskFormベース
 * 287行 → 45行に簡素化
 */
const TaskEditForm = memo<TaskEditFormProps>(
  ({
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    dueTime,
    setDueTime,
    hasTime,
    setHasTime,
    labels,
    setLabels,
    attachments,
    setAttachments,
    columnId,
    setColumnId,
    statusOptions,
    recurrence,
    setRecurrence,
    priority,
    setPriority,
    onKeyPress,
  }) => (
    <UnifiedTaskForm
      mode="edit"
      title={title}
      setTitle={setTitle}
      description={description}
      setDescription={setDescription}
      dueDate={dueDate}
      setDueDate={setDueDate}
      dueTime={dueTime}
      setDueTime={setDueTime}
      hasTime={hasTime}
      setHasTime={setHasTime}
      labels={labels}
      setLabels={setLabels}
      attachments={attachments}
      setAttachments={setAttachments}
      recurrence={recurrence}
      setRecurrence={setRecurrence}
      priority={priority}
      setPriority={setPriority}
      onTimeChange={(newHasTime, newTime) => {
        setHasTime(newHasTime);
        setDueTime(newTime);
      }}
      onKeyPress={onKeyPress}
      editOptions={{
        columnId,
        setColumnId,
        statusOptions,
      }}
    />
  ),
);

export default TaskEditForm;