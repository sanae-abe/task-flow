import { memo, useCallback } from 'react';
import { Circle } from '@uiw/react-color';
import { cn } from '@/lib/utils';

import { LABEL_COLORS } from '../utils/labels';

interface CircleColorPickerProps {
  readonly selectedColor: string;
  readonly onColorSelect: (color: string) => void;
  readonly className?: string;
}

const CircleColorPicker = memo<CircleColorPickerProps>(
  ({ selectedColor, onColorSelect, className }) => {
    // @uiw/react-colorのCircleコンポーネント用の色配列を作成
    const colors = LABEL_COLORS.map(color => color.variant);

    // 色選択ハンドラー
    const handleColorChange = useCallback(
      (color: { hex?: string } | string) => {
        try {
          // @uiw/react-colorからの色データを処理
          const hexColor = typeof color === 'string' ? color : color.hex || '#0969da';
          onColorSelect(hexColor);
        } catch (error) {
          // ESLintルールに従い、error handling only
        }
      },
      [onColorSelect],
    );

    return (
      <div className={cn('flex justify-start', className)}>
        <Circle
          color={selectedColor}
          colors={colors}
          onChange={handleColorChange}
          // カスタムスタイル設定
          style={{
            width: 'auto',
            boxShadow: 'none',
            padding: '0',
          }}
          // 円形カラーピッカーの設定
          pointProps={{
            style: {
              width: '24px',
              height: '24px',
              marginRight: '10px',
              marginBottom: '10px',
              borderRadius: '50%',
              border: '3px solid #fff',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              position: 'relative',
            },
          }}
        />
      </div>
    );
  },
);

CircleColorPicker.displayName = 'CircleColorPicker';

export default CircleColorPicker;