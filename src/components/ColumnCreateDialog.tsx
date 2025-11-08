import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import type { ColumnCreateDialogProps } from '../types/dialog';
import type { FormFieldConfig } from '../types/unified-form';
import { useUnifiedForm } from '../hooks/useUnifiedForm';
import { validateData } from '@/schemas/validation-utils';
import UnifiedDialog from './shared/Dialog/UnifiedDialog';
import UnifiedFormField from './shared/Form/UnifiedFormField';

// Zodスキーマ - カラム名のバリデーション（動的生成に変更）
const createColumnTitleSchema = (t: (key: string, options?: Record<string, unknown>) => string) =>
  z
    .string()
    .min(1, t('validation.required'))
    .max(100, t('validation.tooLong', { max: 100 }));

const ColumnCreateDialog = memo<ColumnCreateDialogProps>(
  ({ isOpen, onSave, onCancel, columns = [] }) => {
    const { t } = useTranslation();

    // Zodスキーマを動的生成
    const columnTitleSchema = useMemo(() => createColumnTitleSchema(t), [t]);

    // 初期値の設定
    const initialValues = useMemo(
      () => ({
        title: '',
        insertIndex: columns.length, // デフォルトは最後
      }),
      [columns.length]
    );

    // 挿入位置のオプション生成
    const positionOptions = useMemo(() => {
      const options = [{ value: '0', label: t('column.insertFirst') }];

      columns.forEach((column, index) => {
        options.push({
          value: (index + 1).toString(),
          label: t('column.insertAfter', { title: column.title }),
        });
      });

      return options;
    }, [columns, t]);

    // Zodバリデーション関数
    const validateColumnTitle = useCallback((value: unknown): string | null => {
      const trimmedTitle = String(value || '').trim();

      if (!trimmedTitle) {
        return null; // required validationで処理
      }

      const validationResult = validateData(columnTitleSchema, trimmedTitle);

      if (!validationResult.success) {
        return validationResult.errors?.[0] || t('validation.invalidFormat');
      }

      return null;
    }, [columnTitleSchema, t]);

    // フィールド設定
    const fields: FormFieldConfig[] = useMemo(
      () => [
        // カラム名入力
        {
          id: 'title',
          name: 'title',
          type: 'text',
          label: t('column.columnName'),
          placeholder: t('column.columnNamePlaceholder'),
          value: initialValues.title,
          autoFocus: true,
          validation: {
            required: true,
            minLength: 1,
            maxLength: 100,
            custom: validateColumnTitle, // Zodバリデーション追加
          },
          onChange: () => {}, // フォームで管理
        },
        // 挿入位置選択
        {
          id: 'insertIndex',
          name: 'insertIndex',
          type: 'select',
          label: t('column.insertPosition'),
          value: initialValues.insertIndex.toString(),
          options: positionOptions,
          onChange: () => {}, // フォームで管理
        },
      ],
      [initialValues, positionOptions, t, validateColumnTitle]
    );

    // 統合フォーム管理
    const form = useUnifiedForm(fields, initialValues);

    // フォーム送信処理
    const handleSubmit = useCallback(
      async (values: Record<string, unknown>) => {
        const title = String(values['title'] || '').trim();
        const insertIndex = parseInt(String(values['insertIndex'] || '0'), 10);

        if (title) {
          onSave(title, insertIndex);
        }
      },
      [onSave]
    );

    // キャンセル処理
    const handleCancel = useCallback(() => {
      onCancel();
    }, [onCancel]);

    // ダイアログアクション
    const actions = [
      {
        label: t('common.cancel'),
        onClick: handleCancel,
        variant: 'outline' as const,
      },
      {
        label: t('common.add'),
        onClick: form.handleSubmit(handleSubmit),
        variant: 'default' as const,
        disabled:
          !form.state.values['title'] ||
          String(form.state.values['title']).trim() === '' ||
          form.state.isSubmitting,
      },
    ];

    return (
      <UnifiedDialog
        isOpen={isOpen}
        title={t('column.addColumnTitle')}
        onClose={handleCancel}
        actions={actions}
        size='medium'
        closeOnEscape
        closeOnBackdropClick
      >
        <div className='flex flex-col gap-6'>
          {fields.map(field => (
            <UnifiedFormField
              key={field.id}
              {...field}
              value={form.state.values[field.name]}
              onChange={value => form.setValue(field.name, value)}
              onBlur={() => form.setTouched(field.name, true)}
              _error={form.getFieldError(field.name)}
              touched={form.state.touched[field.name]}
              disabled={form.state.isSubmitting}
            />
          ))}
        </div>
      </UnifiedDialog>
    );
  }
);

ColumnCreateDialog.displayName = 'ColumnCreateDialog';

export default ColumnCreateDialog;
