/**
 * テンプレート関連のユーティリティ集約エクスポート
 */

// ストレージ
export {
  TemplateStorage,
  TemplateStorageError,
  type TemplateStorageSchema,
  type TemplateStorageErrorType,
} from '../templateStorage';

// テンプレート <-> タスク変換
export {
  templateToTask,
  templatestoTasks,
  taskToTemplate,
  getRelativeDateLabel,
  isValidRelativeDate,
  createRelativeDate,
  previewTemplateTask,
  validateTemplate,
  RELATIVE_DATE_PRESETS,
  type TemplateToTaskOptions,
} from '../templateToTask';

// バリデーション
export {
  validateTemplateFormData,
  validateTemplate as validateFullTemplate,
  validateTemplateName,
  validateTemplateDescription,
  validateTaskTitle,
  validateTaskDescription,
  validateCategory,
  validatePriority,
  validateDueDate,
  sanitizeTemplateFormData,
  formatValidationErrors,
  validateTemplates,
  validateImportData,
  isValidCategory,
  isValidPriority,
  type ValidationError,
  type ValidationResult,
} from '../templateValidation';
