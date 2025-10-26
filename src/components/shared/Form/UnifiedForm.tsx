import { Button } from "@/components/ui/button";
import React, { memo, useCallback } from "react";

import type {
  UnifiedFormProps,
  FormFieldConfig,
} from "../../../types/unified-form";

import { useUnifiedForm } from "../../../hooks/useUnifiedForm";
import UnifiedFormField from "./UnifiedFormField";

/**
 * 統合フォームコンポーネント
 *
 * 設定可能なフィールド群から自動的にフォームを生成し、
 * バリデーション、状態管理、送信処理を統合的に行う
 */
const UnifiedForm = memo<UnifiedFormProps>(
  ({
    fields,
    onSubmit,
    onCancel,
    initialValues,
    submitText = "保存",
    cancelText = "キャンセル",
    showCancelButton = true,
    disabled = false,
    className,
    validateOnChange: _validateOnChange = true,
    validateOnBlur = true,
    autoComplete = true,
    children,
  }) => {
    // 統合フォーム管理フック
    const {
      state,
      setValue,
      setTouched,
      validateField,
      handleSubmit,
      getFieldError,
    } = useUnifiedForm(fields, initialValues);

    // フィールド変更ハンドラー
    const handleFieldChange = useCallback(
      (fieldConfig: FormFieldConfig) => (value: unknown) => {
        setValue(fieldConfig.name, value);

        // 設定されたonChangeも呼び出す
        if (fieldConfig.onChange) {
          fieldConfig.onChange(value);
        }
      },
      [setValue],
    );

    // フィールドブラーハンドラー
    const handleFieldBlur = useCallback(
      (fieldConfig: FormFieldConfig) => () => {
        setTouched(fieldConfig.name, true);

        if (validateOnBlur) {
          validateField(fieldConfig.name);
        }
      },
      [setTouched, validateField, validateOnBlur],
    );

    // フィールドキーダウンハンドラー
    const handleFieldKeyDown = useCallback(
      (fieldConfig: FormFieldConfig) => (event: React.KeyboardEvent) => {
        // 設定されたonKeyDownを呼び出す
        if (fieldConfig.onKeyDown) {
          fieldConfig.onKeyDown(event);
        }
      },
      [],
    );

    // フォーム送信ハンドラー
    const onFormSubmit = handleSubmit(onSubmit);

    // キャンセルハンドラー
    const handleCancel = useCallback(() => {
      if (onCancel) {
        onCancel();
      }
    }, [onCancel]);

    return (
      <form
        onSubmit={onFormSubmit}
        className={className}
        autoComplete={autoComplete ? "on" : "off"}
      >
        <div className="flex flex-col space-y-4 mt-2">
          {fields.map((fieldConfig) => {
            const fieldValue = state.values[fieldConfig.name];
            const fieldError = getFieldError(fieldConfig.name);
            const fieldTouched = state.touched[fieldConfig.name];

            return (
              <UnifiedFormField
                key={fieldConfig.id}
                {...fieldConfig}
                value={fieldValue}
                error={fieldError}
                touched={fieldTouched}
                disabled={disabled || fieldConfig.disabled}
                onChange={handleFieldChange(fieldConfig)}
                onBlur={handleFieldBlur(fieldConfig)}
                onKeyDown={handleFieldKeyDown(fieldConfig)}
              />
            );
          })}

          {children}

          {(showCancelButton || onCancel) && (
            <div className="flex gap-2 mt-3">
              <Button
                type="submit"
                variant="default"
                disabled={disabled || state.isSubmitting || !state.isValid}
              >
                {submitText}
              </Button>
              {showCancelButton && onCancel && (
                <Button onClick={handleCancel} variant="outline">
                  {cancelText}
                </Button>
              )}
            </div>
          )}
        </div>
      </form>
    );
  },
);

UnifiedForm.displayName = "UnifiedForm";

export default UnifiedForm;
