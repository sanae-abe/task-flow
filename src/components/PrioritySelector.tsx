import { ActionList, ActionMenu, Box, FormControl, Text } from '@primer/react';
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
  const selectedOption = prioritySelectorOptions.find(opt => opt.value === priority);
  const SelectedIcon = selectedOption?.icon;

  return (
    <FormControl>
      {variant === 'full' && (
        <FormControl.Label>
          優先度
          <Text
            as="span"
            sx={{
              ml: 1,
              fontSize: 0,
              color: 'fg.muted',
              fontWeight: 'normal',
            }}
          >
            （任意）
          </Text>
        </FormControl.Label>
      )}
      <ActionMenu>
        <ActionMenu.Anchor>
          <Box
            as="button"
            type="button"
            disabled={disabled}
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '5px 12px',
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: 2,
              backgroundColor: disabled ? 'canvas.subtle' : 'canvas.default',
              color: 'fg.default',
              fontSize: 1,
              lineHeight: '20px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover:not(:disabled)': {
                backgroundColor: 'canvas.subtle',
                borderColor: 'border.default',
              },
              '&:focus:not(:disabled)': {
                outline: 'none',
                borderColor: 'accent.fg',
                boxShadow: '0 0 0 3px rgba(9, 105, 218, 0.3)',
              },
              '&:active:not(:disabled)': {
                backgroundColor: 'canvas.inset',
              },
            }}
            aria-label="優先度を選択"
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {SelectedIcon ? (
                <SelectedIcon
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
                  color: priority ? 'fg.default' : 'fg.muted',
                }}
              >
                {selectedOption?.label || '選択なし'}
              </Text>
            </Box>
            <Box
              as="span"
              sx={{
                ml: 2,
                color: 'fg.muted',
                fontSize: 0,
              }}
            >
              ▼
            </Box>
          </Box>
        </ActionMenu.Anchor>

        <ActionMenu.Overlay width="medium">
          <ActionList selectionVariant="single">
            {prioritySelectorOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = option.value === priority;

              return (
                <ActionList.Item
                  key={option.value || 'none'}
                  selected={isSelected}
                  onSelect={() => onPriorityChange(option.value)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'canvas.subtle',
                    },
                    '&:focus': {
                      outline: 'none',
                      backgroundColor: 'accent.subtle',
                    },
                  }}
                  aria-label={`${option.label} - ${option.description}`}
                >
                  <ActionList.LeadingVisual>
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
                  </ActionList.LeadingVisual>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <Text
                      sx={{
                        fontSize: 1,
                        fontWeight: isSelected ? '600' : '400',
                        color: 'fg.default',
                      }}
                    >
                      {option.label}
                    </Text>
                  </Box>
                </ActionList.Item>
              );
            })}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>

      {variant === 'full' && priority && selectedOption && (
        <FormControl.Caption sx={{ mt: 1 }}>
          <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
            {selectedOption.description}
          </Text>
        </FormControl.Caption>
      )}
    </FormControl>
  );
};

export default PrioritySelector;