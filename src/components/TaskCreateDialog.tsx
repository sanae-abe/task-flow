import { Box, Text } from '@primer/react';
import React, { useState, useEffect, useCallback, memo } from 'react';

import type { Label, FileAttachment } from '../types';

import BaseDialog, { DialogActions } from './BaseDialog';
import FileUploader from './FileUploader';
import FormField, { TextareaField, DateField } from './FormField';
import LabelSelector from './LabelSelector';

interface TaskCreateDialogProps {
  isOpen: boolean;
  onSave: (title: string, description: string, dueDate?: Date, labels?: Label[], attachments?: FileAttachment[]) => void;
  onCancel: () => void;
}

const TaskCreateDialog = memo<TaskCreateDialogProps>(({ 
  isOpen, 
  onSave, 
  onCancel 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setDueDate('');
      setLabels([]);
      setAttachments([]);
    }
  }, [isOpen]);

  const handleSave = useCallback(() => {
    if (title.trim()) {
      const dueDateObj = dueDate ? new Date(dueDate) : undefined;
      onSave(title.trim(), description.trim(), dueDateObj, labels, attachments);
    }
  }, [title, description, dueDate, labels, attachments, onSave]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCancel();
    }
  }, [onCancel]);

  const isFormValid = title.trim().length > 0;

  return (
    <BaseDialog
      isOpen={isOpen}
      title="新しいタスクを追加"
      onClose={onCancel}
      ariaLabelledBy="task-create-dialog-title"
      size="large"
      actions={
        <DialogActions
          onCancel={onCancel}
          onConfirm={handleSave}
          confirmText="追加"
          isConfirmDisabled={!isFormValid}
        />
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <FormField
          id="task-title"
          label="タイトル"
          value={title}
          placeholder="タスクタイトルを入力"
          onChange={setTitle}
          onKeyDown={handleKeyPress}
          autoFocus
          required
        />

        <TextareaField
          id="task-description"
          label="説明（任意）"
          value={description}
          placeholder="タスクの説明を入力"
          onChange={setDescription}
          onKeyDown={handleKeyPress}
          rows={4}
        />

        <DateField
          id="task-due-date"
          label="期限（任意）"
          value={dueDate}
          onChange={setDueDate}
          onKeyDown={handleKeyPress}
        />

        <Box sx={{ mb: 4 }}>
          <Text sx={{ fontSize: 1, color: 'fg.muted', mb: 1, display: 'block', fontWeight: '600' }}>
            ラベル（任意）
          </Text>
          <LabelSelector
            selectedLabels={labels}
            onLabelsChange={setLabels}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Text sx={{ fontSize: 1, color: 'fg.muted', mb: 1, display: 'block', fontWeight: '600' }}>
            ファイル添付（任意）
          </Text>
          <FileUploader
            attachments={attachments}
            onAttachmentsChange={setAttachments}
          />
        </Box>
      </Box>
    </BaseDialog>
  );
});

export default TaskCreateDialog;