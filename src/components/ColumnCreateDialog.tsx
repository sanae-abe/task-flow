import { memo, useCallback, useMemo } from "react";

import type { ColumnCreateDialogProps } from "../types/dialog";
import type { FormFieldConfig } from "../types/unified-form";
import { useUnifiedForm } from "../hooks/useUnifiedForm";
import UnifiedDialog from "./shared/Dialog/UnifiedDialog";
import UnifiedFormField from "./shared/Form/UnifiedFormField";

const ColumnCreateDialog = memo<ColumnCreateDialogProps>(
  ({ isOpen, onSave, onCancel, columns = [] }) => {
    // 初期値の設定
    const initialValues = useMemo(() => ({
      title: '',
      insertIndex: columns.length // デフォルトは最後
    }), [columns.length]);

    // 挿入位置のオプション生成
    const positionOptions = useMemo(() => {
      const options = [{ value: '0', label: "最初" }];

      columns.forEach((column, index) => {
        options.push({
          value: (index + 1).toString(),
          label: `「${column.title}」の後`,
        });
      });

      return options;
    }, [columns]);

    // フィールド設定
    const fields: FormFieldConfig[] = useMemo(() => [
      // カラム名入力
      {
        id: 'title',
        name: 'title',
        type: 'text',
        label: 'カラム名',
        placeholder: 'カラム名を入力',
        value: initialValues.title,
        autoFocus: true,
        validation: {
          required: true,
          minLength: 1,
          maxLength: 50,
        },
        onChange: () => {}, // フォームで管理
      },
      // 挿入位置選択
      {
        id: 'insertIndex',
        name: 'insertIndex',
        type: 'select',
        label: '挿入位置',
        value: initialValues.insertIndex.toString(),
        options: positionOptions,
        onChange: () => {}, // フォームで管理
      },
    ], [initialValues, positionOptions]);

    // 統合フォーム管理
    const form = useUnifiedForm(fields, initialValues);

    // フォーム送信処理
    const handleSubmit = useCallback(async (values: Record<string, unknown>) => {
      const title = String(values['title'] || '').trim();
      const insertIndex = parseInt(String(values['insertIndex'] || '0'), 10);

      if (title) {
        onSave(title, insertIndex);
      }
    }, [onSave]);

    // キャンセル処理
    const handleCancel = useCallback(() => {
      onCancel();
    }, [onCancel]);

    // ダイアログアクション
    const actions = [
      {
        label: "キャンセル",
        onClick: handleCancel,
        variant: "outline" as const,
      },
      {
        label: "追加",
        onClick: form.handleSubmit(handleSubmit),
        variant: "default" as const,
        disabled: !form.state.values['title'] || String(form.state.values['title']).trim() === '' || form.state.isSubmitting,
      },
    ];

    return (
      <UnifiedDialog
        isOpen={isOpen}
        title="新しいカラムを追加"
        onClose={handleCancel}
        actions={actions}
        size="medium"
        closeOnEscape
        closeOnBackdropClick
      >
        <div className="flex flex-col gap-6">
          {fields.map((field) => (
            <UnifiedFormField
              key={field.id}
              {...field}
              value={form.state.values[field.name]}
              onChange={(value) => form.setValue(field.name, value)}
              onBlur={() => form.setTouched(field.name, true)}
              error={form.getFieldError(field.name)}
              touched={form.state.touched[field.name]}
              disabled={form.state.isSubmitting}
            />
          ))}
        </div>
      </UnifiedDialog>
    );
  },
);

ColumnCreateDialog.displayName = "ColumnCreateDialog";

export default ColumnCreateDialog;