import { memo } from 'react';

import type { ColumnCreateDialogProps } from '../types/dialog';

import SimpleFormDialog from './SimpleFormDialog';

const ColumnCreateDialog = memo<ColumnCreateDialogProps>(({ 
  isOpen, 
  onSave, 
  onCancel 
}) => (
    <SimpleFormDialog
      isOpen={isOpen}
      title="新しいカラムを追加"
      fieldLabel="カラム名"
      placeholder="カラム名を入力"
      confirmText="追加"
      onSave={onSave}
      onCancel={onCancel}
      ariaLabelledBy="column-create-title"
      inputId="column-title-input"
    />
  ));

export default ColumnCreateDialog;