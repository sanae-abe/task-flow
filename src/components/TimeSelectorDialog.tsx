import { Box, Text, TextInput } from '@primer/react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import UnifiedDialog from './shared/Dialog/UnifiedDialog';
import type { DialogAction } from '../types/unified-dialog';

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

  const actions: DialogAction[] = useMemo(() => {
    const actionList: DialogAction[] = [
      {
        label: 'キャンセル',
        onClick: handleCancel,
        variant: 'default',
        position: 'right'
      },
      {
        label: '保存',
        onClick: handleSave,
        variant: 'primary',
        position: 'right'
      }
    ];

    // hasTimeがtrueの場合は削除ボタンを追加
    if (hasTime) {
      actionList.splice(1, 0, {
        label: '時刻設定を削除',
        onClick: handleRemove,
        variant: 'danger',
        position: 'left'
      });
    }

    return actionList;
  }, [handleCancel, handleSave, handleRemove, hasTime]);

  return (
    <UnifiedDialog
      variant="modal"
      isOpen={isOpen}
      title="時刻設定"
      onClose={handleCancel}
      actions={actions}
      actionsLayout="split"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Text sx={{ fontSize: 1, display: 'block', fontWeight: '700' }}>
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
    </UnifiedDialog>
  );
};

export default TimeSelectorDialog;