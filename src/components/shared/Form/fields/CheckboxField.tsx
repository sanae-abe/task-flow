/**
 * チェックボックス入力フィールドコンポーネント
 *
 * checkbox 入力タイプに対応
 */

import React, { useCallback } from "react";
import { Checkbox } from "@primer/react";

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
    error,
    touched,
  }) => {
    /**
     * チェック状態変更ハンドラー
     */
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
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
    const hasError = Boolean(touched && error);

    return (
      <Checkbox
        name={name}
        checked={Boolean(value)}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        aria-required={validation?.required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />
    );
  },
);

// デバッグ用のdisplayName設定
CheckboxField.displayName = "CheckboxField";
