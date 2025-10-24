/**
 * セレクト入力フィールドコンポーネント
 *
 * select 入力タイプに対応
 */

import React, { useCallback } from "react";
import { cn } from '@/lib/utils';

import {
  toStringValue,
} from "../../../../utils/formHelpers";
import type { SelectFieldProps } from "./types";

/**
 * セレクト入力フィールドコンポーネント
 *
 * @param props - SelectFieldのプロパティ
 * @returns セレクト入力フィールドのReactエレメント
 */
export const SelectField: React.FC<SelectFieldProps> = React.memo(
  ({
    id,
    name,
    value,
    onChange,
    onBlur,
    onFocus,
    placeholder,
    autoFocus = false,
    disabled = false,
    validation,
    error,
    touched,
    sx,
    options = [],
  }) => {
    /**
     * 選択値変更ハンドラー
     */
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
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
      <select
        id={id}
        name={name}
        value={toStringValue(value)}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        autoFocus={autoFocus}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          hasError && "border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
        style={sx ? (sx as React.CSSProperties) : undefined}
        aria-required={validation?.required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  },
);

// デバッグ用のdisplayName設定
SelectField.displayName = "SelectField";
