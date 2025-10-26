/**
 * チェックボックス入力フィールドコンポーネント
 *
 * checkbox 入力タイプに対応
 */

import React, { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/lib/utils';

import type { CheckboxFieldProps } from "./types";

/**
 * チェックボックス入力フィールドコンポーネント
 *
 * @param props - CheckboxFieldのプロパティ
 * @returns チェックボックス入力フィールドのReactエレメント
 */
export const CheckboxField: React.FC<CheckboxFieldProps> = React.memo(
  ({
    id,
    name,
    value,
    onChange,
    onBlur,
    onFocus,
    disabled = false,
    validation,
    _error,
    touched,
  }) => {
    /**
     * チェック状態変更ハンドラー
     */
    const handleChange = useCallback(
      (checked: boolean) => {
        onChange(checked);
      },
      [onChange],
    );

    /**
     * ブラーハンドラー
     */
    const handleBlur = useCallback(() => {
      if (onBlur) {
        onBlur();
      }
    }, [onBlur]);

    /**
     * フォーカスハンドラー
     */
    const handleFocus = useCallback(() => {
      if (onFocus) {
        onFocus();
      }
    }, [onFocus]);

    // エラー状態の判定
    const hasError = Boolean(touched && _error);

    return (
      <Checkbox
        id={id}
        name={name}
        checked={Boolean(value)}
        onCheckedChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        className={cn(
          hasError && "border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
        aria-required={validation?.required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-_error` : undefined}
      />
    );
  },
);

// デバッグ用のdisplayName設定
CheckboxField.displayName = "CheckboxField";
