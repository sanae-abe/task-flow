import { TextInput, FormControl } from '@primer/react';
import React, { useState, useEffect, useCallback, memo } from 'react';

import type { Label as LabelType, FileAttachment, RecurrenceConfig } from '../types';
import { useKanban } from '../contexts/KanbanContext';

import CommonDialog, { DialogActions } from './CommonDialog';
import FileUploader from './FileUploader';
import FormField from './FormField';
import LabelSelector from './LabelSelector';
import RecurrenceSelector from './RecurrenceSelector';
import RichTextEditor from './RichTextEditor';
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

    // taskFormDefaultStatusが指定されている場合はそのカラムを使用、なければ最初のカラムを使用
    const targetColumnId = state.taskFormDefaultStatus || state.currentBoard.columns[0]?.id;

    if (targetColumnId) {
      createTask(
        targetColumnId,
        title.trim(),
        description.trim(),
        dueDateObj,
        labels,
        attachments,
        recurrence
      );
      closeTaskForm();
    }
  }, [title, description, dueDate, dueTime, hasTime, labels, attachments, recurrence, createTask, closeTaskForm, state.currentBoard, state.taskFormDefaultStatus]);

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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
        onKeyDown={handleKeyPress}
      >
        <FormField
          id="task-title"
          label="タイトル"
          value={title}
          placeholder="タスクのタイトルを入力..."
          onChange={setTitle}
          onKeyDown={handleKeyPress}
          autoFocus
          required
        />

        <div style={{ width:'100%', marginBottom: '16px' }}>
          <FormControl>
            <FormControl.Label>説明</FormControl.Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="タスクの詳細を入力..."
            />
          </FormControl>
        </div>

        <div style={{ marginTop: '8px', marginBottom: '16px' }}>
          <FormControl>
            <FormControl.Label>期限日</FormControl.Label>
            <div style={{ width: '100%' }}>
              <TextInput
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                sx={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
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
            </div>
          </FormControl>
        </div>

        <div style={{ marginTop: '8px', marginBottom: '16px' }}>
          <FormControl>
            <FormControl.Label>ラベル</FormControl.Label>
            <LabelSelector
              selectedLabels={labels}
              onLabelsChange={setLabels}
            />
          </FormControl>
        </div>

        <div style={{ marginTop: '8px', marginBottom: '24px' }}>
          <FormControl>
            <FormControl.Label>ファイル添付</FormControl.Label>
            <FileUploader
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              showModeSelector={false}
            />
          </FormControl>
        </div>
      </div>
    </CommonDialog>
  );
});

export default TaskCreateDialog;