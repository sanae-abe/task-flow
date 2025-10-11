import { Label } from '@primer/react';
import React from 'react';

import type { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'small' | 'large';
}

const priorityConfig = {
  high: {
    label: '高',
    variant: 'danger' as const,
    color: '#cf222e'
  },
  medium: {
    label: '中',
    variant: 'attention' as const,
    color: '#fb8500'
  },
  low: {
    label: '低',
    variant: 'secondary' as const,
    color: '#656d76'
  }
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'small' }) => {
  const config = priorityConfig[priority];

  if (!config) {
    return null;
  }

  return (
    <Label
      variant={config.variant}
      size={size}
      sx={{
        fontSize: size === 'small' ? '11px' : '12px',
        fontWeight: '600',
        lineHeight: 1,
        padding: size === 'small' ? '2px 6px' : '4px 8px',
        borderRadius: '12px',
        border: 'none',
        color: 'white',
        backgroundColor: config.color,
        '&:hover': {
          backgroundColor: config.color,
        }
      }}
    >
      <span>{config.label}</span>
    </Label>
  );
};

export default PriorityBadge;