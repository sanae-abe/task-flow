import { z } from 'zod';

/**
 * Priority Schema
 */
export const prioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

/**
 * Recurrence Pattern Schema
 */
export const recurrencePatternSchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'yearly',
]);

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
 * SubTask Schema
 */
export const subTaskSchema = z.object({
  id: z.string().min(1, 'サブタスクIDは必須です'),
  title: z
    .string()
    .min(1, 'サブタスクタイトルは必須です')
    .max(200, 'サブタスクタイトルは200文字以内で入力してください'),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
});

/**
 * File Attachment Schema
 */
export const fileAttachmentSchema = z.object({
  id: z.string().min(1, 'ファイルIDは必須です'),
  name: z
    .string()
    .min(1, 'ファイル名は必須です')
    .max(255, 'ファイル名は255文字以内で入力してください'),
  type: z.string().min(1, 'ファイルタイプは必須です'),
  size: z
    .number()
    .min(0)
    .max(5 * 1024 * 1024, 'ファイルサイズは5MBまでです'),
  data: z.string().min(1, 'ファイルデータは必須です'),
  uploadedAt: z.string().datetime(),
});

/**
 * Recurrence Config Schema
 */
export const recurrenceConfigSchema = z
  .object({
    enabled: z.boolean(),
    pattern: recurrencePatternSchema,
    interval: z.number().min(1, '間隔は1以上である必要があります').max(365),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    weekOfMonth: z.number().min(-1).max(5).optional(),
    dayOfWeekInMonth: z.number().min(0).max(6).optional(),
    endDate: z.string().datetime().optional(),
    maxOccurrences: z.number().min(1).optional(),
  })
  .refine(
    data => {
      if (
        data.pattern === 'weekly' &&
        data.daysOfWeek &&
        data.daysOfWeek.length === 0
      ) {
        return false;
      }
      return true;
    },
    {
      message: '週次繰り返しの場合は曜日を指定してください',
      path: ['daysOfWeek'],
    }
  );

/**
 * Task Schema (完全版)
 */
export const taskSchema = z.object({
  id: z.string().min(1, 'タスクIDは必須です'),
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以内で入力してください'),
  description: z.string().max(5000, '説明は5000文字以内で入力してください'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  dueDate: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  priority: prioritySchema.optional(),
  labels: z.array(labelSchema),
  subTasks: z.array(subTaskSchema),
  files: z.array(fileAttachmentSchema),
  recurrence: recurrenceConfigSchema.optional(),
  recurrenceId: z.string().optional(),
  occurrenceCount: z.number().min(0).optional(),
  deletionState: z.enum(['active', 'deleted']).optional(),
  deletedAt: z.string().datetime().nullable().optional(),
});

/**
 * Task Create Input Schema (作成用の簡略版)
 */
export const taskCreateInputSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以内で入力してください'),
  description: z
    .string()
    .max(5000, '説明は5000文字以内で入力してください')
    .optional(),
  dueDate: z.string().datetime().nullable().optional(),
  priority: prioritySchema.optional(),
  labels: z.array(labelSchema).optional(),
  files: z.array(fileAttachmentSchema).optional(),
  recurrence: recurrenceConfigSchema.optional(),
});

/**
 * Task Update Input Schema (更新用の部分版)
 */
export const taskUpdateInputSchema = taskSchema
  .partial()
  .required({ id: true });

/**
 * 型推論用のエクスポート
 */
export type TaskSchemaType = z.infer<typeof taskSchema>;
export type TaskCreateInputSchemaType = z.infer<typeof taskCreateInputSchema>;
export type TaskUpdateInputSchemaType = z.infer<typeof taskUpdateInputSchema>;
export type LabelSchemaType = z.infer<typeof labelSchema>;
export type SubTaskSchemaType = z.infer<typeof subTaskSchema>;
export type FileAttachmentSchemaType = z.infer<typeof fileAttachmentSchema>;
export type RecurrenceConfigSchemaType = z.infer<typeof recurrenceConfigSchema>;
export type PrioritySchemaType = z.infer<typeof prioritySchema>;
