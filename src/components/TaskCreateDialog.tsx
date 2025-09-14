import { Box, Text, TextInput } from '@primer/react';
import React, { useState, useEffect, useCallback, memo } from 'react';

import type { Label as LabelType, FileAttachment, RecurrenceConfig } from '../types';
import { useKanban } from '../contexts/KanbanContext';

import CommonDialog, { DialogActions } from './CommonDialog';
import FileUploader from './FileUploader';
import FormField, { TextareaField } from './FormField';
import LabelSelector from './LabelSelector';
import RecurrenceSelector from './RecurrenceSelector';
import TimeSelector from './TimeSelector';

const TaskCreateDialog = memo(() => {
  const {
    state,
    closeTaskForm,
    createTask,
  } = useKanban();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [hasTime, setHasTime] = useState(false);
  const [labels, setLabels] = useState<LabelType[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [recurrence, setRecurrence] = useState<RecurrenceConfig | undefined>();

  // デフォルト日付が設定されている場合は期限日に設定
  useEffect(() => {
    if (state.taskFormDefaultDate) {
      const defaultDate = new Date(state.taskFormDefaultDate);
      const dateString = defaultDate.toISOString().split('T')[0]; // YYYY-MM-DD形式
      setDueDate(dateString || '');
    }
  }, [state.taskFormDefaultDate]);

  useEffect(() => {
    if (state.isTaskFormOpen) {
      setTitle('');
      setDescription('');
      if (!state.taskFormDefaultDate) {
        setDueDate('');
      }
      setDueTime('');
      setHasTime(false);
      setLabels([]);
      setAttachments([]);
      setRecurrence(undefined);
    }
  }, [state.isTaskFormOpen, state.taskFormDefaultDate]);

  const handleTimeChange = useCallback((newHasTime: boolean, newTime: string) => {
    setHasTime(newHasTime);
    setDueTime(newTime);
  }, []);

  const handleSave = useCallback(() => {
    if (!title.trim() || !state.currentBoard) {
      return;
    }

    let dueDateObj: Date | undefined = undefined;

    if (dueDate) {
      if (hasTime && dueTime) {
        // 日付と時刻を組み合わせ
        const dateTimeString = `${dueDate}T${dueTime}`;
        dueDateObj = new Date(dateTimeString);
      } else {
        // 日付のみの場合は23:59:59に設定
        dueDateObj = new Date(dueDate);
        dueDateObj.setHours(23, 59, 59, 999);
      }
    }

    const defaultColumnId = state.currentBoard.columns[0]?.id;

    if (defaultColumnId) {
      createTask(
        defaultColumnId,
        title.trim(),
        description.trim(),
        dueDateObj,
        labels,
        attachments,
        recurrence
      );
      closeTaskForm();
    }
  }, [title, description, dueDate, dueTime, hasTime, labels, attachments, recurrence, createTask, closeTaskForm, state.currentBoard]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeTaskForm();
    }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSave();
    }
  }, [closeTaskForm, handleSave]);

  const isFormValid = title.trim().length > 0;

  if (!state.isTaskFormOpen || !state.currentBoard) {
    return null;
  }

  return (
    <CommonDialog
      isOpen={state.isTaskFormOpen}
      title="新しいタスクを作成"
      onClose={closeTaskForm}
      ariaLabelledBy="task-create-dialog-title"
      size="large"
      actions={
        <DialogActions
          onCancel={closeTaskForm}
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

        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Text sx={{ fontSize: 1, mb: 1, display: 'block', fontWeight: '700' }}>
              期限（任意）
            </Text>
            <TextInput
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onKeyDown={handleKeyPress}
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
    </CommonDialog>
  );
});

export default TaskCreateDialog;