/**
 * Task validation hook with Zod integration
 *
 * This hook manages form validation logic using Zod schemas
 * for runtime type safety and comprehensive validation.
 */

import { useMemo } from 'react';
import { taskCreateInputSchema } from '@/schemas/task';
import { getFieldErrors } from '@/schemas/validation-utils';
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
    priority?: string;
    labels?: string;
    files?: string;
    recurrence?: string;
  };
}

export const useTaskValidation = ({
  formState,
}: UseTaskValidationProps): UseTaskValidationReturn => {
  // Zodスキーマを使ったバリデーション
  const validationResult = useMemo(() => {
    // バリデーション対象のデータを構築
    const taskData = {
      title: formState.title.trim(),
      description: formState.description,
      dueDate: formState.dueDate || null,
      priority: formState.priority,
      labels: formState.labels,
      files: formState.attachments,
      recurrence: formState.recurrence,
    };

    // Zodバリデーション実行
    const result = taskCreateInputSchema.safeParse(taskData);

    if (result.success) {
      return {
        isValid: true,
        errors: {},
      };
    }

    // エラーをフィールド別に整理
    const fieldErrors = getFieldErrors(taskCreateInputSchema, taskData);

    return {
      isValid: false,
      errors: fieldErrors,
    };
  }, [
    formState.title,
    formState.description,
    formState.dueDate,
    formState.priority,
    formState.labels,
    formState.attachments,
    formState.recurrence,
  ]);

  // 追加のカスタムバリデーション（Zodでカバーできない部分）
  const customValidationErrors = useMemo(() => {
    const errors: Partial<UseTaskValidationReturn['validationErrors']> = {};

    // 時刻設定のカスタムバリデーション
    if (formState.dueDate && formState.hasTime && !formState.dueTime) {
      errors.dueDate = '時刻設定が有効な場合は時刻を入力してください';
    }

    return errors;
  }, [formState.dueDate, formState.hasTime, formState.dueTime]);

  // Zodエラーとカスタムエラーを統合
  const validationErrors = useMemo(
    () => ({
      ...validationResult.errors,
      ...customValidationErrors,
    }),
    [validationResult.errors, customValidationErrors]
  );

  // 全体の有効性チェック
  const isValid = useMemo(
    () =>
      validationResult.isValid &&
      Object.keys(customValidationErrors).length === 0,
    [validationResult.isValid, customValidationErrors]
  );

  return {
    isValid,
    validationErrors,
  };
};
