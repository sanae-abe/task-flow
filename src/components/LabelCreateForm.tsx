import React, { memo, useMemo } from 'react';

import { UnifiedForm, type FormFieldConfig } from './shared/Form';

interface LabelCreateFormProps {
  labelName: string;
  selectedColor: string;
  onLabelNameChange: (name: string) => void;
  onColorSelect: (color: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isValid: boolean;
}

const LabelCreateForm = memo<LabelCreateFormProps>(
  ({
    labelName,
    selectedColor,
    onLabelNameChange,
    onColorSelect,
    onSave,
    onCancel,
    onKeyDown,
    isValid,
  }) => {
    // フォームフィールドを直接定義
    const formFields = useMemo(
      (): FormFieldConfig[] => [
        {
          id: 'label-name',
          name: 'name',
          type: 'text',
          label: 'ラベル名',
          value: labelName,
          placeholder: 'ラベル名を入力',
          onChange: onLabelNameChange as (value: unknown) => void,
          onKeyDown,
          autoFocus: true,
          hideLabel: false,
          disabled: false,
          validation: { required: true, minLength: 1, maxLength: 50 },
        },
        {
          id: 'label-color',
          name: 'color',
          type: 'color-selector',
          label: '色',
          value: selectedColor,
          onChange: onColorSelect as (value: unknown) => void,
          autoFocus: false,
          hideLabel: false,
          disabled: false,
        },
      ],
      [labelName, selectedColor, onLabelNameChange, onColorSelect, onKeyDown]
    );

    return (
      <div className={`p-3 bg-neutral-100 rounded-md border`}>
        <UnifiedForm
          fields={formFields}
          onSubmit={onSave}
          onCancel={onCancel}
          submitText='作成'
          cancelText='キャンセル'
          disabled={!isValid}
          validateOnChange
          validateOnBlur
        />
      </div>
    );
  }
);

export default LabelCreateForm;
