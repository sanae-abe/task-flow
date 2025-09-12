import { memo } from 'react';

import type { FormDialogProps } from '../../../types/unified-dialog';

import UnifiedDialog from './UnifiedDialog';

/**
 * フォームダイアログコンポーネント
 * 
 * 複雑なフォームを持つダイアログを提供します。
 * タスク作成・編集など、複数のフィールドを持つフォームに適用可能です。
 */
const FormDialog = memo<FormDialogProps>(({
  isOpen,
  title,
  children,
  onSave,
  onCancel,
  saveText = '保存',
  cancelText = 'キャンセル',
  isSaveDisabled = false,
  isValid = true,
  ...dialogProps
}) => {
  const actions = [
    {
      label: cancelText,
      onClick: onCancel,
      variant: 'default' as const
    },
    {
      label: saveText,
      onClick: onSave,
      variant: 'primary' as const,
      disabled: isSaveDisabled || !isValid
    }
  ];

  return (
    <UnifiedDialog
      {...dialogProps}
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      actions={actions}
      size="large"
      closeOnEscape
      closeOnBackdropClick
    >
      {children}
    </UnifiedDialog>
  );
});

FormDialog.displayName = 'FormDialog';

export default FormDialog;