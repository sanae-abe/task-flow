import { XIcon } from '@primer/octicons-react';
import { Box, Text } from '@primer/react';
import { memo } from 'react';

import type { Label } from '../types';
import { getLabelColors } from '../utils/labelHelpers';
import IconButton from './shared/IconButton';

interface LabelChipProps {
  label: Label;
  showRemove?: boolean;
  onRemove?: (labelId: string) => void;
  onClick?: () => void;
  clickable?: boolean;
}

const LabelChip = memo<LabelChipProps>(({ 
  label, 
  showRemove = false, 
  onRemove,
  onClick,
  clickable = false
}) => {
  const colors = getLabelColors(label.color);

  const handleRemove = () => {
    if (onRemove) {
      onRemove(label.id);
    }
  };

  return (
    <Box
      as={clickable ? 'button' : 'div'}
      onClick={clickable ? onClick : undefined}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        bg: colors.bg,
        color: colors.color,
        px: 2,
        py: 1,
        borderRadius: 2,
        fontSize: 0,
        fontWeight: '400',
        gap: 1,
        border: 'none',
        cursor: clickable ? 'pointer' : 'default',
        '&:hover': clickable ? {
          opacity: 0.8,
          transform: 'scale(1.02)'
        } : {}
      }}
    >
      <Text sx={{ fontSize: 0, color: colors.color }}>
        {label.name}
      </Text>
      {showRemove && onRemove && (
        <IconButton
          icon={XIcon}
          onClick={handleRemove}
          ariaLabel={`${label.name}ラベルを削除`}
          variant="muted"
          size="small"
          sx={{
            color: colors.color,
            '&:hover': {
              bg: 'rgba(255, 255, 255, 0.2)',
              color: colors.color
            }
          }}
        />
      )}
    </Box>
  );
});

export default LabelChip;