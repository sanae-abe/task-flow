import { Box, Text, TextInput, Select } from '@primer/react';
import React, { memo, useCallback } from 'react';

import type { Label, FileAttachment, RecurrenceConfig } from '../types';

import FileUploader from './FileUploader';
import FormField from './FormField';
import LabelSelector from './LabelSelector';
import RecurrenceSelector from './RecurrenceSelector';
import RichTextEditor from './RichTextEditor';
import TimeSelector from './TimeSelector';

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
  onKeyPress: (event: React.KeyboardEvent) => void;
}

const TaskEditForm = memo<TaskEditFormProps>(({
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
  onKeyPress
}) => {
  const handleTimeChange = useCallback((newHasTime: boolean, newTime: string) => {
    setHasTime(newHasTime);
    setDueTime(newTime);
  }, [setHasTime, setDueTime]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 0 }}>
      <FormField
        id="task-title"
        label="タイトル"
        value={title}
        placeholder="タスクタイトルを入力"
        onChange={setTitle}
        onKeyDown={onKeyPress}
        autoFocus
        required
      />

      <Box sx={{ mb: 4 }}>
        <Text sx={{ fontSize: 1, mb: 2, display: 'block', fontWeight: '700' }}>
          説明（任意）
        </Text>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="タスクの説明を入力"
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Text sx={{ fontSize: 1, mb: 1, display: 'block', fontWeight: '700' }}>
            期限（任意）
          </Text>
          <TextInput
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            onKeyDown={onKeyPress}
            sx={{ width: '100%' }}
            step="1"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TimeSelector
            hasTime={hasTime}
            dueTime={dueTime}
            onTimeChange={handleTimeChange}
            disabled={!dueDate}
          />

          <RecurrenceSelector
            recurrence={recurrence}
            onRecurrenceChange={setRecurrence}
            disabled={!dueDate}
          />
        </Box>

        {!dueDate && (
          <Box sx={{ mt: 2, fontSize: 0, color: 'fg.muted' }}>
            ※期限を設定すると時刻設定と繰り返し設定が有効になります
          </Box>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Text sx={{ fontSize: 1, mb: 1, display: 'block', fontWeight: '700' }}>
          ステータス
        </Text>
        <Select
          value={columnId}
          onChange={(e) => setColumnId(e.target.value)}
          sx={{ width: '100%' }}
        >
          {statusOptions.map(option => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Text sx={{ fontSize: 1, mb: 1, display: 'block', fontWeight: '700' }}>
          ラベル（任意）
        </Text>
        <LabelSelector
          selectedLabels={labels}
          onLabelsChange={setLabels}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Text sx={{ fontSize: 1, mb: 1, display: 'block', fontWeight: '700' }}>
          ファイル添付（任意）
        </Text>
        <FileUploader
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          showModeSelector={false}
        />
      </Box>
    </Box>
  );
});

export default TaskEditForm;