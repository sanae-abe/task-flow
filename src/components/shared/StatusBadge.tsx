import type { Icon } from '@primer/octicons-react';
import { memo } from 'react';
import { cn } from '@/lib/utils';

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
  /** フォントウェイト */
  fontWeight?: string | number;
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
  fontWeight = '600',
  sx
}) => {
  // バリアント別の色定義
  const getVariantColor = (): string => {
    switch (variant) {
      case 'danger':
        return '#d1242f';
      case 'warning':
        return '#9a6700';
      case 'success':
        return '#1a7f37';
      case 'info':
        return '#0969da';
      case 'neutral':
        return '#656d76';
      case 'emphasis':
        return '#ffffff';
      default:
        return '#1f2328';
    }
  };

  // サイズ別のスタイル定義
  const getSizeClasses = (): { containerClass: string; textClass: string; iconSize: number } => {
    switch (size) {
      case 'small':
        return {
          containerClass: 'px-1 py-0',
          textClass: 'text-xs',
          iconSize: 10
        };
      case 'large':
        return {
          containerClass: 'px-3 py-2',
          textClass: 'text-base',
          iconSize: 16
        };
      default: // medium
        return {
          containerClass: 'px-2 py-1',
          textClass: 'text-sm',
          iconSize: 12
        };
    }
  };

  const color = getVariantColor();
  const { containerClass, textClass, iconSize } = getSizeClasses();

  return (
    <div
      className={cn(
        'inline-flex items-center self-start',
        containerClass,
        IconComponent ? 'gap-1' : ''
      )}
      style={{
        color,
        fontWeight,
        ...sx
      }}
    >
      {IconComponent && (
        <IconComponent size={iconSize} />
      )}
      <span className={textClass}>
        {children}
      </span>
    </div>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;