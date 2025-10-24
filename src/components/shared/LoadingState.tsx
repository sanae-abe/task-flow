import { Loader2 } from 'lucide-react';
import { memo } from 'react';
import { cn } from '@/lib/utils';

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
  const getSpinnerConfig = () => {
    switch (size) {
      case 'small':
        return { iconSize: 16, textClass: 'text-sm' };
      case 'large':
        return { iconSize: 32, textClass: 'text-lg' };
      default:
        return { iconSize: 24, textClass: 'text-base' };
    }
  };

  // バリアント別のスタイル
  const getVariantStyles = () => {
    switch (variant) {
      case 'overlay':
        return {
          className: 'absolute inset-0 bg-white/80 z-[100]',
          style: {}
        };
      case 'inline':
        return {
          className: 'py-4 px-3',
          style: {}
        };
      default:
        return {
          className: 'bg-gray-50 rounded-md border border-gray-200',
          style: { minHeight }
        };
    }
  };

  const spinnerConfig = getSpinnerConfig();
  const variantStyles = getVariantStyles();

  return (
    <CenterBox
      className={variantStyles.className}
      style={{
        ...variantStyles.style,
        ...sx as React.CSSProperties
      }}
    >
      <VBox align="center" gap={3}>
        <Loader2
          size={spinnerConfig.iconSize}
          className="animate-spin text-gray-600"
        />
        {loadingText && (
          <span className={cn(
            spinnerConfig.textClass,
            'text-gray-500 text-center'
          )}>
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