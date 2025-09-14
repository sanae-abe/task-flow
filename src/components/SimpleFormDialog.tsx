import { memo } from 'react';

import type { SimpleFormDialogProps } from '../types/dialog';
import { SimpleFormDialog as UnifiedSimpleFormDialog } from './shared/Dialog';

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
  inputId: _inputId
}) => (
    <UnifiedSimpleFormDialog
      isOpen={isOpen}
      title={title}
      fieldLabel={fieldLabel}
      placeholder={placeholder}
      initialValue={initialValue}
      onSave={onSave}
      onCancel={onCancel}
      saveText={confirmText}
      ariaLabelledBy={ariaLabelledBy}
      onClose={onCancel}
    />
  ));

export default SimpleFormDialog;