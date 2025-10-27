/**
 * Task validation hook
 *
 * This hook manages form validation logic including
 * title validation and overall form state validation.
 */

import { useMemo } from 'react';
import type { UseTaskFormStateReturn } from './useTaskFormState';

export interface UseTaskValidationProps {
  formState: UseTaskFormStateReturn;
}

export interface UseTaskValidationReturn {
  isValid: boolean;
  validationErrors: {
    title?: string;
    description?: string;
    dueDate?: string;
    // Add more validation fields as needed
  };
}

export const useTaskValidation = ({
  formState,
}: UseTaskValidationProps): UseTaskValidationReturn => {
  // フォームの有効性をチェック
  const isValid = useMemo(() => formState.title.trim().length > 0, [formState.title]);

  // バリデーションエラーメッセージ
  const validationErrors = useMemo(() => {
    const errors: UseTaskValidationReturn['validationErrors'] = {};

    // タイトルのバリデーション
    if (formState.title.trim().length === 0) {
      errors.title = 'タイトルは必須です';
    } else if (formState.title.trim().length > 100) {
      errors.title = 'タイトルは100文字以内で入力してください';
    }

    // 説明のバリデーション（オプション）
    if (formState.description.length > 1000) {
      errors.description = '説明は1000文字以内で入力してください';
    }

    // 期限のバリデーション（オプション）
    if (formState.dueDate && formState.hasTime && !formState.dueTime) {
      errors.dueDate = '時刻設定が有効な場合は時刻を入力してください';
    }

    return errors;
  }, [formState.title, formState.description, formState.dueDate, formState.hasTime, formState.dueTime]);

  return {
    isValid,
    validationErrors,
  };
};