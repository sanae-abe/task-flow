import { memo } from 'react';

import type { BoardCreateDialogProps } from '../types/dialog';
import { SimpleFormDialog } from './shared/Dialog';

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
      saveText="作成"
      onSave={onSave}
      onCancel={onCancel}
      onClose={onCancel}
    />
  ));

export default BoardCreateDialog;