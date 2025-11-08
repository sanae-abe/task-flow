import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { UnifiedForm, type FormFieldConfig } from './shared/Form';

interface SubTaskFormProps {
  title: string;
  onTitleChange: (title: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

const SubTaskForm: React.FC<SubTaskFormProps> = ({
  title,
  onTitleChange,
  onSubmit,
  onCancel,
  onKeyDown,
}) => {
  const { t } = useTranslation();

  // フォームフィールドを直接定義
  const formFields = useMemo(
    (): FormFieldConfig[] => [
      {
        id: 'subtask-title',
        name: 'title',
        type: 'text',
        label: t('subtask.subtask'),
        value: title,
        placeholder: t('subtask.addSubtask'),
        onChange: onTitleChange as (value: unknown) => void,
        onKeyDown,
        autoFocus: true,
        hideLabel: true,
        disabled: false,
        validation: { required: true, minLength: 1, maxLength: 100 },
      },
    ],
    [title, onTitleChange, onKeyDown, t]
  );

  return (
    <UnifiedForm
      fields={formFields}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitText={t('common.add')}
      cancelText={t('common.cancel')}
      validateOnChange={false}
      validateOnBlur={false}
      className='flex-1 mb-0 [&>div]:flex [&>div]:flex-col [&>div]:gap-2 [&_div_div]:mt-0 [&_div_div]:mb-0'
    />
  );
};

export default SubTaskForm;
