import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';

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
        variant: 'outline',
        position: 'right',
      },
      {
        label: '保存',
        onClick: handleSave,
        variant: 'default',
        position: 'right',
      },
    ];

    // hasTimeがtrueの場合は削除ボタンを追加
    if (hasTime) {
      actionList.splice(1, 0, {
        label: '時刻設定を削除',
        onClick: handleRemove,
        variant: 'destructive',
        position: 'left',
      });
    }

    return actionList;
  }, [handleCancel, handleSave, handleRemove, hasTime]);

  return (
    <UnifiedDialog
      variant='modal'
      isOpen={isOpen}
      title='時刻設定'
      onClose={handleCancel}
      actions={actions}
      actionsLayout='split'
    >
      <div className='flex flex-col gap-2'>
        <label className='text-sm font-medium'>時刻</label>
        <Input
          type='time'
          value={localDueTime}
          onChange={e => setLocalDueTime(e.target.value)}
          className='bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
          step='300'
        />
      </div>
    </UnifiedDialog>
  );
};

export default TimeSelectorDialog;
