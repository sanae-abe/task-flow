import { z } from 'zod';

/**
 * Label Schema
 */
export const labelSchema = z.object({
  id: z.string().min(1, 'ラベルIDは必須です'),
  name: z
    .string()
    .min(1, 'ラベル名は必須です')
    .max(50, 'ラベル名は50文字以内で入力してください'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '有効なカラーコードを入力してください'),
});

/**
 * Label Create Input Schema
 */
export const labelCreateInputSchema = z.object({
  name: z
    .string()
    .min(1, 'ラベル名は必須です')
    .max(50, 'ラベル名は50文字以内で入力してください'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '有効なカラーコードを入力してください'),
});

/**
 * Label Update Input Schema
 */
export const labelUpdateInputSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .min(1, 'ラベル名は必須です')
    .max(50, 'ラベル名は50文字以内で入力してください')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '有効なカラーコードを入力してください')
    .optional(),
});

/**
 * Label with Board Info Schema (ボード情報付き)
 */
export const labelWithBoardInfoSchema = labelSchema.extend({
  boardId: z.string().optional(),
  boardName: z.string().optional(),
  usageCount: z.number().min(0).optional(),
});

/**
 * 型推論用のエクスポート
 */
export type LabelSchemaType = z.infer<typeof labelSchema>;
export type LabelCreateInputSchemaType = z.infer<typeof labelCreateInputSchema>;
export type LabelUpdateInputSchemaType = z.infer<typeof labelUpdateInputSchema>;
export type LabelWithBoardInfoSchemaType = z.infer<
  typeof labelWithBoardInfoSchema
>;
