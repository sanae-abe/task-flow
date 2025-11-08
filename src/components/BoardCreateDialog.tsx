import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import type { BoardCreateDialogProps } from '../types/dialog';
import { SimpleFormDialogWithZod } from './shared/Dialog/SimpleFormDialogWithZod';

const BoardCreateDialog = memo<BoardCreateDialogProps>(
  ({ isOpen, onSave, onCancel }) => {
    const { t } = useTranslation();

    // Board名のバリデーションスキーマ（翻訳対応）
    const boardNameSchema = useMemo(
      () =>
        z
          .string()
          .min(1, t('validation.required'))
          .max(100, t('validation.tooLong', { max: 100 })),
      [t]
    );

    return (
      <SimpleFormDialogWithZod
        isOpen={isOpen}
        title={t('board.createBoardTitle')}
        fieldLabel={t('board.boardName')}
        placeholder={t('board.boardNamePlaceholder')}
        saveText={t('common.create')}
        onSave={onSave}
        onCancel={onCancel}
        onClose={onCancel}
        schema={boardNameSchema}
        showErrors
      />
    );
  }
);

export default BoardCreateDialog;
