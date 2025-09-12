import type { Icon } from '@primer/octicons-react';
import { Box, Text } from '@primer/react';
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
          bg: 'danger.subtle',
          color: 'danger.fg',
          borderColor: 'danger.muted'
        };
      case 'warning':
        return {
          bg: 'attention.subtle',
          color: 'attention.fg',
          borderColor: 'attention.muted'
        };
      case 'success':
        return {
          bg: 'success.subtle',
          color: 'success.fg',
          borderColor: 'success.muted'
        };
      case 'info':
        return {
          bg: 'accent.subtle',
          color: 'accent.fg',
          borderColor: 'accent.muted'
        };
      case 'neutral':
        return {
          bg: 'neutral.subtle',
          color: 'fg.muted',
          borderColor: 'border.default'
        };
      case 'emphasis':
        return {
          bg: 'neutral.emphasis',
          color: 'fg.onEmphasis',
          borderColor: 'neutral.emphasis'
        };
      default:
        return {
          bg: 'canvas.subtle',
          color: 'fg.default',
          borderColor: 'border.default'
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
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: IconComponent ? 1 : 0,
        ...colors,
        borderRadius: 2,
        fontWeight: '700',
        alignSelf: 'flex-start',
        border: '1px solid',
        ...sizeStyles,
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
    </Box>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;