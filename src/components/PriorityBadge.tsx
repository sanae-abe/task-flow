import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Priority } from '../types';
import { buildPriorityConfig, buildPriorityAriaLabel } from '../utils/priorityConfig';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority?: Priority;
  showIcon?: boolean;
  showLabel?: boolean;
  useEnglishLabel?: boolean;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  showIcon = true,
  showLabel = true,
  useEnglishLabel = false,
}) => {
  const { t } = useTranslation();

  // 優先度が設定されていない場合は何も表示しない
  if (!priority) {
    return null;
  }

  const priorityConfig = buildPriorityConfig(t);
  const config = priorityConfig[priority];

  if (!config) {
    return null;
  }

  const Icon = config.icon;
  const colors = config.colors.subtle;
  const displayLabel = useEnglishLabel ? config.labelEn : config.label;
  const ariaLabel = buildPriorityAriaLabel(priority, t);

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
      className={cn(
        `inline-flex items-center gap-1 px-2 py-1 rounded text-xs border-none outline-none`,
        showLabel ? 'font-medium' : 'font-normal',
        `line-height-[1.5]`,
        `cursor-default`
      )}
      aria-label={ariaLabel}
      role='status'
    >
      {showIcon && <Icon aria-hidden size={14} />}
      {showLabel && <span>{displayLabel}</span>}
    </div>
  );
};

export default PriorityBadge;
