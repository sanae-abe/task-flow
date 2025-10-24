import React, { memo, useMemo } from "react";

import { UnifiedForm, createLabelFormFields } from "./shared/Form";

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
    // フォームフィールド設定を生成
    const formFields = useMemo(
      () =>
        createLabelFormFields(
          {
            name: labelName,
            color: selectedColor,
          },
          {
            setName: onLabelNameChange,
            setColor: onColorSelect,
          },
          {
            onKeyDown,
          },
        ),
      [labelName, selectedColor, onLabelNameChange, onColorSelect, onKeyDown],
    );

    return (
      <div
        style={{
          padding: "12px",
          background: "var(--color-neutral-100)",
          borderRadius: "var(--borderRadius-medium)",
          border: "1px solid",
          borderColor: "border.default",
        }}
      >
        <UnifiedForm
          fields={formFields}
          onSubmit={onSave}
          onCancel={onCancel}
          submitText="作成"
          cancelText="キャンセル"
          disabled={!isValid}
          validateOnChange
          validateOnBlur
        />
      </div>
    );
  },
);

export default LabelCreateForm;
