import React, { memo, useCallback, useMemo } from "react";
import { DatePicker } from "@/components/ui/date-picker";

import type {
  Label,
  FileAttachment,
  RecurrenceConfig,
  Priority,
} from "../types";
import type { FormFieldConfig } from "../types/unified-form";

import FileUploader from "./FileUploader";
import { useUnifiedForm } from "../hooks/useUnifiedForm";
import UnifiedFormField from "./shared/Form/UnifiedFormField";
import LabelSelector from "./LabelSelector";
import PrioritySelector from "./PrioritySelector";
import RecurrenceSelector from "./RecurrenceSelector";
import RichTextEditor from "./RichTextEditor/";
import TimeSelector from "./TimeSelector";

interface TaskEditFormProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string | null) => void;
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

    // 初期値の設定
    const initialValues = useMemo(() => ({
      title: title,
      description: description,
      dueDate: dueDate,
      columnId: columnId,
    }), [title, description, dueDate, columnId]);

    // フィールド設定
    const fields: FormFieldConfig[] = useMemo(() => [
      // タイトル入力
      {
        id: 'title',
        name: 'title',
        type: 'text',
        label: 'タイトル',
        placeholder: 'タスクタイトルを入力',
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
        value: initialValues.description,
        customComponent: null, // 後で動的に設定
        onChange: () => {}, // カスタムコンポーネントで管理
      },
      // 期限（カスタムコンポーネント）
      {
        id: 'dueDate',
        name: 'dueDate',
        type: 'custom',
        label: '期限',
        value: initialValues.dueDate,
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
      // ステータス選択
      {
        id: 'columnId',
        name: 'columnId',
        type: 'select',
        label: 'ステータス',
        value: initialValues.columnId,
        options: statusOptions,
        onChange: () => {}, // フォームで管理
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
    ], [initialValues, statusOptions]);

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
          onTimeChange={handleTimeChange}
          disabled={!dueDate}
        />
        <RecurrenceSelector
          recurrence={recurrence}
          onRecurrenceChange={setRecurrence}
        />
      </div>
    ), [hasTime, dueTime, handleTimeChange, dueDate, recurrence, setRecurrence]);

    const labelsComponent = useMemo(() => (
      <LabelSelector selectedLabels={labels} onLabelsChange={setLabels} />
    ), [labels, setLabels]);

    const priorityComponent = useMemo(() => (
      <PrioritySelector
        priority={priority}
        onPriorityChange={setPriority}
      />
    ), [priority, setPriority]);

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
          case 'labels':
            return { ...field, customComponent: labelsComponent };
          case 'priority':
            return { ...field, customComponent: priorityComponent };
          case 'attachments':
            return { ...field, customComponent: attachmentsComponent };
          default:
            return field;
        }
      }), [fields, descriptionComponent, dueDateComponent, timeRecurrenceComponent, labelsComponent, priorityComponent, attachmentsComponent]
    );

    return (
      <div className="flex flex-col space-y-6">
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
                    setColumnId(value as string);
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
  },
);

export default TaskEditForm;