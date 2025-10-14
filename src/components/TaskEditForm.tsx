import { TextInput, Select, FormControl } from "@primer/react";
import React, { memo, useCallback } from "react";

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
import RichTextEditor from "./RichTextEditor";
import TimeSelector from "./TimeSelector";

interface TaskEditFormProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: 0,
        }}
      >
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

        <FormControl sx={{ marginBottom: "24px" }}>
          <FormControl.Label>説明</FormControl.Label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="タスクの説明を入力"
          />
        </FormControl>

      <div style={{ marginBottom: "24px" }}>
        <FormControl sx={{ marginBottom: "8px" }}>
          <FormControl.Label>期限</FormControl.Label>
          <TextInput
            type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onKeyDown={onKeyPress}
              sx={{ width: "100%" }}
              step="1"
            />
          </FormControl>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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

        <FormControl sx={{ marginBottom: "24px" }}>
          <FormControl.Label>ステータス</FormControl.Label>
          <Select
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
            sx={{ width: "100%" }}
          >
            {statusOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ marginBottom: "24px" }}>
          <FormControl.Label>ラベル</FormControl.Label>
          <LabelSelector selectedLabels={labels} onLabelsChange={setLabels} />
        </FormControl>

        <FormControl sx={{ marginBottom: "24px" }}>
          <PrioritySelector
            priority={priority}
            onPriorityChange={setPriority}
          />
        </FormControl>

        <FormControl sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <FormControl.Label>ファイル添付</FormControl.Label>
          <FileUploader
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            showModeSelector={false}
          />
        </FormControl>
      </div>
    );
  },
);

export default TaskEditForm;
