/**
 * テキスト系入力フィールドコンポーネント
 *
 * text, email, password, number 入力タイプに対応
 */

import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { toStringValue } from '../../../../utils/formHelpers';
import type { TextFieldProps } from './types';

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
    _error,
    touched,
    style,
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
      [onChange]
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
      [onKeyDown]
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
      <Input
        id={id}
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
        className={cn(
          hasError &&
            'border-destructive focus:border-destructive focus:ring-destructive'
        )}
        style={style ? (style as React.CSSProperties) : undefined}
        aria-required={validation?.required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-_error` : undefined}
        {...(step !== undefined ? { step: String(step) } : {})}
        {...(min !== undefined ? { min: String(min) } : {})}
        {...(max !== undefined ? { max: String(max) } : {})}
      />
    );
  }
);

// デバッグ用のdisplayName設定
TextField.displayName = 'TextField';
