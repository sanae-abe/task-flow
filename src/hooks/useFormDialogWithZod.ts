import { useState, useEffect, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { getFieldErrors } from '@/schemas/validation-utils';

interface UseFormDialogWithZodProps<T extends z.ZodSchema> {
  isOpen: boolean;
  initialValue?: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  schema?: T;
  required?: boolean;
  minLength?: number;
}

interface UseFormDialogWithZodReturn {
  value: string;
  setValue: (value: string) => void;
  handleSave: () => void;
  handleKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  isValid: boolean;
  reset: () => void;
  errors: string[];
  fieldErrors: Record<string, string>;
}

/**
 * Zod対応フォームダイアログフック
 *
 * SimpleFormDialogなどで使用される、単一入力フィールドのバリデーション付きフック
 *
 * @param props - フック設定オブジェクト
 * @returns フォーム操作とバリデーション結果
 */
export const useFormDialogWithZod = <T extends z.ZodSchema>({
  isOpen,
  initialValue = '',
  onSave,
  onCancel,
  schema,
  required = true,
  minLength = 1,
}: UseFormDialogWithZodProps<T>): UseFormDialogWithZodReturn => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Zodバリデーション
  const validationResult = useMemo(() => {
    if (!schema) {
      // スキーマが指定されていない場合は従来のバリデーション
      const trimmedValue = value.trim();
      const isBasicValid = !required || trimmedValue.length >= minLength;

      return {
        isValid: isBasicValid,
        errors: isBasicValid
          ? []
          : [
              `入力値は必須です。${
                minLength > 1 ? `${minLength}文字以上入力してください。` : ''
              }`,
            ],
        fieldErrors: {},
      };
    }

    const result = schema.safeParse(value.trim());

    if (result.success) {
      return {
        isValid: true,
        errors: [],
        fieldErrors: {},
      };
    }

    const errors = result.error.issues.map(err => err.message);
    const fieldErrors = getFieldErrors(schema, value.trim());

    return {
      isValid: false,
      errors,
      fieldErrors,
    };
  }, [value, schema, required, minLength]);

  const handleSave = useCallback(() => {
    if (!validationResult.isValid) {
      return;
    }

    const trimmedValue = value.trim();

    try {
      onSave(trimmedValue);
    } catch (_error) {
      // eslint-disable-next-line no-console
      console.error('Error saving form data:', _error);
    }
  }, [value, validationResult.isValid, onSave]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        // Enterキーでの自動保存を無効化
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
    },
    [onCancel]
  );

  return {
    value,
    setValue,
    handleSave,
    handleKeyPress,
    isValid: validationResult.isValid,
    reset,
    errors: validationResult.errors,
    fieldErrors: validationResult.fieldErrors,
  };
};
