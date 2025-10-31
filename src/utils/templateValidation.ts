import type {
  TaskTemplate,
  TemplateFormData,
  TemplateCategory,
} from '../types/template';
import type { Priority } from '../types';

/**
 * バリデーションエラー
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * バリデーション結果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * カテゴリーの有効性チェック
 */
const VALID_CATEGORIES: TemplateCategory[] = [
  'work',
  'personal',
  'project',
  'meeting',
  'routine',
  'other',
];

export const isValidCategory = (
  category: string
): category is TemplateCategory =>
  VALID_CATEGORIES.includes(category as TemplateCategory);

/**
 * プライオリティの有効性チェック
 */
const VALID_PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];

export const isValidPriority = (priority: string | undefined): boolean => {
  if (!priority) {
    return false;
  }
  return VALID_PRIORITIES.includes(priority as Priority);
};

/**
 * 相対日付の有効性チェック
 */
export const isValidRelativeDate = (dateStr: string): boolean => {
  // 相対日付の形式: +1d, -2w, +3m, +1y
  const relativeRegex = /^[+-]\d+[dwmy]$/i;

  if (relativeRegex.test(dateStr)) {
    return true;
  }

  // ISO形式の日付チェック
  try {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * テンプレート名のバリデーション
 */
export const validateTemplateName = (name: string): ValidationError | null => {
  if (!name || name.trim() === '') {
    return {
      field: 'name',
      message: 'テンプレート名は必須です',
    };
  }

  if (name.length > 100) {
    return {
      field: 'name',
      message: 'テンプレート名は100文字以内で入力してください',
    };
  }

  return null;
};

/**
 * テンプレート説明のバリデーション
 */
export const validateTemplateDescription = (
  description: string
): ValidationError | null => {
  if (description.length > 500) {
    return {
      field: 'description',
      message: 'テンプレート説明は500文字以内で入力してください',
    };
  }

  return null;
};

/**
 * タスクタイトルのバリデーション
 */
export const validateTaskTitle = (title: string): ValidationError | null => {
  if (!title || title.trim() === '') {
    return {
      field: 'taskTitle',
      message: 'タスクタイトルは必須です',
    };
  }

  if (title.length > 200) {
    return {
      field: 'taskTitle',
      message: 'タスクタイトルは200文字以内で入力してください',
    };
  }

  return null;
};

/**
 * タスク説明のバリデーション
 */
export const validateTaskDescription = (
  description: string
): ValidationError | null => {
  if (description.length > 10000) {
    return {
      field: 'taskDescription',
      message: 'タスク説明は10000文字以内で入力してください',
    };
  }

  return null;
};

/**
 * カテゴリーのバリデーション
 */
export const validateCategory = (category: string): ValidationError | null => {
  if (!category) {
    return {
      field: 'category',
      message: 'カテゴリーは必須です',
    };
  }

  if (!isValidCategory(category)) {
    return {
      field: 'category',
      message: '無効なカテゴリーです',
    };
  }

  return null;
};

/**
 * プライオリティのバリデーション
 */
export const validatePriority = (
  priority: string | undefined
): ValidationError | null => {
  // 優先度は任意なので未設定を許可
  if (!priority) {
    return null;
  }

  if (!isValidPriority(priority)) {
    return {
      field: 'priority',
      message: '無効な優先度です',
    };
  }

  return null;
};

/**
 * 期限のバリデーション
 */
export const validateDueDate = (
  dueDate: string | null
): ValidationError | null => {
  if (dueDate === null || dueDate === '') {
    return null; // 期限なしは許可
  }

  if (!isValidRelativeDate(dueDate)) {
    return {
      field: 'dueDate',
      message: '期限の形式が不正です（例：+1d, +1w, +1m, +1y）',
    };
  }

  return null;
};

/**
 * テンプレートフォームデータのバリデーション
 */
export const validateTemplateFormData = (
  formData: Partial<TemplateFormData>
): ValidationResult => {
  const errors: ValidationError[] = [];

  // テンプレート名
  const nameError = validateTemplateName(formData.name || '');
  if (nameError) {
    errors.push(nameError);
  }

  // テンプレート説明
  const descriptionError = validateTemplateDescription(
    formData.description || ''
  );
  if (descriptionError) {
    errors.push(descriptionError);
  }

  // カテゴリー
  const categoryError = validateCategory(formData.category || '');
  if (categoryError) {
    errors.push(categoryError);
  }

  // タスクタイトル
  const taskTitleError = validateTaskTitle(formData.taskTitle || '');
  if (taskTitleError) {
    errors.push(taskTitleError);
  }

  // タスク説明
  const taskDescriptionError = validateTaskDescription(
    formData.taskDescription || ''
  );
  if (taskDescriptionError) {
    errors.push(taskDescriptionError);
  }

  // プライオリティ
  const priorityError = validatePriority(formData.priority);
  if (priorityError) {
    errors.push(priorityError);
  }

  // 期限
  const dueDateError = validateDueDate(formData.dueDate ?? null);
  if (dueDateError) {
    errors.push(dueDateError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * テンプレート全体のバリデーション
 */
export const validateTemplate = (
  template: Partial<TaskTemplate>
): ValidationResult => {
  const errors: ValidationError[] = [];

  // ID
  if (!template.id || typeof template.id !== 'string') {
    errors.push({ field: 'id', message: 'IDは必須です' });
  }

  // フォームデータのバリデーション
  const formValidation = validateTemplateFormData({
    name: template.name,
    description: template.description,
    category: template.category,
    taskTitle: template.taskTitle,
    taskDescription: template.taskDescription,
    priority: template.priority,
    labels: template.labels,
    dueDate: template.dueDate,
    recurrence: template.recurrence,
    isFavorite: template.isFavorite,
    boardId: template.boardId,
    columnId: template.columnId,
  });

  errors.push(...formValidation.errors);

  // createdAt
  if (!template.createdAt) {
    errors.push({ field: 'createdAt', message: '作成日時は必須です' });
  } else {
    try {
      const date = new Date(template.createdAt);
      if (isNaN(date.getTime())) {
        errors.push({
          field: 'createdAt',
          message: '作成日時の形式が不正です',
        });
      }
    } catch {
      errors.push({ field: 'createdAt', message: '作成日時の形式が不正です' });
    }
  }

  // updatedAt
  if (!template.updatedAt) {
    errors.push({ field: 'updatedAt', message: '更新日時は必須です' });
  } else {
    try {
      const date = new Date(template.updatedAt);
      if (isNaN(date.getTime())) {
        errors.push({
          field: 'updatedAt',
          message: '更新日時の形式が不正です',
        });
      }
    } catch {
      errors.push({ field: 'updatedAt', message: '更新日時の形式が不正です' });
    }
  }

  // usageCount
  if (typeof template.usageCount !== 'number' || template.usageCount < 0) {
    errors.push({
      field: 'usageCount',
      message: '使用回数は0以上の数値である必要があります',
    });
  }

  // isFavorite
  if (typeof template.isFavorite !== 'boolean') {
    errors.push({
      field: 'isFavorite',
      message: 'お気に入りはboolean型である必要があります',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * テンプレートのサニタイズ
 * 不正な値を安全な値に変換
 */
export const sanitizeTemplateFormData = (
  formData: Partial<TemplateFormData>
): TemplateFormData => ({
  name: (formData.name || '').trim().substring(0, 100),
  description: (formData.description || '').trim().substring(0, 500),
  category: isValidCategory(formData.category || '')
    ? (formData.category as TemplateCategory)
    : 'other',
  taskTitle: (formData.taskTitle || '').trim().substring(0, 200),
  taskDescription: (formData.taskDescription || '').substring(0, 10000),
  priority:
    formData.priority && isValidPriority(formData.priority)
      ? formData.priority
      : undefined,
  labels: Array.isArray(formData.labels) ? formData.labels : [],
  dueDate: formData.dueDate || null,
  recurrence: formData.recurrence,
  isFavorite: Boolean(formData.isFavorite),
  boardId: formData.boardId,
  columnId: formData.columnId,
});

/**
 * バリデーションエラーを文字列に変換
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
  if (errors.length === 0) {
    return '';
  }

  return errors.map(_error => _error.message).join('\n');
};

/**
 * 複数のテンプレートをバリデーション
 */
export const validateTemplates = (
  templates: Partial<TaskTemplate>[]
): {
  validTemplates: TaskTemplate[];
  invalidTemplates: Array<{
    template: Partial<TaskTemplate>;
    errors: ValidationError[];
  }>;
} => {
  const validTemplates: TaskTemplate[] = [];
  const invalidTemplates: Array<{
    template: Partial<TaskTemplate>;
    errors: ValidationError[];
  }> = [];

  templates.forEach(template => {
    const validation = validateTemplate(template);
    if (validation.isValid) {
      validTemplates.push(template as TaskTemplate);
    } else {
      invalidTemplates.push({ template, errors: validation.errors });
    }
  });

  return { validTemplates, invalidTemplates };
};

/**
 * インポートデータのバリデーション
 */
export const validateImportData = (
  data: unknown
): {
  isValid: boolean;
  templates: TaskTemplate[];
  errors: string[];
} => {
  const errors: string[] = [];

  // データが存在するかチェック
  if (!data || typeof data !== 'object') {
    errors.push('インポートデータが不正です');
    return { isValid: false, templates: [], errors };
  }

  const importData = data as Record<string, unknown>;

  // templatesフィールドのチェック（ブラケット記法を使用）
  if (!Array.isArray(importData['templates'])) {
    errors.push('templatesフィールドが配列ではありません');
    return { isValid: false, templates: [], errors };
  }

  // 各テンプレートをバリデーション
  const { validTemplates, invalidTemplates } = validateTemplates(
    importData['templates'] as Partial<TaskTemplate>[]
  );

  if (invalidTemplates.length > 0) {
    invalidTemplates.forEach(({ template, errors: templateErrors }) => {
      errors.push(
        `テンプレート「${(template as { name?: string }).name || '名前なし'}」: ${formatValidationErrors(templateErrors)}`
      );
    });
  }

  return {
    isValid: errors.length === 0,
    templates: validTemplates,
    errors,
  };
};
