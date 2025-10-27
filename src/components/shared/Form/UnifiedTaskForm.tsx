import React, { memo, useMemo, useCallback } from 'react';
import { DatePicker } from '@/components/ui/date-picker';

import type {
  Label,
  FileAttachment,
  RecurrenceConfig,
  Priority,
} from '../../../types';
import type { TaskTemplate } from '../../../types/template';

import FileUploader from '../../FileUploader';
import { useUnifiedForm } from '../../../hooks/useUnifiedForm';
import UnifiedFormField from './UnifiedFormField';
import LabelSelector from '../../LabelSelector';
import PrioritySelector from '../../PrioritySelector';
import RecurrenceSelector from '../../RecurrenceSelector';
import RichTextEditor from '../../RichTextEditor/';
import TimeSelector from '../../TimeSelector';
import DialogFlashMessage from '../DialogFlashMessage';
import { createTaskFormFields, type TaskFormFieldsConfig } from '../../../utils/taskFormFields';

/**
 * 統一タスクフォームのプロパティ
 */
export interface UnifiedTaskFormProps {
  // モード指定
  mode: 'create' | 'edit';

  // 基本フォーム状態
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string | null) => void;
  dueTime: string;
  setDueTime?: (value: string) => void;
  hasTime: boolean;
  setHasTime?: (value: boolean) => void;
  labels: Label[];
  setLabels: (labels: Label[]) => void;
  attachments: FileAttachment[];
  setAttachments: (attachments: FileAttachment[]) => void;
  recurrence: RecurrenceConfig | undefined;
  setRecurrence: (recurrence: RecurrenceConfig | undefined) => void;
  priority: Priority | undefined;
  setPriority: (priority: Priority | undefined) => void;

  // イベントハンドラー
  onTimeChange: (hasTime: boolean, time: string) => void;
  onKeyPress?: (event: React.KeyboardEvent) => void;

  // 編集モード固有
  editOptions?: {
    columnId: string;
    setColumnId: (value: string) => void;
    statusOptions: Array<{ value: string; label: string }>;
  };

  // 作成モード固有
  createOptions?: {
    selectedBoardId?: string;
    setSelectedBoardId?: (value: string | undefined) => void;
    availableBoards?: Array<{ id: string; title: string }>;
    selectedTemplate?: TaskTemplate;
    showTemplateNotification?: boolean;
  };

  // UI オプション
  className?: string;
}

/**
 * タスク作成・編集用の統一フォームコンポーネント
 * TaskEditForm と TaskFormFields の共通化
 */
export const UnifiedTaskForm = memo<UnifiedTaskFormProps>(({
  mode,
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
  recurrence,
  setRecurrence,
  priority,
  setPriority,
  onTimeChange,
  onKeyPress,
  editOptions,
  createOptions,
  className = '',
}) => {
  // 時刻変更ハンドラー
  const handleTimeChange = useCallback(
    (newHasTime: boolean, newTime: string) => {
      if (setHasTime && setDueTime) {
        setHasTime(newHasTime);
        setDueTime(newTime);
      } else {
        onTimeChange(newHasTime, newTime);
      }
    },
    [setHasTime, setDueTime, onTimeChange],
  );

  // フィールド設定
  const fieldsConfig: TaskFormFieldsConfig = useMemo(() => ({
    mode,
    title,
    editOptions: editOptions ? {
      description,
      dueDate,
      columnId: editOptions.columnId,
      statusOptions: editOptions.statusOptions,
    } : undefined,
    createOptions: createOptions ? {
      selectedBoardId: createOptions.selectedBoardId,
      availableBoards: createOptions.availableBoards,
    } : undefined,
  }), [mode, title, description, dueDate, editOptions, createOptions]);

  const fields = useMemo(() => createTaskFormFields(fieldsConfig), [fieldsConfig]);

  // 初期値の設定
  const initialValues = useMemo(() => {
    const values: Record<string, unknown> = {
      title,
    };

    if (mode === 'edit' && editOptions) {
      values['columnId'] = editOptions.columnId;
    }

    if (mode === 'create' && createOptions?.selectedBoardId) {
      values['selectedBoardId'] = createOptions.selectedBoardId;
    }

    return values;
  }, [mode, title, editOptions, createOptions]);

  // 統合フォーム管理
  const form = useUnifiedForm(fields, initialValues);

  // カスタムコンポーネントの生成
  const descriptionComponent = useMemo(() => (
    <RichTextEditor
      value={description}
      onChange={setDescription}
      placeholder="タスクの説明を入力..."
    />
  ), [description, setDescription]);

  const dueDateComponent = useMemo(() => (
    <DatePicker
      value={dueDate}
      onChange={(date) => setDueDate(date || '')}
      placeholder="期限を選択"
    />
  ), [dueDate, setDueDate]);

  const timeRecurrenceComponent = useMemo(() => (
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
  ), [hasTime, dueTime, handleTimeChange, dueDate, recurrence, setRecurrence]);

  const priorityComponent = useMemo(() => (
    <PrioritySelector
      priority={priority}
      onPriorityChange={setPriority}
    />
  ), [priority, setPriority]);

  const labelsComponent = useMemo(() => (
    <LabelSelector
      selectedLabels={labels}
      onLabelsChange={setLabels}
    />
  ), [labels, setLabels]);

  const attachmentsComponent = useMemo(() => (
    <FileUploader
      attachments={attachments}
      onAttachmentsChange={setAttachments}
      showModeSelector={false}
    />
  ), [attachments, setAttachments]);

  // カスタムコンポーネントでフィールドを更新
  const updatedFields = useMemo(() =>
    fields.map(field => {
      switch (field.id) {
        case 'description':
          return { ...field, customComponent: descriptionComponent };
        case 'dueDate':
          return { ...field, customComponent: dueDateComponent };
        case 'timeRecurrence':
          return { ...field, customComponent: timeRecurrenceComponent };
        case 'priority':
          return { ...field, customComponent: priorityComponent };
        case 'labels':
          return { ...field, customComponent: labelsComponent };
        case 'attachments':
          return { ...field, customComponent: attachmentsComponent };
        default:
          return field;
      }
    }), [fields, descriptionComponent, dueDateComponent, timeRecurrenceComponent, priorityComponent, labelsComponent, attachmentsComponent]
  );

  // 基本のクラス名設定
  const baseClassName = mode === 'create'
    ? 'flex-1 min-h-[500px] space-y-6'
    : 'flex flex-col space-y-6';

  return (
    <div className={`${baseClassName} ${className}`} onKeyDown={onKeyPress}>
      {/* テンプレート選択通知（作成モードのみ） */}
      {mode === 'create' && createOptions?.showTemplateNotification && createOptions.selectedTemplate && (
        <div className="mb-6">
          <DialogFlashMessage message={{
            type: 'info',
            text: `テンプレート「${createOptions.selectedTemplate.name}」から作成中`,
          }}
            isStatic
          />
        </div>
      )}

      {/* フォームフィールド */}
      {updatedFields.map((field) => (
        <UnifiedFormField
          key={field.id}
          {...field}
          value={field.type === 'custom' ? field.value : form.state.values[field.name]}
          onChange={(value) => {
            // カスタムコンポーネントは独自のonChangeを使用
            if (field.type !== 'custom') {
              form.setValue(field.name, value);

              // 特定のフィールドの変更を親コンポーネントに通知
              switch (field.name) {
                case 'title':
                  setTitle(value as string);
                  break;
                case 'columnId':
                  if (editOptions?.setColumnId) {
                    editOptions.setColumnId(value as string);
                  }
                  break;
                case 'selectedBoardId':
                  if (createOptions?.setSelectedBoardId) {
                    createOptions.setSelectedBoardId(value as string || undefined);
                  }
                  break;
              }
            }
          }}
          onBlur={() => {
            if (field.type !== 'custom') {
              form.setTouched(field.name, true);
            }
          }}
          onKeyDown={field.name === 'title' ? onKeyPress : undefined}
          _error={field.type !== 'custom' ? form.getFieldError(field.name) : undefined}
          touched={field.type !== 'custom' ? form.state.touched[field.name] : undefined}
          disabled={field.type !== 'custom' ? form.state.isSubmitting : undefined}
          hideLabel={field.label === ''}
          className={field.name === 'dueDate' ? '!mb-4' : undefined}
        />
      ))}
    </div>
  );
});

UnifiedTaskForm.displayName = 'UnifiedTaskForm';

export default UnifiedTaskForm;