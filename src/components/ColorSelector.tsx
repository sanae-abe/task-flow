import { Box, Button, Text } from '@primer/react';
import { memo } from 'react';

import { getLabelColors } from '../utils/labelHelpers';
import { LABEL_COLORS } from '../utils/labels';

interface ColorSelectorProps {
  readonly selectedColor: string;
  readonly onColorSelect: (color: string) => void;
}

const ColorSelector = memo<ColorSelectorProps>(({ 
  selectedColor, 
  onColorSelect 
}) => (
    <Box className="color-selector">
      <Text 
        as="label"
        sx={{ fontSize: 1, fontWeight: '400', mb: 2, display: 'block' }}
        className="color-selector__label"
      >
        色
      </Text>
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'start',
          flexWrap: 'nowrap'
        }}
        className="color-selector__grid"
        role="radiogroup"
        aria-labelledby="color-selector-label"
      >
        {LABEL_COLORS.map((color) => {
          const colors = getLabelColors(color.variant);
          const isSelected = selectedColor === color.variant;

          return (
            <Button
              key={color.variant}
              onClick={() => onColorSelect(color.variant)}
              aria-label={`${color.name}色を選択`}
              aria-checked={isSelected}
              role="radio"
              className={`color-selector__button ${isSelected ? 'color-selector__button--selected' : ''}`}
              sx={{
                width: '36px',
                height: '36px',
                minHeight: '36px',
                p: 0,
                bg: colors.bg,
                border: '2px solid',
                borderColor: isSelected ? 'accent.emphasis' : 'transparent',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 0 0 2px var(--color-accent-emphasis)' : 'none',
                '&:hover': {
                  borderColor: isSelected ? 'accent.emphasis' : 'neutral.emphasis',
                  transform: 'scale(1.05)',
                  boxShadow: isSelected ? '0 0 0 2px var(--color-accent-emphasis)' : '0 2px 4px rgba(0,0,0,0.1)'
                },
                '&:focus': {
                  borderColor: 'accent.emphasis',
                  outline: '2px solid',
                  outlineColor: 'accent.fg',
                  outlineOffset: '1px'
                }
              }}
            >
              <Text sx={{ 
                fontSize: 1, 
                color: colors.color, 
                textAlign: 'center', 
                fontWeight: 'semibold',
                pointerEvents: 'none',
                lineHeight: 1
              }}>
                {color.name.charAt(0)}
              </Text>
            </Button>
          );
        })}
      </Box>
    </Box>
  ));

ColorSelector.displayName = 'ColorSelector';

export default ColorSelector;