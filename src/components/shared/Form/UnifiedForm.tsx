import { Box, Button } from "@primer/react";
import React, { memo, useCallback } from "react";

import type {
  UnifiedFormProps,
  FormFieldConfig,
} from "../../../types/unified-form";

import { useUnifiedForm } from "../../../hooks/useUnifiedForm";
import UnifiedFormField from "./UnifiedFormField";
import { VBox } from "../FlexBox";

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
    sx,
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
      <Box
        as="form"
        onSubmit={onFormSubmit}
        className={className}
        sx={sx}
        autoComplete={autoComplete ? "on" : "off"}
      >
        <VBox>
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
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="primary"
                disabled={disabled || state.isSubmitting || !state.isValid}
              >
                {submitText}
              </Button>
              {showCancelButton && onCancel && (
                <Button onClick={handleCancel} variant="default">
                  {cancelText}
                </Button>
              )}
            </Box>
          )}
        </VBox>
      </Box>
    );
  },
);

UnifiedForm.displayName = "UnifiedForm";

export default UnifiedForm;
