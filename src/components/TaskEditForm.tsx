import { Box, Text } from '@primer/react';
import React, { memo } from 'react';

import type { Label, FileAttachment } from '../types';

import FileUploader from './FileUploader';
import FormField, { TextareaField, DateField } from './FormField';
import LabelSelector from './LabelSelector';


interface TaskEditFormProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
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
  labels,
  setLabels,
  attachments,
  setAttachments,
  onKeyPress
}) => (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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

      <TextareaField
        id="task-description"
        label="説明（任意）"
        value={description}
        placeholder="タスクの説明を入力"
        onChange={setDescription}
        onKeyDown={onKeyPress}
        rows={4}
      />

      <DateField
        id="task-due-date"
        label="期限（任意）"
        value={dueDate}
        onChange={setDueDate}
        onKeyDown={onKeyPress}
      />

      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Text sx={{ fontSize: 1, color: 'fg.muted', fontWeight: '700' }}>
          ラベル（任意）
        </Text>
        <LabelSelector
          selectedLabels={labels}
          onLabelsChange={setLabels}
        />
      </Box>

      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Text sx={{ fontSize: 1, color: 'fg.muted', fontWeight: '700' }}>
          ファイル添付（任意）
        </Text>
        <FileUploader
          attachments={attachments}
          onAttachmentsChange={setAttachments}
        />
      </Box>
    </Box>
  ));

export default TaskEditForm;