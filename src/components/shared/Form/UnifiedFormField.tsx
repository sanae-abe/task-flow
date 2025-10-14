import React, { memo } from "react";
import { FormControl } from "@primer/react";

import type { FormFieldConfig } from "../../../types/unified-form";
import { shouldShowError } from "../../../utils/formHelpers";
import { UNIFIED_FORM_STYLES } from "./styles";
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
import ErrorMessage from "../../ErrorMessage";

interface UnifiedFormFieldProps extends FormFieldConfig {
  error?: string | null;
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
    error,
    touched,
    helpText,
    step,
    min,
    max,
  }) => {
    // エラー表示判定
    const showError = shouldShowError(touched, error);

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
        error,
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
      <FormControl
        id={id}
        sx={
          sx
            ? { ...UNIFIED_FORM_STYLES.container, ...sx }
            : UNIFIED_FORM_STYLES.container
        }
      >
        {!hideLabel && (
          <FormControl.Label required={validation?.required}>
            {label}
          </FormControl.Label>
        )}

        {renderField()}

        {helpText && !showError && (
          <FormControl.Caption>{helpText}</FormControl.Caption>
        )}

        {showError && (
          <ErrorMessage error={error || "入力に誤りがあります"} />
        )}
      </FormControl>
    );
  },
);

// デバッグ用のdisplayName設定
UnifiedFormField.displayName = "UnifiedFormField";

export default UnifiedFormField;