import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import type { ColumnEditDialogProps } from '../types/dialog';

import { SimpleFormDialogWithZod } from './shared/Dialog/SimpleFormDialogWithZod';

// Column名のバリデーションスキーマ
const columnNameSchema = z
  .string()
  .min(1, 'カラムタイトルは必須です')
  .max(100, 'カラムタイトルは100文字以内で入力してください');

const ColumnEditDialog = memo<ColumnEditDialogProps>(
  ({ isOpen, currentTitle, onSave, onCancel }) => {
    const { t } = useTranslation();

    return (
      <SimpleFormDialogWithZod
        isOpen={isOpen}
        title={t('column.editColumn')}
        fieldLabel={t('column.columnName')}
        placeholder={t('column.columnNamePlaceholder')}
        saveText={t('common.save')}
        initialValue={currentTitle}
        onSave={onSave}
        onCancel={onCancel}
        onClose={onCancel}
        schema={columnNameSchema}
        showErrors
      />
    );
  }
);

export default ColumnEditDialog;
