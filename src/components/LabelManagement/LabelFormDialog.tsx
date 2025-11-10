import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { Label } from '../../types';
import type { FormFieldConfig } from '../../types/unified-form';
import { labelCreateInputSchema } from '@/schemas/label';
import { validateData } from '@/schemas/validation-utils';
import { useLabel } from '../../contexts/LabelContext';
import { useBoard } from '../../contexts/BoardContext';
import { useUnifiedForm } from '../../hooks/useUnifiedForm';
import UnifiedDialog from '../shared/Dialog/UnifiedDialog';
import UnifiedFormField from '../shared/Form/UnifiedFormField';
import LabelChip from '../LabelChip';

interface LabelFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (labelData: {
    name: string;
    color: string;
    boardId?: string;
  }) => void;
  onLabelCreated?: (label: Label) => void;
  label?: Label | null;
  mode: 'create' | 'edit';
  enableBoardSelection?: boolean; // 全ボード管理モードでのみtrue
}

const LabelFormDialog: React.FC<LabelFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  label,
  mode,
  enableBoardSelection = false,
}) => {
  const { t } = useTranslation();
  const { getAllLabels } = useLabel();
  const { state: boardState } = useBoard();

  // 初期値の設定
  const initialValues = useMemo(() => {
    if (mode === 'edit' && label) {
      return {
        name: label.name,
        color: label.color,
        boardId: undefined, // 編集時はボード選択不要
      };
    }
    return {
      name: '',
      color: '#0969da',
      boardId:
        enableBoardSelection && boardState.boards.length > 0
          ? boardState.boards[0]?.id
          : undefined,
    };
  }, [mode, label, enableBoardSelection, boardState.boards]);

  // プレビュー用のラベルデータ
  const createPreviewLabel = useCallback(
    (formValues: Record<string, unknown>): Label => ({
      id: 'preview',
      name: String(formValues['name'] || t('label.labelName')),
      color: String(formValues['color'] || '#0969da'),
    }),
    [t]
  );

  // Zodバリデーション + カスタムバリデーション（重複チェック）
  // modeとlabelを直接使用せず、固定値として渡すためにuseMemoで生成
  const validateLabelName = useMemo(
    () =>
      (value: unknown): string | null => {
        const trimmedName = String(value || '').trim();

        if (!trimmedName) {
          return null; // required validationで処理
        }

        // Zodバリデーション
        const labelData = {
          name: trimmedName,
          color: '#0969da', // バリデーションのためのダミー値
        };
        const zodResult = validateData(labelCreateInputSchema, labelData);

        if (!zodResult.success && zodResult.errors) {
          const nameError = zodResult.errors.find(err =>
            err.startsWith('name:')
          );
          if (nameError) {
            return nameError.replace('name:', '').trim();
          }
        }

        // 重複チェック（編集時は自分自身を除外）
        const allLabels = getAllLabels();
        const isDuplicate = allLabels.some(existingLabel => {
          const isSameLabel =
            mode === 'edit' && label && existingLabel.id === label.id;
          return (
            !isSameLabel &&
            existingLabel.name.toLowerCase() === trimmedName.toLowerCase()
          );
        });

        return isDuplicate ? t('label.duplicateName') : null;
      },
    [getAllLabels, mode, label, t]
  );

  // フィールド設定
  const fields: FormFieldConfig[] = useMemo(() => {
    const baseFields: FormFieldConfig[] = [
      // プレビューエリア
      {
        id: 'preview',
        name: 'preview',
        type: 'custom',
        label: t('label.preview'),
        value: '',
        customComponent: null, // 後で動的に設定
        onChange: () => {}, // プレビューは読み取り専用
      },
      // ラベル名入力
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: t('label.labelName'),
        placeholder: t('label.labelNamePlaceholder'),
        value: initialValues.name,
        autoFocus: true,
        validation: {
          required: true,
          minLength: 2,
          maxLength: 50,
          custom: validateLabelName,
        },
        onChange: () => {}, // フォームで管理
      },
      // カラーピッカー
      {
        id: 'color',
        name: 'color',
        type: 'color-selector',
        label: t('label.color'),
        value: initialValues.color,
        onChange: () => {}, // フォームで管理
      },
    ];

    // ボード選択フィールド（条件付き追加）
    if (enableBoardSelection && mode === 'create') {
      const boardOptions = boardState.boards.map(board => ({
        value: board.id,
        label: board.title,
      }));

      baseFields.push({
        id: 'boardId',
        name: 'boardId',
        type: 'select',
        label: t('label.targetBoard'),
        value: initialValues.boardId,
        options: boardOptions,
        onChange: () => {}, // フォームで管理
      });
    }

    return baseFields;
  }, [
    initialValues,
    enableBoardSelection,
    mode,
    boardState.boards,
    validateLabelName,
    t,
  ]);

  // 統合フォーム管理
  const form = useUnifiedForm(fields, initialValues);

  // プレビューコンポーネントの動的生成
  const previewComponent = useMemo(() => {
    const previewLabel = createPreviewLabel(form.state.values);
    return (
      <div className='rounded-lg p-4 border border-border border-gray-200'>
        <div className='flex justify-center'>
          <LabelChip label={previewLabel} />
        </div>
      </div>
    );
  }, [form.state.values, createPreviewLabel]);

  // プレビューフィールドのカスタムコンポーネントを更新
  const updatedFields = useMemo(
    () =>
      fields.map(field =>
        field.id === 'preview'
          ? { ...field, customComponent: previewComponent }
          : field
      ),
    [fields, previewComponent]
  );

  // フォーム送信処理
  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        const labelData = {
          name: String(values['name'] || '').trim(),
          color: String(values['color'] || '#0969da'),
          boardId: values['boardId'] ? String(values['boardId']) : undefined,
        };

        if (onSave) {
          onSave(labelData);
        }

        onClose();
      } catch (_error) {
        form.setError('name', t('label.saveFailed'));
      }
    },
    [onSave, onClose, form, t]
  );

  // キャンセル処理
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  // Enterキーでの保存
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ctrl/Cmd + Enterの組み合わせのみ許可
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        // フォームが有効で送信中でない場合のみ送信
        if (form.state.isValid && !form.state.isSubmitting) {
          form.handleSubmit(handleSubmit)();
        }
      }
      // Enterキー単独では何もしない（デフォルト動作を防ぐ）
    },
    [form, handleSubmit]
  );

  // ダイアログアクション
  const actions = [
    {
      label: t('common.cancel'),
      variant: 'outline' as const,
      onClick: handleCancel,
    },
    {
      label: mode === 'create' ? t('common.create') : t('common.update'),
      variant: 'default' as const,
      onClick: form.handleSubmit(handleSubmit),
      disabled:
        !form.state.values['name'] ||
        String(form.state.values['name']).trim() === '' ||
        form.state.isSubmitting,
    },
  ];

  return (
    <UnifiedDialog
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? t('label.createLabel') : t('label.editLabel')}
      variant='modal'
      size='medium'
      actions={actions}
    >
      <div className='flex flex-col gap-4' onKeyDown={handleKeyDown}>
        {updatedFields.map(field => (
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
};

export default LabelFormDialog;
