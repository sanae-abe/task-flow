import React from 'react';
import { DatePicker } from "@/components/ui/date-picker";

import type { TaskFormFieldsProps } from '../types';
import { UnifiedFormField } from '../../shared/Form';
import LabelSelector from '../../LabelSelector';
import PrioritySelector from '../../PrioritySelector';
import RecurrenceSelector from '../../RecurrenceSelector';
import RichTextEditor from '../../RichTextEditor';
import TimeSelector from '../../TimeSelector';
import FileUploader from '../../FileUploader';
import DialogFlashMessage from '../../shared/DialogFlashMessage';

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
    <div onKeyDown={onKeyPress} className="flex-1 min-h-[500px] space-y-6">
      {/* テンプレート選択通知 */}
      {selectedTemplate && (
        <div className="mb-6">
          <DialogFlashMessage message={{
            type: 'info',
            text: `テンプレート「${selectedTemplate.name}」から作成中`,
          }}
            isStatic
          />
        </div>
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

      {/* ボード選択 */}
      {availableBoards && availableBoards.length > 1 && (
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            作成先ボード
          </label>
          <select
            value={selectedBoardId || ''}
            onChange={(e) => setSelectedBoardId(e.target.value || undefined)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">現在のボード</option>
            {availableBoards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 説明 */}
      <div className="w-full space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          説明
        </label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="タスクの説明を入力..."
        />
      </div>

      {/* 期限設定 */}
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
            onTimeChange={onTimeChange}
            disabled={!dueDate}
          />
          <RecurrenceSelector
            recurrence={recurrence}
            onRecurrenceChange={setRecurrence}
          />
        </div>
      </div>

      {/* 優先度選択 */}
      <div>
        <PrioritySelector
          priority={priority}
          onPriorityChange={setPriority}
        />
      </div>

      {/* ラベル選択 */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          ラベル
        </label>
        <LabelSelector
          selectedLabels={labels}
          onLabelsChange={setLabels}
        />
      </div>

      {/* ファイル添付 */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          ファイル添付
        </label>
        <FileUploader
          attachments={attachments}
          onAttachmentsChange={setAttachments}
        />
      </div>
    </div>
  );
};