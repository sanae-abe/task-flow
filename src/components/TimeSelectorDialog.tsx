import { Box, Text, TextInput } from '@primer/react';
import React, { useState, useEffect, useCallback } from 'react';

import CommonDialog, { DialogActions } from './CommonDialog';

interface TimeSelectorDialogProps {
  isOpen: boolean;
  hasTime: boolean;
  dueTime: string;
  onSave: (hasTime: boolean, time: string) => void;
  onClose: () => void;
}

const TimeSelectorDialog: React.FC<TimeSelectorDialogProps> = ({
  isOpen,
  hasTime,
  dueTime,
  onSave,
  onClose,
}) => {
  const [localDueTime, setLocalDueTime] = useState(dueTime || '23:59');

  useEffect(() => {
    if (isOpen) {
      setLocalDueTime(dueTime || '23:59');
    }
  }, [isOpen, dueTime]);

  const handleSave = useCallback(() => {
    onSave(true, localDueTime);
    onClose();
  }, [localDueTime, onSave, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleRemove = useCallback(() => {
    onSave(false, '');
    onClose();
  }, [onSave, onClose]);

  return (
    <CommonDialog
      isOpen={isOpen}
      title="時刻設定"
      onClose={handleCancel}
      size="small"
      actions={
        <DialogActions
          onCancel={handleCancel}
          onConfirm={handleSave}
          confirmText="保存"
          showRemove={hasTime}
          onRemove={handleRemove}
          removeText="時刻設定を削除"
        />
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Text sx={{ fontSize: 1, color: 'fg.muted', mb: 1, display: 'block', fontWeight: '700' }}>
            時刻
          </Text>
          <TextInput
            type="time"
            value={localDueTime}
            onChange={(e) => setLocalDueTime(e.target.value)}
            sx={{ width: '100%' }}
            step="300"
          />
        </Box>
      </Box>
    </CommonDialog>
  );
};

export default TimeSelectorDialog;