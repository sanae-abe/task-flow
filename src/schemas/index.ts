/**
 * Zod Schemas - Runtime Validation
 *
 * このモジュールは、TypeScriptの静的型チェックに加えて
 * ランタイム時の型安全性を提供するZodスキーマを定義しています。
 */

// Task Schemas
export {
  prioritySchema,
  recurrencePatternSchema,
  subTaskSchema,
  fileAttachmentSchema,
  recurrenceConfigSchema,
  taskSchema,
  taskCreateInputSchema,
  taskUpdateInputSchema,
} from './task';

export type {
  TaskSchemaType,
  TaskCreateInputSchemaType,
  TaskUpdateInputSchemaType,
  SubTaskSchemaType,
  FileAttachmentSchemaType,
  RecurrenceConfigSchemaType,
  PrioritySchemaType,
} from './task';

// Board Schemas
export {
  columnSchema,
  boardSchema,
  boardCreateInputSchema,
  boardUpdateInputSchema,
  columnCreateInputSchema,
  columnUpdateInputSchema,
} from './board';

export type {
  ColumnSchemaType,
  BoardSchemaType,
  BoardCreateInputSchemaType,
  BoardUpdateInputSchemaType,
  ColumnCreateInputSchemaType,
  ColumnUpdateInputSchemaType,
} from './board';

// Label Schemas
export {
  labelSchema,
  labelCreateInputSchema,
  labelUpdateInputSchema,
  labelWithBoardInfoSchema,
} from './label';

export type {
  LabelSchemaType,
  LabelCreateInputSchemaType,
  LabelUpdateInputSchemaType,
  LabelWithBoardInfoSchemaType,
} from './label';

// Utility Functions
export {
  validateData,
  validateDataOrThrow,
  getValidationErrors,
  getFieldErrors,
  validatePartial,
  validateArray,
  validateDataAsync,
  safeParse,
  formatValidationErrors,
  getNestedFieldErrors,
} from './validation-utils';

export type { ValidationResult } from './validation-utils';
