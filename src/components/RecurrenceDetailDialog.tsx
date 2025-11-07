import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { DialogAction } from '../types/unified-dialog';
import {
  MonthlyOptionsSelector,
  RecurrenceEndConditions,
  RecurrenceErrorDisplay,
  RecurrencePatternSelector,
  RecurrencePreview,
  WeeklyOptionsSelector,
} from './RecurrenceDetailDialog/components';
import {
  useRecurrenceForm,
  useRecurrenceHandlers,
} from './RecurrenceDetailDialog/hooks';
import type { RecurrenceDetailDialogProps } from './RecurrenceDetailDialog/types';
import UnifiedDialog from './shared/Dialog/UnifiedDialog';

const RecurrenceDetailDialog: React.FC<RecurrenceDetailDialogProps> = ({
  isOpen,
  recurrence,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const { config, setConfig, errors, isFormValid } = useRecurrenceForm({
    isOpen,
    recurrence,
  });

  const {
    handlePatternChange,
    handleIntervalChange,
    handleDaysOfWeekChange,
    handleDayOfMonthChange,
    handleEndDateChange,
    handleMaxOccurrencesChange,
  } = useRecurrenceHandlers({ setConfig });

  const handleSave = useCallback(() => {
    if (errors.length === 0) {
      onSave(config);
      onClose();
    }
  }, [config, errors, onSave, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(() => {
    onSave(undefined);
    onClose();
  }, [onSave, onClose]);

  const actions: DialogAction[] = useMemo(() => {
    const actionList: DialogAction[] = [
      {
        label: t('common.cancel'),
        onClick: handleCancel,
        variant: 'outline',
      },
      {
        label: t('common.save'),
        onClick: handleSave,
        variant: 'default',
        disabled: !isFormValid,
      },
    ];

    // 既存の繰り返し設定がある場合は削除ボタンを追加
    if (recurrence?.enabled) {
      actionList.splice(1, 0, {
        label: t('common.delete'),
        onClick: handleDelete,
        variant: 'destructive',
      });
    }

    return actionList;
  }, [
    handleCancel,
    handleSave,
    handleDelete,
    isFormValid,
    recurrence?.enabled,
    t,
  ]);

  return (
    <UnifiedDialog
      variant='modal'
      isOpen={isOpen}
      title={t('recurrence.detailTitle')}
      onClose={onClose}
      actions={actions}
    >
      <div className='flex flex-col gap-3'>
        <div className='flex flex-col gap-4'>
          <RecurrencePatternSelector
            config={config}
            onPatternChange={handlePatternChange}
            onIntervalChange={handleIntervalChange}
          />

          <WeeklyOptionsSelector
            config={config}
            onDaysOfWeekChange={handleDaysOfWeekChange}
          />

          <MonthlyOptionsSelector
            config={config}
            onDayOfMonthChange={handleDayOfMonthChange}
          />

          <RecurrenceEndConditions
            config={config}
            onEndDateChange={handleEndDateChange}
            onMaxOccurrencesChange={handleMaxOccurrencesChange}
          />
        </div>
        <div>
          <RecurrencePreview config={config} />
          <RecurrenceErrorDisplay errors={errors} />
        </div>
      </div>
    </UnifiedDialog>
  );
};

export default RecurrenceDetailDialog;
