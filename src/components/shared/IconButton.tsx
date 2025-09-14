import type { Icon } from '@primer/octicons-react';
import { Button, IconButton as PrimerIconButton } from '@primer/react';
import { memo } from 'react';

import type { IconButtonVariant, IconButtonSize, IconButtonStyle } from '../../types/shared';

interface IconButtonProps {
  /** アイコンコンポーネント */
  icon: Icon;
  /** クリック時のコールバック */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** アクセシビリティ用のラベル */
  ariaLabel: string;
  /** ボタンのバリアント */
  variant?: IconButtonVariant;
  /** ボタンのサイズ */
  size?: IconButtonSize;
  /** ボタンのスタイル（Primerスタイルまたはカスタムスタイル） */
  style?: IconButtonStyle;
  /** 無効状態 */
  disabled?: boolean;
  /** 追加のCSS */
  sx?: Record<string, unknown>;
  /** クリック伝播を停止するか */
  stopPropagation?: boolean;
}

/**
 * 統一されたアイコンボタンコンポーネント
 * 
 * バリアントに応じて適切な色とスタイルを適用し、
 * アクセシビリティとユーザビリティを向上させます。
 */
const IconButton = memo<IconButtonProps>(({
  icon: IconComponent,
  onClick,
  ariaLabel,
  variant = 'default',
  size = 'medium',
  style = 'primer',
  disabled = false,
  sx,
  stopPropagation = false
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    onClick(event);
  };

  // バリアント別の色定義
  const getVariantColors = () => {
    switch (variant) {
      case 'danger':
        return {
          color: 'danger.fg',
          '&:hover': {
            color: 'danger.fg'
          }
        };
      case 'success':
        return {
          color: 'success.fg',
          '&:hover': {
            color: 'success.fg'
          }
        };
      case 'warning':
        return {
          color: 'attention.fg',
          '&:hover': {
            color: 'attention.fg'
          }
        };
      case 'muted':
        return {
          color: 'fg.muted',
          '&:hover': {
            color: 'fg.default'
          }
        };
      default:
        return {
          color: 'fg.default',
          '&:hover': {
            color: 'fg.default'
          }
        };
    }
  };

  // アイコンサイズの定義
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 20;
      default:
        return 16;
    }
  };

  // Primerスタイルを使用する場合
  if (style === 'primer') {
    return (
      <PrimerIconButton
        aria-label={ariaLabel}
        icon={IconComponent}
        size={size}
        onClick={handleClick}
        variant="invisible"
        disabled={disabled}
        sx={{
          ...getVariantColors(),
          '&:hover': {
            bg: 'transparent',
            ...getVariantColors()['&:hover']
          },
          ...sx
        }}
      />
    );
  }

  // カスタムスタイルを使用する場合
  const buttonSx = {
    p: size === 'small' ? 1 : 2,
    minHeight: 'auto',
    ...getVariantColors(),
    ...sx
  };

  return (
    <Button
      onClick={handleClick}
      variant="invisible"
      disabled={disabled}
      aria-label={ariaLabel}
      sx={buttonSx}
    >
      <IconComponent size={getIconSize()} />
    </Button>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;