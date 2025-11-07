import { z } from 'zod';
import { taskSchema } from './task';

/**
 * Column Schema
 */
export const columnSchema = z.object({
  id: z.string().min(1, 'カラムIDは必須です'),
  title: z
    .string()
    .min(1, 'カラムタイトルは必須です')
    .max(100, 'カラムタイトルは100文字以内で入力してください'),
  tasks: z.array(taskSchema),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '有効なカラーコードを入力してください')
    .optional(),
  deletionState: z.enum(['active', 'deleted']).optional(),
  deletedAt: z.string().datetime().nullable().optional(),
});

/**
 * Board Schema
 */
export const boardSchema = z.object({
  id: z.string().min(1, 'ボードIDは必須です'),
  title: z
    .string()
    .min(1, 'ボードタイトルは必須です')
    .max(100, 'ボードタイトルは100文字以内で入力してください'),
  columns: z.array(columnSchema),
  labels: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1).max(50),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    })
  ),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletionState: z.enum(['active', 'deleted']).optional(),
  deletedAt: z.string().datetime().nullable().optional(),
});

/**
 * Board Create Input Schema
 */
export const boardCreateInputSchema = z.object({
  title: z
    .string()
    .min(1, 'ボードタイトルは必須です')
    .max(100, 'ボードタイトルは100文字以内で入力してください'),
});

/**
 * Board Update Input Schema
 */
export const boardUpdateInputSchema = z.object({
  id: z.string().min(1),
  title: z
    .string()
    .min(1, 'ボードタイトルは必須です')
    .max(100, 'ボードタイトルは100文字以内で入力してください')
    .optional(),
});

/**
 * Column Create Input Schema
 */
export const columnCreateInputSchema = z.object({
  title: z
    .string()
    .min(1, 'カラムタイトルは必須です')
    .max(100, 'カラムタイトルは100文字以内で入力してください'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '有効なカラーコードを入力してください')
    .optional(),
});

/**
 * Column Update Input Schema
 */
export const columnUpdateInputSchema = z.object({
  id: z.string().min(1),
  title: z
    .string()
    .min(1, 'カラムタイトルは必須です')
    .max(100, 'カラムタイトルは100文字以内で入力してください')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '有効なカラーコードを入力してください')
    .optional(),
});

/**
 * 型推論用のエクスポート
 */
export type ColumnSchemaType = z.infer<typeof columnSchema>;
export type BoardSchemaType = z.infer<typeof boardSchema>;
export type BoardCreateInputSchemaType = z.infer<typeof boardCreateInputSchema>;
export type BoardUpdateInputSchemaType = z.infer<typeof boardUpdateInputSchema>;
export type ColumnCreateInputSchemaType = z.infer<
  typeof columnCreateInputSchema
>;
export type ColumnUpdateInputSchemaType = z.infer<
  typeof columnUpdateInputSchema
>;
