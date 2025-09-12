import { memo } from 'react';

import { useFormDialog } from '../hooks/useFormDialog';
import type { SimpleFormDialogProps } from '../types/dialog';

import BaseDialog, { DialogActions } from './BaseDialog';
import FormField from './FormField';

const SimpleFormDialog = memo<SimpleFormDialogProps>(({
  isOpen,
  title,
  fieldLabel,
  placeholder,
  confirmText,
  initialValue = '',
  onSave,
  onCancel,
  ariaLabelledBy,
  inputId
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
    onCancel 
  });

  return (
    <BaseDialog
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      ariaLabelledBy={ariaLabelledBy}
      actions={
        <DialogActions
          onCancel={onCancel}
          onConfirm={handleSave}
          confirmText={confirmText}
          isConfirmDisabled={!isValid}
        />
      }
    >
      <FormField
        id={inputId}
        label={fieldLabel}
        value={value}
        placeholder={placeholder}
        onChange={setValue}
        onKeyDown={handleKeyPress}
        autoFocus
        required
      />
    </BaseDialog>
  );
});

export default SimpleFormDialog;