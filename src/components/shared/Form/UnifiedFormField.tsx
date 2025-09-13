import { Text, TextInput, Textarea, Select, FormControl } from '@primer/react';
import React, { memo } from 'react';

import type { FormFieldConfig } from '../../../types/unified-form';
import type { Label, FileAttachment, RecurrenceConfig } from '../../../types';

import ColorSelector from '../../ColorSelector';
import FileUploader from '../../FileUploader';
import LabelSelector from '../../LabelSelector';
import RecurrenceSelector from '../../RecurrenceSelector';

// ヘルパー関数: unknown型を安全にstringに変換
const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

// フォームフィールドスタイル定数
const UNIFIED_FORM_STYLES = {
  container: {
    mb: 4
  },
  input: {
    width: '100%'
  }
} as const;

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
 */
const UnifiedFormField = memo<UnifiedFormFieldProps>(({
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
  helpText
}) => {
  // 共通のイベントハンドラー
  const handleChange = (newValue: unknown) => {
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    handleChange(e.target.value);
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  const handleFocus = () => {
    if (onFocus) {
      onFocus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // エラー表示判定
  const showError = touched && error;
  const hasError = Boolean(error);
  
  // validationStatus
  const validationStatus = hasError ? 'error' : undefined;

  // フィールドタイプ別のレンダリング
  const renderField = (): React.ReactNode => {
    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <TextInput
            name={name}
            type={type}
            value={toStringValue(value)}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={disabled}
            sx={UNIFIED_FORM_STYLES.input}
            validationStatus={validationStatus}
            aria-required={validation?.required}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
            aria-label={hideLabel ? label : undefined}
          />
        );

      case 'date':
      case 'datetime-local':
        return (
          <TextInput
            name={name}
            type={type}
            value={toStringValue(value)}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            autoFocus={autoFocus}
            disabled={disabled}
            sx={UNIFIED_FORM_STYLES.input}
            validationStatus={validationStatus}
            aria-required={validation?.required}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
          />
        );

      case 'textarea':
        return (
          <Textarea
            name={name}
            value={toStringValue(value)}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={disabled}
            sx={{
              ...UNIFIED_FORM_STYLES.input,
              resize: 'none',
              height: `${rows * 20 + 16}px`
            }}
            validationStatus={validationStatus}
            aria-required={validation?.required}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
          />
        );

      case 'select':
        return (
          <Select
            name={name}
            value={toStringValue(value)}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            autoFocus={autoFocus}
            disabled={disabled}
            sx={UNIFIED_FORM_STYLES.input}
            validationStatus={validationStatus}
            aria-required={validation?.required}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
          >
            {placeholder && (
              <Select.Option value="">{placeholder}</Select.Option>
            )}
            {options?.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );

      case 'label-selector':
        return (
          <LabelSelector
            selectedLabels={value as Label[] ?? []}
            onLabelsChange={(labels: Label[]) => handleChange(labels)}
          />
        );

      case 'color-selector':
        return (
          <ColorSelector
            selectedColor={toStringValue(value) || 'default'}
            onColorSelect={(color: string) => handleChange(color)}
          />
        );

      case 'file':
        return (
          <FileUploader
            attachments={value as FileAttachment[] ?? []}
            onAttachmentsChange={(attachments: FileAttachment[]) => handleChange(attachments)}
            showModeSelector={false}
          />
        );

      case 'recurrence-selector':
        const recurrenceValue = value as RecurrenceConfig | undefined;
        return (
          <RecurrenceSelector
            recurrence={recurrenceValue || { enabled: false, pattern: 'daily', interval: 1 }}
            onRecurrenceChange={(recurrence: RecurrenceConfig | undefined) => handleChange(recurrence)}
          />
        );

      case 'custom':
        return customComponent ?? null;

      default:
        return null;
    }
  };

  return (
    <FormControl id={id} sx={sx ? { ...UNIFIED_FORM_STYLES.container, ...sx } : UNIFIED_FORM_STYLES.container}>
      {!hideLabel && (
        <FormControl.Label>
          {label}
          {validation?.required && (
            <Text as="span" sx={{ color: 'danger.fg', ml: 1 }}>*</Text>
          )}
        </FormControl.Label>
      )}
      
      {renderField()}

      {helpText && !showError && (
        <FormControl.Caption>
          {helpText}
        </FormControl.Caption>
      )}

      {showError && (
        <FormControl.Validation variant="error">
          {error}
        </FormControl.Validation>
      )}
    </FormControl>
  );
});

UnifiedFormField.displayName = 'UnifiedFormField';

export default UnifiedFormField;
export { UNIFIED_FORM_STYLES };