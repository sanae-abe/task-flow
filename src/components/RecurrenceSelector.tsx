import {
  Box,
  Text,
  Checkbox,
  Label,
  Button,
} from '@primer/react';
import { GearIcon } from '@primer/octicons-react';
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

  const handleEnabledChange = useCallback((checked: boolean) => {
    if (checked) {
      // チェックされた場合、詳細設定ダイアログを開く
      setIsDetailDialogOpen(true);
    } else {
      // チェックを外された場合、繰り返し設定をクリア
      onRecurrenceChange(undefined);
    }
  }, [onRecurrenceChange]);

  const handleDetailDialogSave = useCallback((newRecurrence: RecurrenceConfig | undefined) => {
    onRecurrenceChange(newRecurrence);
  }, [onRecurrenceChange]);

  const handleDetailDialogClose = useCallback(() => {
    setIsDetailDialogOpen(false);
  }, []);

  const handleSettingsClick = useCallback(() => {
    setIsDetailDialogOpen(true);
  }, []);

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Label sx={{ border: 0, display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Checkbox
              checked={Boolean(recurrence?.enabled) && !disabled}
              onChange={(e) => handleEnabledChange(e.target.checked)}
              disabled={disabled}
            />
            <Text sx={{ fontSize: 1, color: disabled ? 'fg.disabled' : 'inherit' }}>
              繰り返し設定
            </Text>
          </Label>

          {Boolean(recurrence?.enabled) && !disabled && (
            <Button
              variant="invisible"
              size="small"
              leadingVisual={GearIcon}
              onClick={handleSettingsClick}
              sx={{ color: 'fg.muted' }}
            >
              設定
            </Button>
          )}
        </Box>

        {Boolean(recurrence?.enabled) && !disabled && (
          <Box sx={{ pl: 4 }}>
            <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
              {getRecurrenceDescription(recurrence)}
            </Text>
          </Box>
        )}

        {disabled && (
          <Box sx={{ pl: 4 }}>
            <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
              期限を設定してから繰り返し設定を有効にしてください
            </Text>
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