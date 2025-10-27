import type { FormFieldConfig } from '../types/unified-form';

/**
 * タスクフォーム用のフィールドファクトリー関数集
 * TaskEditForm と TaskFormFields の共通化用
 */

// タイトルフィールド
export const createTitleField = (value: string): FormFieldConfig => ({
  id: 'title',
  name: 'title',
  type: 'text',
  label: 'タイトル',
  placeholder: 'タスクのタイトルを入力',
  value,
  autoFocus: true,
  validation: { required: true },
  onChange: () => {}, // フォームで管理
});

// 説明フィールド（カスタムコンポーネント）
export const createDescriptionField = (): FormFieldConfig => ({
  id: 'description',
  name: 'description',
  type: 'custom',
  label: '説明',
  value: '',
  customComponent: null, // 後で動的に設定
  onChange: () => {}, // カスタムコンポーネントで管理
});

// 期限フィールド（カスタムコンポーネント）
export const createDueDateField = (): FormFieldConfig => ({
  id: 'dueDate',
  name: 'dueDate',
  type: 'custom',
  label: '期限',
  value: '',
  customComponent: null, // 後で動的に設定
  onChange: () => {}, // カスタムコンポーネントで管理
});

// 時刻・繰り返し設定フィールド（カスタムコンポーネント）
export const createTimeRecurrenceField = (): FormFieldConfig => ({
  id: 'timeRecurrence',
  name: 'timeRecurrence',
  type: 'custom',
  label: '',
  value: '',
  customComponent: null, // 後で動的に設定
  onChange: () => {}, // カスタムコンポーネントで管理
});

// ステータス選択フィールド（編集モード用）
export const createStatusField = (
  value: string,
  options: Array<{ value: string; label: string }>
): FormFieldConfig => ({
    id: 'columnId',
    name: 'columnId',
    type: 'select',
    label: 'ステータス',
    value,
    options,
    onChange: () => {}, // フォームで管理
  });

// ボード選択フィールド（作成モード用）
export const createBoardField = (
  value: string,
  boards: Array<{ id: string; title: string }>
): FormFieldConfig => {
  const options = [{ value: '', label: '現在のボード' }];
  boards.forEach(board => {
    options.push({
      value: board.id,
      label: board.title
    });
  });

  return {
    id: 'selectedBoardId',
    name: 'selectedBoardId',
    type: 'select',
    label: '作成先ボード',
    value,
    options,
    onChange: () => {}, // フォームで管理
  };
};

// ラベルフィールド（カスタムコンポーネント）
export const createLabelsField = (): FormFieldConfig => ({
  id: 'labels',
  name: 'labels',
  type: 'custom',
  label: 'ラベル',
  value: '',
  customComponent: null, // 後で動的に設定
  onChange: () => {}, // カスタムコンポーネントで管理
});

// 優先度フィールド（カスタムコンポーネント）
export const createPriorityField = (): FormFieldConfig => ({
  id: 'priority',
  name: 'priority',
  type: 'custom',
  label: '',
  value: '',
  customComponent: null, // 後で動的に設定
  onChange: () => {}, // カスタムコンポーネントで管理
});

// ファイル添付フィールド（カスタムコンポーネント）
export const createAttachmentsField = (): FormFieldConfig => ({
  id: 'attachments',
  name: 'attachments',
  type: 'custom',
  label: 'ファイル添付',
  value: '',
  customComponent: null, // 後で動的に設定
  onChange: () => {}, // カスタムコンポーネントで管理
});

/**
 * モードに応じたタスクフォームフィールドを生成
 */
export interface TaskFormFieldsConfig {
  mode: 'create' | 'edit';
  title: string;

  // 編集モード用
  editOptions?: {
    description: string;
    dueDate: string;
    columnId: string;
    statusOptions: Array<{ value: string; label: string }>;
  };

  // 作成モード用
  createOptions?: {
    selectedBoardId?: string;
    availableBoards?: Array<{ id: string; title: string }>;
  };
}

export const createTaskFormFields = (config: TaskFormFieldsConfig): FormFieldConfig[] => {
  const fields: FormFieldConfig[] = [];

  // 1. タイトル（共通）
  fields.push(createTitleField(config.title));

  // 2. ボード選択（作成モードのみ・条件付き）
  if (config.mode === 'create' &&
      config.createOptions?.availableBoards &&
      config.createOptions.availableBoards.length > 1) {
    fields.push(createBoardField(
      config.createOptions.selectedBoardId || '',
      config.createOptions.availableBoards
    ));
  }

  // 3. 説明（共通）
  fields.push(createDescriptionField());

  // 4. 期限（共通）
  fields.push(createDueDateField());

  // 5. 時刻・繰り返し（共通）
  fields.push(createTimeRecurrenceField());

  // 6. ステータス（編集モードのみ）
  if (config.mode === 'edit' && config.editOptions) {
    fields.push(createStatusField(
      config.editOptions.columnId,
      config.editOptions.statusOptions
    ));
  }

  // 7. ラベル（共通）
  fields.push(createLabelsField());

  // 8. 優先度（共通）
  fields.push(createPriorityField());

  // 9. ファイル添付（共通）
  fields.push(createAttachmentsField());

  return fields;
};