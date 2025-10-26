import React, { memo } from "react";
import { cn } from '@/lib/utils';

import type { FormFieldConfig } from "../../../types/unified-form";
import { shouldShowError } from "../../../utils/formHelpers";
import {
  TextField,
  DateTimeField,
  CheckboxField,
  TextareaField,
  SelectField,
  LabelSelectorField,
  ColorSelectorField,
  FileUploaderField,
  RecurrenceSelectorField,
  CustomComponentField,
} from "./fields";
import InlineMessage from "../InlineMessage";

interface UnifiedFormFieldProps extends FormFieldConfig {
  _error?: string | null;
  touched?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
}

/**
 * 統合フォームフィールドコンポーネント
 *
 * すべてのフィールドタイプに対応した汎用フォームフィールド
 * モジュラー構造により、各フィールドタイプが独立したコンポーネントとして実装されています。
 */
const UnifiedFormField = memo<UnifiedFormFieldProps>(
  ({
    id,
    name,
    type,
    label,
    placeholder,
    value,
    validation,
    options,
    rows = 3,
    autoFocus = false,
    disabled = false,
    hideLabel = false,
    customComponent,
    sx,
    onChange,
    onKeyDown,
    onBlur,
    onFocus,
    _error,
    touched,
    helpText,
    step,
    min,
    max,
  }) => {
    // エラー表示判定
    const showError = shouldShowError(touched, _error);

    /**
     * フィールドタイプに応じたコンポーネントをレンダリング
     */
    const renderField = (): React.ReactNode => {
      // 全フィールドで共通のベースプロパティ
      const baseProps = {
        id,
        name,
        value,
        onChange,
        onKeyDown,
        onBlur,
        onFocus,
        placeholder,
        autoFocus,
        disabled,
        validation,
        _error,
        touched,
        sx,
      };

      switch (type) {
        case "text":
        case "email":
        case "password":
        case "number":
          return (
            <TextField
              {...baseProps}
              type={type}
              step={step}
              min={min}
              max={max}
            />
          );

        case "date":
        case "datetime-local":
        case "time":
          return (
            <DateTimeField
              {...baseProps}
              type={type}
              step={step}
              min={min}
              max={max}
            />
          );

        case "checkbox":
          return <CheckboxField {...baseProps} />;

        case "textarea":
          return <TextareaField {...baseProps} rows={rows} />;

        case "select":
          return <SelectField {...baseProps} options={options} />;

        case "label-selector":
          return <LabelSelectorField {...baseProps} type="label-selector" />;

        case "color-selector":
          return <ColorSelectorField {...baseProps} type="color-selector" />;

        case "file":
          return <FileUploaderField {...baseProps} type="file" />;

        case "recurrence-selector":
          return (
            <RecurrenceSelectorField
              {...baseProps}
              type="recurrence-selector"
            />
          );

        case "custom":
          return (
            <CustomComponentField
              {...baseProps}
              type="custom"
              customComponent={customComponent}
            />
          );

        default:
          return null;
      }
    };

    return (
      <div
        className={cn(
          "space-y-2",
          sx && "custom-styles" // 後で処理
        )}
        style={sx ? (sx as React.CSSProperties) : undefined}
      >
        {!hideLabel && (
          <label
            htmlFor={id}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              validation?.required && "after:content-['*'] after:ml-0.5 after:text-red-500"
            )}
          >
            {label}
          </label>
        )}

        {renderField()}

        {helpText && !showError && (
          <p className="text-sm text-muted-foreground">
            {helpText}
          </p>
        )}

        {showError && (
          <InlineMessage variant="critical" message={_error || "入力に誤りがあります"} size="small" />
        )}
      </div>
    );
  },
);

// デバッグ用のdisplayName設定
UnifiedFormField.displayName = "UnifiedFormField";

export default UnifiedFormField;