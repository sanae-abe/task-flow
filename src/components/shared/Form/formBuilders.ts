import type {
  FormFieldConfig,
  FieldType,
  ValidationRule
} from '../../../types/unified-form';
import type { Label, FileAttachment, RecurrenceConfig } from '../../../types';

/**
 * フォームフィールド作成ヘルパー関数
 */
export const createFormField = (
  config: Partial<FormFieldConfig> & {
    id: string;
    name: string;
    type: FieldType;
    label: string;
    onChange: (value: unknown) => void;
  }
): FormFieldConfig => {
  const defaultValue = config.type === 'recurrence-selector'
    ? { enabled: false, pattern: 'daily' as const, interval: 1 }
    : '';

  return {
    value: defaultValue,
    placeholder: '',
    autoFocus: false,
    disabled: false,
    hideLabel: false,
    ...config
  };
};

/**
 * タスク編集フォーム用フィールド設定を生成
 */
export const createTaskFormFields = (
  values: {
    title: string;
    description: string;
    dueDate: string;
    completedAt?: string;
    labels: Label[];
    attachments: FileAttachment[];
    columnId?: string;
    recurrence?: RecurrenceConfig;
  },
  handlers: {
    setTitle: (value: string) => void;
    setDescription: (value: string) => void;
    setDueDate: (value: string) => void;
    setCompletedAt?: (value: string) => void;
    setLabels: (labels: Label[]) => void;
    setAttachments: (attachments: FileAttachment[]) => void;
    setColumnId?: (value: string) => void;
    setRecurrence?: (recurrence: RecurrenceConfig) => void;
  },
  options: {
    isCompleted?: boolean;
    showLabels?: boolean;
    showAttachments?: boolean;
    showStatus?: boolean;
    showRecurrence?: boolean;
    statusOptions?: Array<{ value: string; label: string }>;
    onKeyPress?: (event: React.KeyboardEvent) => void;
  } = {}
): FormFieldConfig[] => {
  const fields: FormFieldConfig[] = [
    createFormField({
      id: 'task-title',
      name: 'title',
      type: 'text',
      label: 'タイトル',
      value: values.title,
      placeholder: 'タスクタイトルを入力',
      onChange: handlers.setTitle as (value: unknown) => void,
      onKeyDown: options.onKeyPress,
      autoFocus: true,
      validation: { required: true, minLength: 1, maxLength: 100 }
    }),

    createFormField({
      id: 'task-description',
      name: 'description',
      type: 'textarea',
      label: '説明（任意）',
      value: values.description,
      placeholder: 'タスクの説明を入力',
      onChange: handlers.setDescription as (value: unknown) => void,
      onKeyDown: options.onKeyPress,
      rows: 4
    }),

    createFormField({
      id: 'task-due-date',
      name: 'dueDate',
      type: 'date',
      label: '期限（任意）',
      value: values.dueDate,
      onChange: handlers.setDueDate as (value: unknown) => void,
      onKeyDown: options.onKeyPress
    })
  ];

  // ステータス選択フィールド
  if (options.showStatus && options.statusOptions && handlers.setColumnId) {
    fields.push(
      createFormField({
        id: 'task-status',
        name: 'columnId',
        type: 'select',
        label: 'ステータス',
        value: values.columnId ?? '',
        onChange: handlers.setColumnId as (value: unknown) => void,
        options: options.statusOptions
      })
    );
  }

  // 完了日時フィールド（完了タスクのみ）
  if (options.isCompleted && handlers.setCompletedAt) {
    fields.push(
      createFormField({
        id: 'task-completed-at',
        name: 'completedAt',
        type: 'datetime-local',
        label: '完了日時',
        value: values.completedAt ?? '',
        onChange: handlers.setCompletedAt as (value: unknown) => void,
        onKeyDown: options.onKeyPress
      })
    );
  }

  // ラベルセレクター
  if (options.showLabels) {
    fields.push(
      createFormField({
        id: 'task-labels',
        name: 'labels',
        type: 'label-selector',
        label: 'ラベル（任意）',
        value: values.labels,
        onChange: handlers.setLabels as (value: unknown) => void
      })
    );
  }

  // ファイルアップローダー
  if (options.showAttachments) {
    fields.push(
      createFormField({
        id: 'task-attachments',
        name: 'attachments',
        type: 'file',
        label: 'ファイル添付（任意）',
        value: values.attachments,
        onChange: handlers.setAttachments as (value: unknown) => void
      })
    );
  }

  // 繰り返し設定
  if (options.showRecurrence && handlers.setRecurrence) {
    fields.push(
      createFormField({
        id: 'task-recurrence',
        name: 'recurrence',
        type: 'recurrence-selector',
        label: '繰り返し設定（任意）',
        value: values.recurrence ?? { enabled: false, pattern: 'daily', interval: 1 },
        onChange: handlers.setRecurrence as (value: unknown) => void,
        disabled: !values.dueDate, // 期限が未設定の場合は無効化
        helpText: !values.dueDate ? '繰り返し設定をするには期限を設定してください' : undefined
      })
    );
  }

  return fields;
};

/**
 * ラベル作成フォーム用フィールド設定を生成
 */
export const createLabelFormFields = (
  values: {
    name: string;
    color: string;
  },
  handlers: {
    setName: (name: string) => void;
    setColor: (color: string) => void;
  },
  options: {
    onKeyDown?: (e: React.KeyboardEvent) => void;
  } = {}
): FormFieldConfig[] => [
  createFormField({
    id: 'label-name',
    name: 'name',
    type: 'text',
    label: 'ラベル名',
    value: values.name,
    placeholder: 'ラベル名を入力',
    onChange: handlers.setName as (value: unknown) => void,
    onKeyDown: options.onKeyDown,
    autoFocus: true,
    validation: { required: true, minLength: 1, maxLength: 50 }
  }),

  createFormField({
    id: 'label-color',
    name: 'color',
    type: 'color-selector',
    label: '色',
    value: values.color,
    onChange: handlers.setColor as (value: unknown) => void
  })
];

/**
 * シンプルテキストフォーム用フィールド設定を生成（ボード名、カラム名など）
 */
export const createSimpleTextFormFields = (
  config: {
    id: string;
    name: string;
    label: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    validation?: ValidationRule;
  }
): FormFieldConfig[] => [
  createFormField({
    id: config.id,
    name: config.name,
    type: 'text',
    label: config.label,
    value: config.value,
    placeholder: config.placeholder ?? `${config.label}を入力`,
    onChange: config.onChange as (value: unknown) => void,
    onKeyDown: config.onKeyDown,
    autoFocus: true,
    validation: config.validation ?? { required: true, minLength: 1, maxLength: 100 }
  })
];

/**
 * サブタスクフォーム用フィールド設定を生成
 */
export const createSubTaskFormFields = (
  values: {
    title: string;
  },
  handlers: {
    setTitle: (title: string) => void;
  },
  options: {
    onKeyDown?: (event: React.KeyboardEvent) => void;
  } = {}
): FormFieldConfig[] => [
  createFormField({
    id: 'subtask-title',
    name: 'title',
    type: 'text',
    label: 'サブタスク名',
    value: values.title,
    placeholder: 'サブタスク名を入力...',
    onChange: handlers.setTitle as (value: unknown) => void,
    onKeyDown: options.onKeyDown,
    autoFocus: true,
    hideLabel: true,
    validation: { required: true, minLength: 1, maxLength: 100 }
  })
];

/**
 * バリデーションルール定義集
 */
export const ValidationRules = {
  required: { required: true },
  taskTitle: { required: true, minLength: 1, maxLength: 100 },
  boardName: { required: true, minLength: 1, maxLength: 50 },
  columnName: { required: true, minLength: 1, maxLength: 30 },
  labelName: { required: true, minLength: 1, maxLength: 50 },
  description: { maxLength: 500 },
  email: { 
    required: true, 
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
  }
} as const;