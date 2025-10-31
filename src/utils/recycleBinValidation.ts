import { RETENTION_DAYS_LIMITS, MESSAGES } from '../constants/recycleBin';
import type { RecycleBinSettings } from '../types/settings';

/**
 * ゴミ箱設定のバリデーション結果
 */
export interface ValidationResult {
  isValid: boolean;
  _error?: string;
}

/**
 * 保持期間の値をバリデーション
 */
export const validateRetentionDays = (
  days: number | null
): ValidationResult => {
  // 無制限の場合は有効
  if (days === null) {
    return { isValid: true };
  }

  // 数値の型チェック
  if (!Number.isInteger(days)) {
    return {
      isValid: false,
      _error: MESSAGES.VALIDATION.REQUIRED_INTEGER,
    };
  }

  // 最小値チェック
  if (days < RETENTION_DAYS_LIMITS.MIN) {
    return {
      isValid: false,
      _error: MESSAGES.VALIDATION.MIN_DAYS,
    };
  }

  // 最大値チェック
  if (days > RETENTION_DAYS_LIMITS.MAX) {
    return {
      isValid: false,
      _error: MESSAGES.VALIDATION.MAX_DAYS,
    };
  }

  return { isValid: true };
};

/**
 * 文字列入力値をバリデーション
 */
export const validateRetentionDaysInput = (value: string): ValidationResult => {
  // 空文字列は無制限として有効
  if (value.trim() === '') {
    return { isValid: true };
  }

  const days = parseInt(value, 10);

  // 数値変換チェック
  if (isNaN(days)) {
    return {
      isValid: false,
      _error: MESSAGES.VALIDATION.INVALID_NUMBER,
    };
  }

  return validateRetentionDays(days);
};

/**
 * ゴミ箱設定全体をバリデーション
 */
export const validateRecycleBinSettings = (
  settings: RecycleBinSettings
): ValidationResult => validateRetentionDays(settings.retentionDays);

/**
 * 入力値を安全な値に変換
 */
export const sanitizeRetentionDaysInput = (value: string): number | null => {
  const trimmed = value.trim();

  // 空文字列は無制限
  if (trimmed === '') {
    return null;
  }

  const days = parseInt(trimmed, 10);

  // 無効な数値の場合は null を返す
  if (isNaN(days)) {
    return null;
  }

  // 範囲内に収める
  if (days < RETENTION_DAYS_LIMITS.MIN) {
    return RETENTION_DAYS_LIMITS.MIN;
  }

  if (days > RETENTION_DAYS_LIMITS.MAX) {
    return RETENTION_DAYS_LIMITS.MAX;
  }

  return days;
};

/**
 * バリデーション結果をUIに適した形式で取得
 */
export const getValidationMessage = (value: string): string | null => {
  const result = validateRetentionDaysInput(value);
  return result.isValid ? null : result._error || null;
};
