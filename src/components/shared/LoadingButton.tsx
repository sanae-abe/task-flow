import React from "react";
import { Button, Spinner, type ButtonProps } from "@primer/react";

export interface LoadingButtonProps extends Omit<ButtonProps, 'children' | 'aria-busy' | 'aria-describedby'> {
  /** ローディング状態 */
  isLoading: boolean;
  /** ローディング中に表示するテキスト */
  loadingText?: string;
  /** 通常時に表示するテキスト */
  children: React.ReactNode;
  /** スピナーのサイズ */
  spinnerSize?: 'small' | 'medium' | 'large';
  /** アクセシビリティ: ローディング状態の説明テキストのID */
  loadingDescribedBy?: string;
  /** アクセシビリティ: ローディング完了を知らせるライブリージョンのID */
  liveRegionId?: string;
}

/**
 * ローディング状態を表示できるボタンコンポーネント
 * ローディング中はスピナーを表示し、ボタンを無効化
 * アクセシビリティ対応済み（aria-busy、aria-describedby等）
 */
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText,
  children,
  spinnerSize = 'small',
  disabled,
  loadingDescribedBy,
  liveRegionId,
  ...buttonProps
}) => {
  const displayText = isLoading ? (loadingText || children) : children;
  const ariaDescribedBy = isLoading && loadingDescribedBy ? loadingDescribedBy : undefined;

  return (
    <Button
      {...buttonProps}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-describedby={ariaDescribedBy}
      aria-live={liveRegionId ? undefined : 'polite'}
    >
      {isLoading ? (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          role="status"
          aria-label={typeof loadingText === 'string' ? loadingText : "読み込み中"}
        >
          <Spinner
            size={spinnerSize}
            aria-hidden="true"
          />
          {displayText}
        </span>
      ) : (
        children
      )}
    </Button>
  );
};