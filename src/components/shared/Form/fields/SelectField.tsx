/**
 * セレクト入力フィールドコンポーネント
 *
 * select 入力タイプに対応
 */

import React, { useCallback } from "react";
import { cn } from '@/lib/utils';
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

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
      <NativeSelect
        id={id}
        name={name}
        value={toStringValue(value)}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        autoFocus={autoFocus}
        disabled={disabled}
        className={cn(
          "w-full"
        )}
        style={sx ? (sx as React.CSSProperties) : undefined}
        aria-required={validation?.required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      >
        {placeholder && <NativeSelectOption value="">{placeholder}</NativeSelectOption>}
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    );
  },
);

// デバッグ用のdisplayName設定
SelectField.displayName = "SelectField";
