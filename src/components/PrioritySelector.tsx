import { Box, FormControl, Radio, Text } from '@primer/react';
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
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 'none'の場合はundefined、それ以外はPriorityとして設定
    const newPriority = value === 'none' ? undefined : (value as Priority);
    onPriorityChange(newPriority);
  };

  return (
    <FormControl>
      {variant === 'full' && (
        <FormControl.Label>
          優先度（任意）
        </FormControl.Label>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {prioritySelectorOptions.map((option) => {
          const Icon = option.icon;
          const value = option.value === undefined ? 'none' : String(option.value);
          const currentValue = priority === undefined ? 'none' : String(priority);
          const isSelected = currentValue === value;

          return (
            <Box
              key={value}
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
                '&:hover:not(:has(input:disabled))': {
                  backgroundColor: isSelected ? 'accent.subtle' : 'canvas.subtle',
                  borderColor: isSelected ? 'accent.fg' : 'border.default',
                },
              }}
              onClick={() => !disabled && handleRadioChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>)}
            >
              <Radio
                name="priority-selector"
                value={value}
                checked={isSelected}
                onChange={handleRadioChange}
                disabled={disabled}
                sx={{ mr: 1 }}
              />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flex: 1,
                }}
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <Text
                    sx={{
                      fontSize: 1,
                      fontWeight: '600',
                      color: 'fg.default',
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text
                    sx={{
                      fontSize: 0,
                      color: 'fg.muted',
                      lineHeight: '16px',
                    }}
                  >
                    {option.description}
                  </Text>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </FormControl>
  );
};

export default PrioritySelector;