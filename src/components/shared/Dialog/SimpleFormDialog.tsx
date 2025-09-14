import { memo } from 'react';

import { useFormDialog } from '../../../hooks/useFormDialog';
import type { SimpleFormDialogProps } from '../../../types/unified-dialog';
import FormField from '../../FormField';

import UnifiedDialog from './UnifiedDialog';

/**
 * シンプルフォームダイアログコンポーネント
 * 
 * 単一の入力フィールドを持つダイアログを提供します。
 * ボード作成、カラム作成など、単純なフォーム入力に適用可能です。
 */
const SimpleFormDialog = memo<SimpleFormDialogProps>(({
  isOpen,
  title,
  fieldLabel,
  placeholder,
  initialValue = '',
  onSave,
  onCancel,
  saveText = '保存',
  required = true,
  minLength = 1,
  ...dialogProps
}) => {
  const {
    value,
    setValue,
    handleSave,
    handleKeyPress,
    isValid
  } = useFormDialog({ 
    isOpen, 
    initialValue, 
    onSave, 
    onCancel,
    required,
    minLength
  });

  const actions = [
    {
      label: 'キャンセル',
      onClick: onCancel,
      variant: 'default' as const
    },
    {
      label: saveText,
      onClick: handleSave,
      variant: 'primary' as const,
      disabled: !isValid
    }
  ];

  const inputId = `simple-form-input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <UnifiedDialog
      {...dialogProps}
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      actions={actions}
      size="medium"
      closeOnEscape
      closeOnBackdropClick
    >
      <FormField
        id={inputId}
        label={fieldLabel}
        value={value}
        placeholder={placeholder}
        onChange={setValue}
        onKeyDown={handleKeyPress}
        autoFocus
        required={required}
      />
    </UnifiedDialog>
  );
});

SimpleFormDialog.displayName = 'SimpleFormDialog';

export default SimpleFormDialog;