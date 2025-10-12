import React from 'react';
import { TextInput, FormControl, Flash } from '@primer/react';
import { InfoIcon } from '@primer/octicons-react';

import type { TaskFormFieldsProps } from '../types';
import { UnifiedFormField } from '../../shared/Form';
import LabelSelector from '../../LabelSelector';
import PrioritySelector from '../../PrioritySelector';
import RecurrenceSelector from '../../RecurrenceSelector';
import RichTextEditor from '../../RichTextEditor';
import TimeSelector from '../../TimeSelector';
import FileUploader from '../../FileUploader';

/**
 * タスク作成フォームのフィールド群コンポーネント
 *
 * タスク作成に必要な全てのフィールドを含みます：
 * - タイトル（必須）
 * - 説明（リッチテキストエディタ）
 * - 期限・時刻設定
 * - 繰り返し設定
 * - ラベル選択
 * - 優先度選択
 * - ファイル添付
 */
export const TaskFormFields: React.FC<TaskFormFieldsProps> = ({
  formState,
  formActions,
  selectedTemplate,
  onTimeChange,
  onKeyPress
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
    priority
  } = formState;

  const {
    setTitle,
    setDescription,
    setDueDate,
    setLabels,
    setAttachments,
    setRecurrence,
    setPriority
  } = formActions;

  return (
    <div onKeyDown={onKeyPress} style={{ flex: 1, minHeight: '500px' }}>
      {/* テンプレート選択通知 */}
      {selectedTemplate && (
        <Flash variant="default" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <InfoIcon size={16} />
          <span>テンプレート「{selectedTemplate.name}」から作成中</span>
        </Flash>
      )}

      {/* タイトル */}
      <UnifiedFormField
        id="task-title"
        name="task-title"
        type="text"
        label="タイトル"
        value={title}
        placeholder="タスクのタイトルを入力"
        onChange={(value) => setTitle(value as string)}
        onKeyDown={onKeyPress}
        autoFocus
        validation={{ required: true }}
      />

      {/* 説明 */}
      <div style={{ width: '100%', marginBottom: '24px' }}>
        <FormControl>
          <FormControl.Label>説明（任意）</FormControl.Label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="タスクの説明を入力"
          />
        </FormControl>
      </div>

      {/* 期限設定 */}
      <div style={{ marginBottom: '24px' }}>
        <FormControl>
          <FormControl.Label>期限（任意）</FormControl.Label>
          <div style={{ width: '100%' }}>
            <TextInput
              type="date"
              value={dueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
              sx={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            <TimeSelector
              hasTime={hasTime}
              dueTime={dueTime}
              onTimeChange={onTimeChange}
              disabled={!dueDate}
            />
            <RecurrenceSelector
              recurrence={recurrence}
              onRecurrenceChange={setRecurrence}
            />
          </div>

        </FormControl>
      </div>

      {/* ラベル選択 */}
      <div style={{ marginBottom: '24px' }}>
        <FormControl>
          <FormControl.Label>ラベル（任意）</FormControl.Label>
          <LabelSelector
            selectedLabels={labels}
            onLabelsChange={setLabels}
          />
        </FormControl>
      </div>

      {/* 優先度選択 */}
      <div style={{ marginBottom: '24px' }}>
        <PrioritySelector
          priority={priority}
          onPriorityChange={setPriority}
        />
      </div>

      {/* ファイル添付 */}
      <div>
        <FormControl sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <FormControl.Label>ファイル添付（任意）</FormControl.Label>
          <FileUploader
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            showModeSelector={false}
          />
        </FormControl>
      </div>
    </div>
  );
};