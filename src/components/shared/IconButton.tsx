import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

import type { IconButtonVariant, IconButtonSize, IconButtonStyle } from '../../types/shared';

interface IconButtonProps {
  /** アイコンコンポーネント（Lucide Reactアイコンまたはカスタムアイコン） */
  icon: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  /** クリック時のコールバック（DropdownMenuTrigger内で使用する場合は省略可能） */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 統一されたアイコンボタンコンポーネント
 *
 * バリアントに応じて適切な色とスタイルを適用し、
 * アクセシビリティとユーザビリティを向上させます。
 */
const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon: IconComponent,
  onClick,
  ariaLabel,
  variant = 'default',
  size = 'medium',
  disabled = false,
  sx,
  stopPropagation = false,
  className
}, ref) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    if (onClick) {
      onClick(event);
    }
  };

  // バリアント別のTailwindクラス定義
  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return 'text-destructive hover:destructive/90';
      case 'success':
        return 'text-success hover:text-success/90';
      case 'warning':
        return 'text-warning hover:text-warning/90';
      case 'muted':
        return 'text-muted hover:text-muted/90';
      default:
        return 'text-foreground hover:text-foreground/90';
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

  // Shadcn/UIサイズマッピング
  const getShadcnSize = () => {
    switch (size) {
      case 'small':
        return 'sm';
      case 'large':
        return 'lg';
      default:
        return 'icon';
    }
  };

  // 統一されたShadcn/UI実装
  return (
    <Button
      ref={ref}
      onClick={handleClick}
      variant="ghost"
      size={getShadcnSize()}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        getVariantClasses(),
        'transition-all duration-150',
        size === 'small' && 'p-1',
        size === 'large' && 'p-3',
        size === 'medium' && 'p-2',
        size === 'icon' && 'p-1',
        className
      )}
      style={sx ? (sx as React.CSSProperties) : undefined}
    >
      <IconComponent size={getIconSize()} />
    </Button>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;