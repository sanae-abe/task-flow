import { memo } from 'react';

import type { ColumnEditDialogProps } from '../types/dialog';

import SimpleFormDialog from './SimpleFormDialog';

const ColumnEditDialog = memo<ColumnEditDialogProps>(({ 
  isOpen, 
  currentTitle, 
  onSave, 
  onCancel 
}) => (
    <SimpleFormDialog
      isOpen={isOpen}
      title="カラム名を編集"
      fieldLabel="カラム名"
      placeholder="カラム名を入力"
      confirmText="保存"
      initialValue={currentTitle}
      onSave={onSave}
      onCancel={onCancel}
      ariaLabelledBy="column-edit-title"
      inputId="column-title-input"
    />
  ));

export default ColumnEditDialog;