import { XIcon } from '@primer/octicons-react';
import { Box, Button, Text } from '@primer/react';
import { memo } from 'react';

import type { Label } from '../types';
import { getLabelColors } from '../utils/labelHelpers';

interface LabelChipProps {
  label: Label;
  showRemove?: boolean;
  onRemove?: (labelId: string) => void;
}

const LabelChip = memo<LabelChipProps>(({ 
  label, 
  showRemove = false, 
  onRemove 
}) => {
  const colors = getLabelColors(label.color);

  const handleRemove = () => {
    if (onRemove) {
      onRemove(label.id);
    }
  };

  return (
    <Box
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
        gap: 1
      }}
    >
      <Text sx={{ fontSize: 0, color: colors.color }}>
        {label.name}
      </Text>
      {showRemove && onRemove && (
        <Button
          onClick={handleRemove}
          variant="invisible"
          size="small"
          aria-label={`${label.name}ラベルを削除`}
          sx={{
            minHeight: 'auto',
            p: 0,
            color: colors.color,
            '&:hover': {
              bg: 'rgba(255, 255, 255, 0.2)',
              color: colors.color
            }
          }}
        >
          <XIcon size={12} />
        </Button>
      )}
    </Box>
  );
});

export default LabelChip;