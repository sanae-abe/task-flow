/**
 * フォーム関連のヘルパー関数
 */

/**
 * unknown型の値を安全にstring型に変換する
 *
 * @param value - 変換する値
 * @returns string型の値。null/undefinedの場合は空文字
 *
 * @example
 * ```typescript
 * toStringValue(null)      // ""
 * toStringValue(undefined) // ""
 * toStringValue(123)       // "123"
 * toStringValue("hello")   // "hello"
 * toStringValue(true)      // "true"
 * ```
 */
export const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
};

/**
 * フォームの値が空かどうかを判定する
 *
 * @param value - チェックする値
 * @returns 空の場合はtrue、値がある場合はfalse
 */
export const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
};

/**
 * バリデーションエラーを表示すべきかどうかを判定する
 *
 * @param touched - フィールドがタッチされたかどうか
 * @param error - エラーメッセージ
 * @returns エラーを表示すべき場合はtrue
 */
export const shouldShowError = (
  touched?: boolean,
  error?: string | null,
): boolean => Boolean(touched && error);

/**
 * Primer ReactのvalidationStatusを取得する
 *
 * @param hasError - エラーがあるかどうか
 * @returns validationStatus
 */
export const getValidationStatus = (hasError: boolean): "error" | undefined =>
  hasError ? "error" : undefined;
