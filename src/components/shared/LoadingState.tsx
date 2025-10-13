import { Spinner } from '@primer/react';
import { memo } from 'react';

import type { LoadingStateSize, LoadingStateVariant } from '../../types/shared';
import { CenterBox, VBox } from './FlexBox';

interface LoadingStateProps {
  /** ローディング状態 */
  isLoading: boolean;
  /** 子要素（ローディング中は非表示） */
  children: React.ReactNode;
  /** ローディングテキスト */
  loadingText?: string;
  /** スピナーのサイズ */
  size?: LoadingStateSize;
  /** ローディング状態のバリアント */
  variant?: LoadingStateVariant;
  /** 最小高さ */
  minHeight?: string | number;
  /** 追加のCSS */
  sx?: Record<string, unknown>;
}

/**
 * 統一されたローディング状態コンポーネント
 * 
 * ローディング中はスピナーを表示し、完了後は子要素を表示します。
 * 一貫したローディングUXを提供します。
 */
const LoadingState = memo<LoadingStateProps>(({
  isLoading,
  children,
  loadingText = '読み込み中...',
  size = 'medium',
  variant = 'default',
  minHeight = '200px',
  sx
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  // サイズ別のスピナー設定
  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return { size: 'small' as const, fontSize: 1 };
      case 'large':
        return { size: 'large' as const, fontSize: 3 };
      default:
        return { size: 'medium' as const, fontSize: 2 };
    }
  };

  // バリアント別のスタイル
  const getVariantStyles = () => {
    switch (variant) {
      case 'overlay':
        return {
          position: 'absolute' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: 'canvas.overlay',
          zIndex: 100
        };
      case 'inline':
        return {
          py: 4,
          px: 3
        };
      default:
        return {
          minHeight,
          bg: 'canvas.subtle',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'border.default'
        };
    }
  };

  const spinnerConfig = getSpinnerSize();
  const variantStyles = getVariantStyles();

  return (
    <CenterBox
      sx={{
        ...variantStyles,
        ...sx
      }}
    >
      <VBox align="center" gap={3}>
        <Spinner size={spinnerConfig.size} />
        {loadingText && (
          <span
            style={{
              fontSize: `var(--text-body-size-${spinnerConfig.fontSize})`,
              color: 'var(--fgColor-muted)',
              textAlign: 'center'
            }}
          >
            {loadingText}
          </span>
        )}
      </VBox>
    </CenterBox>
  );
});

LoadingState.displayName = 'LoadingState';

export default LoadingState;

// 便利なプリセットコンポーネント

/**
 * オーバーレイ型のローディング状態
 */
export const LoadingOverlay = memo<Omit<LoadingStateProps, 'variant'>>(({ children, ...props }) => (
  <LoadingState variant="overlay" {...props}>
    {children}
  </LoadingState>
));

/**
 * インライン型のローディング状態
 */
export const InlineLoading = memo<Omit<LoadingStateProps, 'variant'>>(({ children, ...props }) => (
  <LoadingState variant="inline" {...props}>
    {children}
  </LoadingState>
));

/**
 * 小さなローディングスピナー
 */
export const SmallLoading = memo<Omit<LoadingStateProps, 'size'>>(({ children, ...props }) => (
  <LoadingState size="small" {...props}>
    {children}
  </LoadingState>
));

LoadingOverlay.displayName = 'LoadingOverlay';
InlineLoading.displayName = 'InlineLoading';
SmallLoading.displayName = 'SmallLoading';