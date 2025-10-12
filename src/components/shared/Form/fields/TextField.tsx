/**
 * テキスト系入力フィールドコンポーネント
 *
 * text, email, password, number 入力タイプに対応
 */

import React, { useCallback } from "react";
import { TextInput } from "@primer/react";

import {
  toStringValue,
  getValidationStatus,
} from "../../../../utils/formHelpers";
import { UNIFIED_FORM_STYLES } from "../styles";
import type { TextFieldProps } from "./types";

/**
 * テキスト系入力フィールドコンポーネント
 *
 * @param props - TextFieldのプロパティ
 * @returns テキスト入力フィールドのReactエレメント
 */
export const TextField: React.FC<TextFieldProps> = React.memo(
  ({
    id,
    name,
    type,
    value,
    onChange,
    onKeyDown,
    onBlur,
    onFocus,
    placeholder,
    autoFocus = false,
    disabled = false,
    validation,
    error,
    touched,
    sx,
    step,
    min,
    max,
  }) => {
    /**
     * 入力値変更ハンドラー
     */
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      },
      [onChange],
    );

    /**
     * キーダウンハンドラー
     */
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (onKeyDown) {
          onKeyDown(e);
        }
      },
      [onKeyDown],
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
      <TextInput
        name={name}
        type={type}
        value={toStringValue(value)}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        sx={{ ...UNIFIED_FORM_STYLES.input, ...sx }}
        validationStatus={validationStatus}
        aria-required={validation?.required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        {...(step ? { step } : {})}
        {...(min ? { min } : {})}
        {...(max ? { max } : {})}
      />
    );
  },
);

// デバッグ用のdisplayName設定
TextField.displayName = "TextField";
