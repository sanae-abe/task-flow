/**
 * テキストエリア入力フィールドコンポーネント
 *
 * textarea 入力タイプに対応
 */

import React, { useCallback } from "react";
import { Textarea } from "@primer/react";

import {
  toStringValue,
  getValidationStatus,
} from "../../../../utils/formHelpers";
import { UNIFIED_FORM_STYLES } from "../styles";
import type { TextareaFieldProps } from "./types";

/**
 * テキストエリア入力フィールドコンポーネント
 *
 * @param props - TextareaFieldのプロパティ
 * @returns テキストエリア入力フィールドのReactエレメント
 */
export const TextareaField: React.FC<TextareaFieldProps> = React.memo(
  ({
    id,
    name,
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
    rows = 3,
  }) => {
    /**
     * 入力値変更ハンドラー
     */
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      <Textarea
        name={name}
        value={toStringValue(value)}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        sx={{
          ...UNIFIED_FORM_STYLES.input,
          resize: "none",
          height: `${rows * 20 + 16}px`,
          ...sx,
        }}
        validationStatus={validationStatus}
        aria-required={validation?.required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />
    );
  },
);

// デバッグ用のdisplayName設定
TextareaField.displayName = "TextareaField";
