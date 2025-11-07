import { memo } from 'react';
import { z } from 'zod';

import { useFormDialogWithZod } from '../../../hooks/useFormDialogWithZod';
import type { SimpleFormDialogProps } from '../../../types/unified-dialog';
import { UnifiedFormField } from '../../shared/Form';

import UnifiedDialog from './UnifiedDialog';

interface SimpleFormDialogWithZodProps<T extends z.ZodSchema>
  extends Omit<SimpleFormDialogProps, 'required' | 'minLength'> {
  schema?: T;
  showErrors?: boolean;
}

/**
 * Zod対応シンプルフォームダイアログコンポーネント
 *
 * 単一の入力フィールドを持つダイアログを提供します。
 * Zodスキーマによるランタイムバリデーションをサポートします。
 */
function SimpleFormDialogWithZodComponent<T extends z.ZodSchema>({
  isOpen,
  title,
  fieldLabel,
  placeholder,
  initialValue = '',
  onSave,
  onCancel,
  saveText = '保存',
  schema,
  showErrors = true,
  ...dialogProps
}: SimpleFormDialogWithZodProps<T>) {
  const {
    value,
    setValue,
    handleSave,
    handleKeyPress,
    isValid,
    errors,
    fieldErrors,
  } = useFormDialogWithZod({
    isOpen,
    initialValue,
    onSave,
    onCancel,
    schema,
  });

  const actions = [
    {
      label: 'キャンセル',
      onClick: onCancel,
      variant: 'outline' as const,
    },
    {
      label: saveText,
      onClick: handleSave,
      variant: 'primary' as const,
      disabled: !isValid,
    },
  ];

  const inputId = `simple-form-input-${Math.random().toString(36).substring(2, 11)}`;

  // フィールドレベルのエラーメッセージ取得
  const errorMessage = showErrors
    ? fieldErrors[inputId] || errors[0]
    : undefined;

  return (
    <UnifiedDialog
      {...dialogProps}
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      actions={actions}
      size='medium'
      closeOnEscape
      closeOnBackdropClick
    >
      <div className='flex flex-col gap-2'>
        <UnifiedFormField
          id={inputId}
          name={inputId}
          type='text'
          label={fieldLabel}
          value={value}
          placeholder={placeholder}
          onChange={value => setValue(value as string)}
          onKeyDown={event =>
            handleKeyPress(event as React.KeyboardEvent<HTMLInputElement>)
          }
          autoFocus
          validation={{ required: true }}
          _error={errorMessage}
        />

        {/* グローバルエラー表示 */}
        {showErrors && errors.length > 0 && (
          <div
            className='rounded-md bg-red-50 p-3 text-sm text-red-800'
            role='alert'
          >
            <ul className='list-disc pl-5 space-y-1'>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </UnifiedDialog>
  );
}

// メモ化されたコンポーネントをエクスポート
const SimpleFormDialogWithZod = memo(
  SimpleFormDialogWithZodComponent
) as typeof SimpleFormDialogWithZodComponent;

export { SimpleFormDialogWithZod };
export default SimpleFormDialogWithZod;
