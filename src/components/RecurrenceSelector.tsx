import {
  Box,
  Button,
} from '@primer/react';
import { SyncIcon } from '@primer/octicons-react';
import React, { useState, useCallback } from 'react';

import type { RecurrenceConfig } from '../types';
import { getRecurrenceDescription } from '../utils/recurrence';
import RecurrenceDetailDialog from './RecurrenceDetailDialog';

interface RecurrenceSelectorProps {
  recurrence?: RecurrenceConfig;
  onRecurrenceChange: (recurrence: RecurrenceConfig | undefined) => void;
  disabled?: boolean;
}


const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  recurrence,
  onRecurrenceChange,
  disabled = false,
}) => {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleDetailDialogSave = useCallback((newRecurrence: RecurrenceConfig | undefined) => {
    onRecurrenceChange(newRecurrence);
  }, [onRecurrenceChange]);

  const handleDetailDialogClose = useCallback(() => {
    setIsDetailDialogOpen(false);
  }, []);

  const handleButtonClick = useCallback(() => {
    if (!disabled) {
      setIsDetailDialogOpen(true);
    }
  }, [disabled]);

  const getButtonText = () => {
    if (recurrence?.enabled) {
      return getRecurrenceDescription(recurrence);
    }
    return '繰り返し設定';
  };

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Button
          onClick={handleButtonClick}
          disabled={disabled}
          sx={{
            width: '100%',
            color: disabled ? 'fg.disabled' : 'inherit',
            border: '1px solid var(--borderColor-default)',
            bg: 'canvas.default',
            '& span': {
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }
          }}
        >
          <SyncIcon size={16} />
          {getButtonText()}
        </Button>

        {disabled && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ fontSize: 0, color: 'fg.muted' }}>
              ※期限を設定すると時刻設定と繰り返し設定が有効になります
            </Box>
          </Box>
        )}
      </Box>

      <RecurrenceDetailDialog
        isOpen={isDetailDialogOpen}
        recurrence={recurrence}
        onSave={handleDetailDialogSave}
        onClose={handleDetailDialogClose}
      />
    </>
  );
};

export default RecurrenceSelector;