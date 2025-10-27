/**
 * テキストエリア入力フィールドコンポーネント
 *
 * textarea 入力タイプに対応
 */

import React, { useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';

import {
  toStringValue,
} from "../../../../utils/formHelpers";
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
    _error,
    touched,
    style,
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
    const hasError = Boolean(touched && _error);

    return (
      <Textarea
        id={id}
        name={name}
        value={toStringValue(value)}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        rows={rows}
        className={cn(
          "resize-none",
          hasError && "border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
        style={style ? (style as React.CSSProperties) : undefined}
        aria-required={validation?.required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-_error` : undefined}
      />
    );
  },
);

// デバッグ用のdisplayName設定
TextareaField.displayName = "TextareaField";
