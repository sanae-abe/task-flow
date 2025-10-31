/**
 * 実行時型検証システム
 * TypeScript 5.7.3の型安全性を実行時まで拡張
 */

import type {
  Task,
  Label,
  FileAttachment,
  SubTask,
  RecurrenceConfig,
  KanbanBoard,
} from '../types';
// Branded types for enhanced type safety
export type TaskId = string & { readonly __brand: 'TaskId' };
export type LabelId = string & { readonly __brand: 'LabelId' };
export type BoardId = string & { readonly __brand: 'BoardId' };
export type ColumnId = string & { readonly __brand: 'ColumnId' };

// Result type for _error handling
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; _error: E };

// TypedStorage interface
export interface TypedStorage {
  getItem<T>(key: string, validator: (value: unknown) => value is T): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
}

// Storage _error class
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly key: string,
    public readonly operation: 'get' | 'set' | 'remove'
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

// 基本型チェッカー
export const isString = (value: unknown): value is string =>
  typeof value === 'string';

export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value);

export const isArray = <T>(
  value: unknown,
  itemCheck?: (item: unknown) => item is T
): value is T[] => {
  if (!Array.isArray(value)) {
    return false;
  }
  if (!itemCheck) {
    return true;
  }
  return value.every(itemCheck);
};

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Domain型の検証
export const isValidTaskId = (value: unknown): value is TaskId =>
  isString(value) && value.length > 0 && !value.includes(' ');

export const isValidLabelId = (value: unknown): value is LabelId =>
  isString(value) && value.length > 0 && !value.includes(' ');

export const isValidBoardId = (value: unknown): value is BoardId =>
  isString(value) && value.length > 0 && !value.includes(' ');

export const isValidColumnId = (value: unknown): value is ColumnId =>
  isString(value) && value.length > 0 && !value.includes(' ');

// 日付検証
export const isValidDateString = (value: unknown): value is string => {
  if (!isString(value)) {
    return false;
  }
  const date = new Date(value);
  return !isNaN(date.getTime()) && date.toISOString() === value;
};

// Priority型の検証
export const isValidPriority = (
  value: unknown
): value is 'low' | 'medium' | 'high' =>
  isString(value) && ['low', 'medium', 'high'].includes(value);

// Label型の検証
export const isValidLabel = (value: unknown): value is Label => {
  if (!isObject(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;

  return (
    isValidLabelId(obj['id']) &&
    isString(obj['name']) &&
    (obj['name'] as string).length > 0 &&
    isString(obj['color']) &&
    /^#[0-9a-fA-F]{6}$/.test(obj['color'] as string)
  );
};

// FileAttachment型の検証
export const isValidFileAttachment = (
  value: unknown
): value is FileAttachment => {
  if (!isObject(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;

  return (
    isString(obj['id']) &&
    isString(obj['name']) &&
    (obj['name'] as string).length > 0 &&
    isString(obj['type']) &&
    isNumber(obj['size']) &&
    (obj['size'] as number) > 0 &&
    isString(obj['data']) &&
    isValidDateString(obj['uploadedAt'])
  );
};

// SubTask型の検証
export const isValidSubTask = (value: unknown): value is SubTask => {
  if (!isObject(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;

  return (
    isString(obj['id']) &&
    isString(obj['title']) &&
    (obj['title'] as string).length > 0 &&
    typeof obj['completed'] === 'boolean' &&
    isValidDateString(obj['createdAt'])
  );
};

// RecurrenceConfig型の検証
export const isValidRecurrenceConfig = (
  value: unknown
): value is RecurrenceConfig => {
  if (!isObject(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;

  const hasValidPattern =
    isString(obj['pattern']) &&
    ['daily', 'weekly', 'monthly', 'yearly'].includes(obj['pattern'] as string);

  const hasValidInterval =
    isNumber(obj['interval']) && (obj['interval'] as number) > 0;

  return (
    typeof obj['enabled'] === 'boolean' &&
    hasValidPattern &&
    hasValidInterval &&
    (obj['daysOfWeek'] === undefined || isArray(obj['daysOfWeek'], isNumber)) &&
    (obj['dayOfMonth'] === undefined || isNumber(obj['dayOfMonth'])) &&
    (obj['weekOfMonth'] === undefined || isNumber(obj['weekOfMonth'])) &&
    (obj['dayOfWeekInMonth'] === undefined ||
      isNumber(obj['dayOfWeekInMonth'])) &&
    (obj['endDate'] === undefined || isValidDateString(obj['endDate'])) &&
    (obj['maxOccurrences'] === undefined || isNumber(obj['maxOccurrences']))
  );
};

// Task型の検証
export const isValidTask = (value: unknown): value is Task => {
  if (!isObject(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;

  return (
    isValidTaskId(obj['id']) &&
    isString(obj['title']) &&
    (obj['title'] as string).length > 0 &&
    isString(obj['description']) &&
    isValidDateString(obj['createdAt']) &&
    isValidDateString(obj['updatedAt']) &&
    (obj['dueDate'] === null || isValidDateString(obj['dueDate'])) &&
    (obj['completedAt'] === null || isValidDateString(obj['completedAt'])) &&
    isValidPriority(obj['priority']) &&
    isArray(obj['labels'], isValidLabel) &&
    isArray(obj['subTasks'], isValidSubTask) &&
    isArray(obj['files'], isValidFileAttachment) &&
    (obj['recurrence'] === undefined ||
      isValidRecurrenceConfig(obj['recurrence'])) &&
    (obj['recurrenceId'] === undefined || isString(obj['recurrenceId'])) &&
    (obj['occurrenceCount'] === undefined || isNumber(obj['occurrenceCount']))
  );
};

// Column型の検証
export const isValidColumn = (
  value: unknown
): value is import('../types').Column => {
  if (!isObject(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;

  return (
    isValidColumnId(obj['id']) &&
    isString(obj['title']) &&
    (obj['title'] as string).length > 0 &&
    isArray(obj['tasks'], isValidTask) &&
    (obj['color'] === undefined || isString(obj['color']))
  );
};

// KanbanBoard型の検証
export const isValidKanbanBoard = (value: unknown): value is KanbanBoard => {
  if (!isObject(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;

  return (
    isValidBoardId(obj['id']) &&
    isString(obj['title']) &&
    (obj['title'] as string).length > 0 &&
    isArray(obj['columns'], isValidColumn) &&
    isArray(obj['labels'], isValidLabel) &&
    isValidDateString(obj['createdAt']) &&
    isValidDateString(obj['updatedAt'])
  );
};

// 型安全なJSONパース
export const parseTypedJSON = <T>(
  jsonString: string,
  validator: (value: unknown) => value is T
): T | null => {
  try {
    const parsed = JSON.parse(jsonString);
    return validator(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

// エラーハンドリング付きの型チェック
export const assertType = <T>(
  value: unknown,
  validator: (value: unknown) => value is T,
  errorMessage: string
): T => {
  if (!validator(value)) {
    throw new TypeError(errorMessage);
  }
  return value;
};

// 配列の型安全な検証
export const validateArray = <T>(
  array: unknown[],
  validator: (item: unknown) => item is T
): { valid: T[]; invalid: unknown[] } => {
  const valid: T[] = [];
  const invalid: unknown[] = [];

  array.forEach(item => {
    if (validator(item)) {
      valid.push(item);
    } else {
      invalid.push(item);
    }
  });

  return { valid, invalid };
};

// デバッグ用の型情報取得
export const getTypeInfo = (value: unknown): string => {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (Array.isArray(value)) {
    return `Array<${value.length}>`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    return `Object{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? ', ...' : ''}}`;
  }
  return typeof value;
};
