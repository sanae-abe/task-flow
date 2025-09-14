import { memo } from 'react';

import type { BoardCreateDialogProps } from '../types/dialog';

import SimpleFormDialog from './SimpleFormDialog';

const BoardCreateDialog = memo<BoardCreateDialogProps>(({ 
  isOpen, 
  onSave, 
  onCancel 
}) => (
    <SimpleFormDialog
      isOpen={isOpen}
      title="新しいボードを作成"
      fieldLabel="ボード名"
      placeholder="ボード名を入力"
      confirmText="作成"
      onSave={onSave}
      onCancel={onCancel}
      ariaLabelledBy="board-create-title"
      inputId="board-title-input"
    />
  ));

export default BoardCreateDialog;