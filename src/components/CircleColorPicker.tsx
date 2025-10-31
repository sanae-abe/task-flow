import { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';

import { LABEL_COLORS } from '../utils/labels';
import { getLabelColors } from '../utils/labelHelpers';

interface CircleColorPickerProps {
  readonly selectedColor: string;
  readonly onColorSelect: (color: string) => void;
  readonly className?: string;
}

const CircleColorPicker = memo<CircleColorPickerProps>(
  ({ selectedColor, onColorSelect, className }) => {
    // 色選択ハンドラー
    const handleColorSelect = useCallback(
      (color: string) => {
        try {
          onColorSelect(color);
        } catch (_error) {
          // ESLintルールに従い、_error handling only
        }
      },
      [onColorSelect]
    );

    return (
      <div className={cn('flex flex-wrap gap-2 justify-start', className)}>
        {LABEL_COLORS.map(color => {
          const colors = getLabelColors(color.variant);
          const isSelected = selectedColor === color.variant;

          return (
            <button
              key={color.variant}
              type='button'
              onClick={() => handleColorSelect(color.variant)}
              aria-label={`${color.name}色を選択`}
              className={cn(
                'w-6 h-6 rounded-full border-2 transition-all duration-200 ease-in-out shadow-none',
                'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              )}
              style={{
                background: isSelected ? '#ffffff' : colors.bg,
                borderColor: isSelected ? colors.bg : 'transparent',
                boxShadow: isSelected ? `0 0 4px ${colors.bg}` : 'none',
                borderTopColor: isSelected ? colors.bg : 'transparent',
              }}
            />
          );
        })}
      </div>
    );
  }
);

CircleColorPicker.displayName = 'CircleColorPicker';

export default CircleColorPicker;
