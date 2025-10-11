import { Box, FormControl, Text } from '@primer/react';
import React from 'react';

import type { Priority } from '../types';
import { prioritySelectorOptions } from '../utils/priorityConfig';

interface PrioritySelectorProps {
  priority?: Priority;
  onPriorityChange: (priority: Priority | undefined) => void;
  disabled?: boolean;
  variant?: 'compact' | 'full';
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  priority,
  onPriorityChange,
  disabled = false,
  variant = 'full',
}) => {
  const handleClick = (value: Priority | undefined) => {
    if (disabled) {
      return;
    }
    onPriorityChange(value);
  };

  return (
    <FormControl>
      {variant === 'full' && (
        <FormControl.Label>
          優先度（任意）
        </FormControl.Label>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {prioritySelectorOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = priority === option.value;

          return (
            <Box
              key={option.value || 'none'}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                padding: '8px 12px',
                border: '1px solid',
                borderColor: isSelected ? 'accent.fg' : 'border.muted',
                borderRadius: 2,
                backgroundColor: isSelected ? 'accent.subtle' : 'canvas.default',
                cursor: disabled ? 'not-allowed' : 'pointer',
                '&:hover:not(:disabled)': {
                  backgroundColor: isSelected ? 'accent.subtle' : 'canvas.subtle',
                  borderColor: isSelected ? 'accent.fg' : 'border.default',
                },
              }}
              onClick={() => handleClick(option.value)}
            >
              {Icon ? (
                <Icon
                  size={16}
                  aria-hidden
                />
              ) : (
                <Box
                  sx={{
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'border.muted',
                    }}
                  />
                </Box>
              )}
              <Text
                sx={{
                  fontSize: 1,
                  color: 'fg.default',
                }}
              >
                {option.label}
              </Text>
            </Box>
          );
        })}
      </Box>
    </FormControl>
  );
};

export default PrioritySelector;