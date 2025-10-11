import { Label } from '@primer/react';
import React from 'react';

import type { Priority } from '../types';
import { priorityConfig } from '../utils/priorityConfig';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'small' | 'medium' | 'large';
  variant?: 'filled' | 'outlined' | 'subtle';
  showIcon?: boolean;
  showLabel?: boolean;
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
  variant = 'filled',
  showIcon = true,
  showLabel = true,
}) => {
  const config = priorityConfig[priority];
  const sizeStyle = sizeConfig[size];

  if (!config) {
    return null;
  }

  const Icon = config.icon;
  const colors = config.colors[variant];

  return (
    <Label
      variant={config.variant}
      size={size === 'small' ? 'small' : 'large'}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${sizeStyle.gap}px`,
        fontSize: sizeStyle.fontSize,
        fontWeight: '600',
        lineHeight: 1,
        padding: sizeStyle.padding,
        borderRadius: '12px',
        border: variant === 'outlined' ? `1px solid ${colors.border}` : 'none',
        color: colors.text,
        backgroundColor: colors.bg,
        transition: 'all 0.2s ease-in-out',
        cursor: 'default',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: variant === 'filled' ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
        },
      }}
      aria-label={`優先度: ${config.label} - ${config.description}`}
      role="status"
    >
      {showIcon && (
        <Icon
          size={sizeStyle.iconSize}
          aria-hidden="true"
        />
      )}
      {showLabel && <span>{config.label}</span>}
    </Label>
  );
};

export default PriorityBadge;
