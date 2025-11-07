/**
 * Zod統合型ガード
 *
 * Zodスキーマを使用したランタイム型検証とTypeScript型ガードの統合
 * TypeScript 5.7.3の型推論を最大限活用
 */

import type { z } from 'zod';
import {
  taskSchema,
  boardSchema,
  columnSchema,
  labelSchema,
  subTaskSchema,
  fileAttachmentSchema,
  recurrenceConfigSchema,
  prioritySchema,
  taskCreateInputSchema,
  taskUpdateInputSchema,
  boardCreateInputSchema,
  boardUpdateInputSchema,
  columnCreateInputSchema,
  columnUpdateInputSchema,
  labelCreateInputSchema,
  labelUpdateInputSchema,
} from '@/schemas';

import type {
  Task,
  KanbanBoard as Board,
  Column,
  Label,
  SubTask,
  FileAttachment,
  RecurrenceConfig,
  Priority,
} from '../types';

/**
 * Zodスキーマを使用した型ガード生成関数
 *
 * @param schema - Zodスキーマ
 * @returns 型ガード関数
 */
export function createZodTypeGuard<T>(
  schema: z.ZodSchema<T>
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    const result = schema.safeParse(value);
    return result.success;
  };
}

/**
 * Task型ガード（Zod統合版）
 */
export const isTask = createZodTypeGuard<Task>(taskSchema);

/**
 * Board型ガード（Zod統合版）
 */
export const isBoard = createZodTypeGuard<Board>(boardSchema);

/**
 * Column型ガード（Zod統合版）
 */
export const isColumn = createZodTypeGuard<Column>(columnSchema);

/**
 * Label型ガード（Zod統合版）
 */
export const isLabel = createZodTypeGuard<Label>(labelSchema);

/**
 * SubTask型ガード（Zod統合版）
 */
export const isSubTask = createZodTypeGuard<SubTask>(subTaskSchema);

/**
 * FileAttachment型ガード（Zod統合版）
 */
export const isFileAttachment =
  createZodTypeGuard<FileAttachment>(fileAttachmentSchema);

/**
 * RecurrenceConfig型ガード（Zod統合版）
 */
export const isRecurrenceConfig = createZodTypeGuard<RecurrenceConfig>(
  recurrenceConfigSchema
);

/**
 * Priority型ガード（Zod統合版）
 */
export const isPriority = createZodTypeGuard<Priority>(prioritySchema);

/**
 * TaskCreateInput型ガード
 */
export const isTaskCreateInput = createZodTypeGuard(taskCreateInputSchema);

/**
 * TaskUpdateInput型ガード
 */
export const isTaskUpdateInput = createZodTypeGuard(taskUpdateInputSchema);

/**
 * BoardCreateInput型ガード
 */
export const isBoardCreateInput = createZodTypeGuard(boardCreateInputSchema);

/**
 * BoardUpdateInput型ガード
 */
export const isBoardUpdateInput = createZodTypeGuard(boardUpdateInputSchema);

/**
 * ColumnCreateInput型ガード
 */
export const isColumnCreateInput = createZodTypeGuard(columnCreateInputSchema);

/**
 * ColumnUpdateInput型ガード
 */
export const isColumnUpdateInput = createZodTypeGuard(columnUpdateInputSchema);

/**
 * LabelCreateInput型ガード
 */
export const isLabelCreateInput = createZodTypeGuard(labelCreateInputSchema);

/**
 * LabelUpdateInput型ガード
 */
export const isLabelUpdateInput = createZodTypeGuard(labelUpdateInputSchema);

/**
 * 配列型ガード生成関数
 *
 * @param itemGuard - 要素の型ガード
 * @returns 配列の型ガード関数
 */
export function createArrayTypeGuard<T>(
  itemGuard: (value: unknown) => value is T
): (value: unknown) => value is T[] {
  return (value: unknown): value is T[] => {
    if (!Array.isArray(value)) {
      return false;
    }
    return value.every(itemGuard);
  };
}

/**
 * Task配列型ガード
 */
export const isTaskArray = createArrayTypeGuard(isTask);

/**
 * Label配列型ガード
 */
export const isLabelArray = createArrayTypeGuard(isLabel);

/**
 * SubTask配列型ガード
 */
export const isSubTaskArray = createArrayTypeGuard(isSubTask);

/**
 * FileAttachment配列型ガード
 */
export const isFileAttachmentArray = createArrayTypeGuard(isFileAttachment);

/**
 * 型安全なassert関数
 *
 * @param value - 検証対象の値
 * @param guard - 型ガード関数
 * @param errorMessage - エラーメッセージ
 * @throws {TypeError} 型ガードに失敗した場合
 */
export function assertType<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  errorMessage?: string
): asserts value is T {
  if (!guard(value)) {
    throw new TypeError(errorMessage || '型検証に失敗しました');
  }
}

/**
 * 型安全なキャスト関数
 *
 * @param value - キャスト対象の値
 * @param schema - Zodスキーマ
 * @returns キャスト結果（成功時はデータ、失敗時はnull）
 */
export function safeCast<T>(value: unknown, schema: z.ZodSchema<T>): T | null {
  const result = schema.safeParse(value);
  return result.success ? result.data : null;
}

/**
 * 型安全なキャストまたはスロー
 *
 * @param value - キャスト対象の値
 * @param schema - Zodスキーマ
 * @param errorMessage - エラーメッセージ
 * @returns キャストされた値
 * @throws {TypeError} キャストに失敗した場合
 */
export function castOrThrow<T>(
  value: unknown,
  schema: z.ZodSchema<T>,
  errorMessage?: string
): T {
  const result = schema.safeParse(value);
  if (result.success) {
    return result.data;
  }

  const errors = result.error.issues.map(issue => issue.message).join(', ');
  throw new TypeError(errorMessage || `型キャストに失敗しました: ${errors}`);
}
