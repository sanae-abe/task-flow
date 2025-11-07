import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import type { BoardEditDialogProps } from '../types/dialog';
import { SimpleFormDialogWithZod } from './shared/Dialog/SimpleFormDialogWithZod';

// Board名のバリデーションスキーマ
const boardNameSchema = z
  .string()
  .min(1, 'ボードタイトルは必須です')
  .max(100, 'ボードタイトルは100文字以内で入力してください');

const BoardEditDialog = memo<BoardEditDialogProps>(
  ({ isOpen, currentTitle, onSave, onCancel }) => {
    const { t } = useTranslation();

    return (
      <SimpleFormDialogWithZod
        isOpen={isOpen}
        title={t('board.editBoardName')}
        fieldLabel={t('board.boardName')}
        placeholder={t('board.boardNamePlaceholder')}
        saveText={t('common.save')}
        initialValue={currentTitle}
        onSave={onSave}
        onCancel={onCancel}
        onClose={onCancel}
        schema={boardNameSchema}
        showErrors
      />
    );
  }
);

export default BoardEditDialog;
