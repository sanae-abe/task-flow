import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog as UnifiedConfirmDialog } from './shared/Dialog';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = memo<ConfirmDialogProps>(
  ({
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
  }) => {
    const { t } = useTranslation();

    return (
      <UnifiedConfirmDialog
        isOpen={isOpen}
        title={title}
        message={message}
        onConfirm={onConfirm}
        onCancel={onCancel}
        onClose={onCancel}
        confirmText={confirmText ?? t('common.delete')}
        cancelText={cancelText ?? t('common.cancel')}
        confirmVariant='danger'
      />
    );
  }
);

export default ConfirmDialog;
