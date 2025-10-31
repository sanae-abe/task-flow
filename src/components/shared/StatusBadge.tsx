import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

import type { StatusBadgeVariant, StatusBadgeSize } from '../../types/shared';

interface StatusBadgeProps {
  /** バッジのバリアント */
  variant: StatusBadgeVariant;
  /** バッジのサイズ */
  size?: StatusBadgeSize;
  /** アイコン（オプション） */
  icon?: LucideIcon | React.ComponentType<{ size: number }>;
  /** バッジのテキスト */
  children: React.ReactNode;
  /** フォントウェイト */
  fontWeight?: string | number;
  /** 追加のCSS */
  className?: string;
}

/**
 * 統一された状態表示バッジコンポーネント
 *
 * 期限、ラベル、統計表示などの状態を一貫したデザインで表示します。
 * Primerデザインシステムの色トークンを使用してアクセシビリティを確保。
 */
const StatusBadge = memo<StatusBadgeProps>(
  ({
    variant,
    size = 'medium',
    icon: IconComponent,
    children,
    fontWeight = '600',
    className,
  }) => {
    // バリアント別の色定義
    const getVariantColor = (): string => {
      switch (variant) {
        case 'danger':
          return 'text-destructive';
        case 'warning':
          return 'text-warning';
        case 'success':
          return 'text-success';
        case 'info':
          return 'text-primary';
        default:
          return 'text-default';
      }
    };

    // サイズ別のスタイル定義
    const getSizeClasses = (): {
      containerClass: string;
      textClass: string;
      iconSize: number;
    } => {
      switch (size) {
        case 'small':
          return {
            containerClass: 'px-1 py-0',
            textClass: 'text-xs',
            iconSize: 16,
          };
        case 'large':
          return {
            containerClass: 'px-3 py-2',
            textClass: 'text-base',
            iconSize: 16,
          };
        default: // medium
          return {
            containerClass: 'px-2 py-1',
            textClass: 'text-sm',
            iconSize: 16,
          };
      }
    };

    const colorClass = getVariantColor();
    const { containerClass, textClass, iconSize } = getSizeClasses();

    return (
      <div
        className={cn(
          'inline-flex items-center self-start gap-1',
          containerClass,
          textClass,
          className,
          colorClass
        )}
        style={{
          fontWeight,
        }}
      >
        {IconComponent && <IconComponent size={iconSize} />}
        {children}
      </div>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
