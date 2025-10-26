import React, { useMemo } from 'react';
import { DatePicker } from "@/components/ui/date-picker";

import type { TaskFormFieldsProps } from '../types';
import type { FormFieldConfig } from '../../../types/unified-form';
import { useUnifiedForm } from '../../../hooks/useUnifiedForm';
import UnifiedFormField from '../../shared/Form/UnifiedFormField';
import LabelSelector from '../../LabelSelector';
import PrioritySelector from '../../PrioritySelector';
import RecurrenceSelector from '../../RecurrenceSelector';
import RichTextEditor from '../../RichTextEditor/';
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

  // 初期値の設定
  const initialValues = useMemo(() => ({
    title: title,
    selectedBoardId: selectedBoardId || '',
  }), [title, selectedBoardId]);

  // ボード選択のオプション生成
  const boardOptions = useMemo(() => {
    if (!availableBoards || availableBoards.length <= 1) return [];

    const options = [{ value: '', label: '現在のボード' }];
    availableBoards.forEach(board => {
      options.push({
        value: board.id,
        label: board.title
      });
    });
    return options;
  }, [availableBoards]);

  // フィールド設定
  const fields: FormFieldConfig[] = useMemo(() => {
    const baseFields: FormFieldConfig[] = [
      // タイトル入力
      {
        id: 'title',
        name: 'title',
        type: 'text',
        label: 'タイトル',
        placeholder: 'タスクのタイトルを入力',
        value: initialValues.title,
        autoFocus: true,
        validation: { required: true },
        onChange: () => {}, // フォームで管理
      },
      // 説明（カスタムコンポーネント）
      {
        id: 'description',
        name: 'description',
        type: 'custom',
        label: '説明',
        value: '',
        customComponent: null, // 後で動的に設定
        onChange: () => {}, // カスタムコンポーネントで管理
      },
      // 期限（カスタムコンポーネント）
      {
        id: 'dueDate',
        name: 'dueDate',
        type: 'custom',
        label: '期限',
        value: '',
        customComponent: null, // 後で動的に設定
        onChange: () => {}, // カスタムコンポーネントで管理
      },
      // 時刻・繰り返し設定（カスタムコンポーネント）
      {
        id: 'timeRecurrence',
        name: 'timeRecurrence',
        type: 'custom',
        label: '',
        value: '',
        customComponent: null, // 後で動的に設定
        onChange: () => {}, // カスタムコンポーネントで管理
      },
      // 優先度（カスタムコンポーネント）
      {
        id: 'priority',
        name: 'priority',
        type: 'custom',
        label: '',
        value: '',
        customComponent: null, // 後で動的に設定
        onChange: () => {}, // カスタムコンポーネントで管理
      },
      // ラベル（カスタムコンポーネント）
      {
        id: 'labels',
        name: 'labels',
        type: 'custom',
        label: 'ラベル',
        value: '',
        customComponent: null, // 後で動的に設定
        onChange: () => {}, // カスタムコンポーネントで管理
      },
      // ファイル添付（カスタムコンポーネント）
      {
        id: 'attachments',
        name: 'attachments',
        type: 'custom',
        label: 'ファイル添付',
        value: '',
        customComponent: null, // 後で動的に設定
        onChange: () => {}, // カスタムコンポーネントで管理
      },
    ];

    // ボード選択フィールド（条件付き追加）
    if (availableBoards && availableBoards.length > 1) {
      baseFields.splice(1, 0, {
        id: 'selectedBoardId',
        name: 'selectedBoardId',
        type: 'select',
        label: '作成先ボード',
        value: initialValues.selectedBoardId,
        options: boardOptions,
        onChange: () => {}, // フォームで管理
      });
    }

    return baseFields;
  }, [initialValues, availableBoards, boardOptions]);

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
      className="w-full"
    />
  ), [dueDate, setDueDate]);

  const timeRecurrenceComponent = useMemo(() => (
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
  ), [hasTime, dueTime, onTimeChange, dueDate, recurrence, setRecurrence]);

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
                case 'selectedBoardId':
                  setSelectedBoardId(value as string || undefined);
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
          error={field.type !== 'custom' ? form.getFieldError(field.name) : undefined}
          touched={field.type !== 'custom' ? form.state.touched[field.name] : undefined}
          disabled={field.type !== 'custom' ? form.state.isSubmitting : undefined}
          hideLabel={field.label === ''}
        />
      ))}
    </div>
  );
};