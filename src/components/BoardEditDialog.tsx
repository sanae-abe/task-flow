import { memo } from 'react';

import type { BoardEditDialogProps } from '../types/dialog';
import { SimpleFormDialog } from './shared/Dialog';

const BoardEditDialog = memo<BoardEditDialogProps>(
  ({ isOpen, currentTitle, onSave, onCancel }) => (
    <SimpleFormDialog
      isOpen={isOpen}
      title='ボード名を編集'
      fieldLabel='ボード名'
      placeholder='ボード名を入力'
      saveText='保存'
      initialValue={currentTitle}
      onSave={onSave}
      onCancel={onCancel}
      onClose={onCancel}
    />
  )
);

export default BoardEditDialog;
