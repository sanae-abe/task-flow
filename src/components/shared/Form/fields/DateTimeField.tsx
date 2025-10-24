/**
 * 日付・時刻入力フィールドコンポーネント
 *
 * date, datetime-local, time 入力タイプに対応
 */

import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';

import {
  toStringValue,
} from "../../../../utils/formHelpers";
import type { DateTimeFieldProps } from "./types";

/**
 * 日付・時刻入力フィールドコンポーネント
 *
 * @param props - DateTimeFieldのプロパティ
 * @returns 日付・時刻入力フィールドのReactエレメント
 */
export const DateTimeField: React.FC<DateTimeFieldProps> = React.memo(
  ({
    id,
    name,
    type,
    value,
    onChange,
    onKeyDown,
    onBlur,
    onFocus,
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

    return (
      <Input
        id={id}
        name={name}
        type={type}
        value={toStringValue(value)}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        autoFocus={autoFocus}
        disabled={disabled}
        className={cn(
          hasError && "border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
        style={sx ? (sx as React.CSSProperties) : undefined}
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
DateTimeField.displayName = "DateTimeField";
