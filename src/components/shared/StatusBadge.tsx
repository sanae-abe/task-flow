import type { Icon } from '@primer/octicons-react';
import { Text } from '@primer/react';
import { memo } from 'react';

import type { StatusBadgeVariant, StatusBadgeSize } from '../../types/shared';

interface StatusBadgeProps {
  /** バッジのバリアント */
  variant: StatusBadgeVariant;
  /** バッジのサイズ */
  size?: StatusBadgeSize;
  /** アイコン（オプション） */
  icon?: Icon | React.ComponentType<{ size: number }>;
  /** バッジのテキスト */
  children: React.ReactNode;
  /** 追加のCSS */
  sx?: Record<string, unknown>;
}

/**
 * 統一された状態表示バッジコンポーネント
 * 
 * 期限、ラベル、統計表示などの状態を一貫したデザインで表示します。
 * Primerデザインシステムの色トークンを使用してアクセシビリティを確保。
 */
const StatusBadge = memo<StatusBadgeProps>(({
  variant,
  size = 'medium',
  icon: IconComponent,
  children,
  sx
}) => {
  // バリアント別の色定義
  const getVariantColors = () => {
    switch (variant) {
      case 'danger':
        return {
          color: 'danger.fg',
          cssColor: '#d1242f'
        };
      case 'warning':
        return {
          color: 'attention.fg',
          cssColor: '#9a6700'
        };
      case 'success':
        return {
          color: 'success.fg',
          cssColor: '#1a7f37'
        };
      case 'info':
        return {
          color: 'accent.fg',
          cssColor: '#0969da'
        };
      case 'neutral':
        return {
          color: 'fg.muted',
          cssColor: '#656d76'
        };
      case 'emphasis':
        return {
          color: 'fg.onEmphasis',
          cssColor: '#ffffff'
        };
      default:
        return {
          color: 'fg.default',
          cssColor: '#1f2328'
        };
    }
  };

  // サイズ別のスタイル定義
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          px: 1,
          py: 0,
          fontSize: 0,
          iconSize: 10
        };
      case 'large':
        return {
          px: 3,
          py: 2,
          fontSize: 2,
          iconSize: 16
        };
      default: // medium
        return {
          px: 2,
          py: 1,
          fontSize: 0,
          iconSize: 12
        };
    }
  };

  const colors = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: IconComponent ? '4px' : 0,
        color: colors.cssColor,
        fontWeight: '600',
        alignSelf: 'flex-start',
        padding: `${sizeStyles.py * 4}px ${sizeStyles.px * 4}px`,
        ...sx
      }}
    >
      {IconComponent && (
        <IconComponent size={sizeStyles.iconSize} />
      )}
      <Text 
        sx={{ 
          fontSize: sizeStyles.fontSize, 
          color: colors.color,
          fontWeight: '700'
        }}
      >
        {children}
      </Text>
    </div>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;