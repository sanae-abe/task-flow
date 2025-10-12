/**
 * セレクト入力フィールドコンポーネント
 *
 * select 入力タイプに対応
 */

import React, { useCallback } from "react";
import { Select } from "@primer/react";

import {
  toStringValue,
  getValidationStatus,
} from "../../../../utils/formHelpers";
import { UNIFIED_FORM_STYLES } from "../styles";
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
    const validationStatus = getValidationStatus(hasError);

    return (
      <Select
        name={name}
        value={toStringValue(value)}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        autoFocus={autoFocus}
        disabled={disabled}
        sx={{ ...UNIFIED_FORM_STYLES.input, ...sx }}
        validationStatus={validationStatus}
        aria-required={validation?.required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      >
        {placeholder && <Select.Option value="">{placeholder}</Select.Option>}
        {options.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    );
  },
);

// デバッグ用のdisplayName設定
SelectField.displayName = "SelectField";
