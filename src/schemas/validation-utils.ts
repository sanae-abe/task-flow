import { z } from 'zod';

/**
 * Validation Result Type
 */
export type ValidationResult<T> =
  | { success: true; data: T; errors: null }
  | { success: false; data: null; errors: string[] };

/**
 * データをバリデーションして成功/失敗を返す
 *
 * @param schema - Zodスキーマ
 * @param data - バリデーション対象のデータ
 * @returns バリデーション結果
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: null,
    };
  }

  const errors = result.error.issues.map(
    err => `${err.path.join('.')}: ${err.message}`
  );

  return {
    success: false,
    data: null,
    errors,
  };
}

/**
 * データをバリデーションして成功時はデータを返し、失敗時はエラーをスローする
 *
 * @param schema - Zodスキーマ
 * @param data - バリデーション対象のデータ
 * @returns バリデーション済みのデータ
 * @throws バリデーションエラー時に詳細なエラーメッセージをスロー
 */
export function validateDataOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  const errors = result.error.issues.map(
    err => `${err.path.join('.')}: ${err.message}`
  );

  throw new Error(`バリデーションエラー:\n${errors.join('\n')}`);
}

/**
 * バリデーションエラーを取得する（成功時は空配列）
 *
 * @param schema - Zodスキーマ
 * @param data - バリデーション対象のデータ
 * @returns エラーメッセージの配列
 */
export function getValidationErrors<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): string[] {
  const result = schema.safeParse(data);

  if (result.success) {
    return [];
  }

  return result.error.issues.map(
    err => `${err.path.join('.')}: ${err.message}`
  );
}

/**
 * フィールドごとのバリデーションエラーを取得する
 *
 * @param schema - Zodスキーマ
 * @param data - バリデーション対象のデータ
 * @returns フィールド名をキーとするエラーメッセージのマップ
 */
export function getFieldErrors<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Record<string, string> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {};
  }

  const fieldErrors: Record<string, string> = {};

  result.error.issues.forEach(err => {
    const path = err.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = err.message;
    }
  });

  return fieldErrors;
}

/**
 * 部分的なバリデーション（一部のフィールドのみバリデート）
 *
 * @param schema - Zodスキーマ
 * @param data - バリデーション対象のデータ
 * @returns バリデーション結果
 */
export function validatePartial<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown
): ValidationResult<Partial<z.infer<z.ZodObject<T>>>> {
  return validateData(schema.partial(), data) as ValidationResult<
    Partial<z.infer<z.ZodObject<T>>>
  >;
}

/**
 * 配列データのバリデーション
 *
 * @param schema - Zodスキーマ
 * @param data - バリデーション対象の配列データ
 * @returns バリデーション結果
 */
export function validateArray<T>(
  schema: z.ZodSchema<T>,
  data: unknown[]
): ValidationResult<T[]> {
  const arraySchema = z.array(schema);
  return validateData(arraySchema, data);
}

/**
 * 非同期バリデーション
 *
 * @param schema - Zodスキーマ
 * @param data - バリデーション対象のデータ
 * @returns バリデーション結果のPromise
 */
export async function validateDataAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<ValidationResult<T>> {
  try {
    const result = await schema.safeParseAsync(data);

    if (result.success) {
      return {
        success: true,
        data: result.data,
        errors: null,
      };
    }

    const errors = result.error.issues.map(
      err => `${err.path.join('.')}: ${err.message}`
    );

    return {
      success: false,
      data: null,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: [
        error instanceof Error
          ? error.message
          : 'バリデーションエラーが発生しました',
      ],
    };
  }
}

/**
 * 型安全なデータ変換
 *
 * スキーマに基づいてデータを安全に変換し、型を保証します
 *
 * @param schema - Zodスキーマ
 * @param data - 変換対象のデータ
 * @returns 変換されたデータまたはnull
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * バリデーションエラーの整形
 *
 * @param errors - エラーメッセージの配列
 * @returns 整形されたエラーメッセージ
 */
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) {
    return '';
  }

  if (errors.length === 1) {
    return errors[0];
  }

  return errors.map((err, index) => `${index + 1}. ${err}`).join('\n');
}

/**
 * ネストしたフィールドエラーの取得
 *
 * @param schema - Zodスキーマ
 * @param data - バリデーション対象のデータ
 * @returns ネストしたフィールドエラーのマップ
 */
export function getNestedFieldErrors<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Record<string, string[]> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {};
  }

  const nestedErrors: Record<string, string[]> = {};

  result.error.issues.forEach(err => {
    const path = err.path.join('.');
    if (!nestedErrors[path]) {
      nestedErrors[path] = [];
    }
    nestedErrors[path].push(err.message);
  });

  return nestedErrors;
}
