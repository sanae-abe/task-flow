import { Label } from '@primer/react';
import React from 'react';

import type { Priority } from '../types';
import { priorityConfig } from '../utils/priorityConfig';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'small' | 'medium' | 'large';
  variant?: 'filled' | 'outlined' | 'subtle' | 'minimal';
  showIcon?: boolean;
  showLabel?: boolean;
  useEnglishLabel?: boolean;
}


// サイズ設定
const sizeConfig = {
  small: {
    fontSize: '11px',
    padding: '2px 6px',
    iconSize: 12,
    gap: 3,
  },
  medium: {
    fontSize: '12px',
    padding: '4px 8px',
    iconSize: 14,
    gap: 4,
  },
  large: {
    fontSize: '14px',
    padding: '6px 12px',
    iconSize: 16,
    gap: 6,
  },
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'small',
  variant = 'minimal',
  showIcon = true,
  showLabel = false,
  useEnglishLabel = true,
}) => {
  const config = priorityConfig[priority];
  const sizeStyle = sizeConfig[size];

  if (!config) {
    return null;
  }

  const Icon = config.icon;
  const colors = config.colors[variant === 'minimal' ? 'outlined' : variant];
  const displayLabel = useEnglishLabel ? config.labelEn : config.label;

  // ミニマルバリアント用のスタイル
  const isMinimal = variant === 'minimal';
  const minimalStyles = isMinimal ? {
    backgroundColor: 'transparent',
    border: 'none',
    padding: showLabel ? `2px 6px` : '2px',
    borderRadius: showLabel ? '6px' : '0',
    '&:hover': {
      transform: 'none',
      boxShadow: 'none',
      backgroundColor: showLabel ? `${colors.border}15` : 'transparent',
    },
  } : {};

  return (
    <Label
      variant={isMinimal ? 'secondary' : config.variant}
      size={size === 'small' ? 'small' : 'large'}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${sizeStyle.gap}px`,
        fontSize: sizeStyle.fontSize,
        fontWeight: showLabel ? '500' : '400',
        lineHeight: 1,
        padding: isMinimal ? (showLabel ? `2px 6px` : '2px') : sizeStyle.padding,
        borderRadius: isMinimal ? (showLabel ? '6px' : '0') : '12px',
        border: (variant === 'outlined' || isMinimal) ? `1px solid ${colors.border}` : 'none',
        color: isMinimal ? colors.border : colors.text,
        backgroundColor: isMinimal ? 'transparent' : colors.bg,
        transition: 'all 0.2s ease-in-out',
        cursor: 'default',
        '&:hover': isMinimal ? {
          transform: 'none',
          boxShadow: 'none',
          backgroundColor: showLabel ? `${colors.border}15` : 'transparent',
        } : {
          transform: 'scale(1.05)',
          boxShadow: variant === 'filled' ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
        },
        ...minimalStyles,
      }}
      aria-label={`優先度: ${displayLabel} - ${config.description}`}
      role="status"
    >
      {showIcon && (
        <Icon
          size={sizeStyle.iconSize}
          fill={isMinimal ? colors.border : undefined}
          aria-hidden="true"
        />
      )}
      {showLabel && <span>{displayLabel}</span>}
    </Label>
  );
};

export default PriorityBadge;
