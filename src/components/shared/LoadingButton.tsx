import React from "react";
import { Button, Spinner, type ButtonProps } from "@primer/react";

export interface LoadingButtonProps extends Omit<ButtonProps, 'children'> {
  /** ローディング状態 */
  isLoading: boolean;
  /** ローディング中に表示するテキスト */
  loadingText?: string;
  /** 通常時に表示するテキスト */
  children: React.ReactNode;
  /** スピナーのサイズ */
  spinnerSize?: 'small' | 'medium' | 'large';
}

/**
 * ローディング状態を表示できるボタンコンポーネント
 * ローディング中はスピナーを表示し、ボタンを無効化
 */
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText,
  children,
  spinnerSize = 'small',
  disabled,
  ...buttonProps
}) => (
    <Button
      {...buttonProps}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Spinner size={spinnerSize} />
          {loadingText || children}
        </span>
      ) : (
        children
      )}
    </Button>
  );