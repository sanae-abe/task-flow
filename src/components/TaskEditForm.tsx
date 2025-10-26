import React, { memo, useCallback } from "react";
import { DatePicker } from "@/components/ui/date-picker";

import type {
  Label,
  FileAttachment,
  RecurrenceConfig,
  Priority,
} from "../types";

import FileUploader from "./FileUploader";
import { UnifiedFormField } from "./shared/Form";
import LabelSelector from "./LabelSelector";
import PrioritySelector from "./PrioritySelector";
import RecurrenceSelector from "./RecurrenceSelector";
import RichTextEditor from "./RichTextEditor/";
import TimeSelector from "./TimeSelector";

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
  }) => {
    const handleTimeChange = useCallback(
      (newHasTime: boolean, newTime: string) => {
        setHasTime(newHasTime);
        setDueTime(newTime);
      },
      [setHasTime, setDueTime],
    );

    return (
      <div className="flex flex-col space-y-6">
        <UnifiedFormField
          id="task-title"
          name="task-title"
          type="text"
          label="タイトル"
          value={title}
          placeholder="タスクタイトルを入力"
          onChange={(value) => setTitle(value as string)}
          onKeyDown={onKeyPress}
          autoFocus
          validation={{ required: true }}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            説明
          </label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="タスクの説明を入力..."
          />
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              期限
            </label>
            <DatePicker
              value={dueDate}
              onChange={(date) => setDueDate(date || '')}
              placeholder="期限を選択"
              className="w-full"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <TimeSelector
              hasTime={hasTime}
              dueTime={dueTime}
              onTimeChange={handleTimeChange}
              disabled={!dueDate}
            />

            <RecurrenceSelector
              recurrence={recurrence}
              onRecurrenceChange={setRecurrence}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            ステータス
          </label>
          <select
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            ラベル
          </label>
          <LabelSelector selectedLabels={labels} onLabelsChange={setLabels} />
        </div>

        <div>
          <PrioritySelector
            priority={priority}
            onPriorityChange={setPriority}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            ファイル添付
          </label>
          <FileUploader
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            showModeSelector={false}
          />
        </div>
      </div>
    );
  },
);

export default TaskEditForm;
