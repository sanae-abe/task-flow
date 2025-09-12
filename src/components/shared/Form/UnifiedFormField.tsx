import { Box, Text, TextInput, Textarea, Select } from '@primer/react';
import React, { memo } from 'react';

import type { FormFieldConfig } from '../../../types/unified-form';
import type { Label, FileAttachment } from '../../../types';

import ColorSelector from '../../ColorSelector';
import FileUploader from '../../FileUploader';
import ImprovedLabelSelector from '../../ImprovedLabelSelector';

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
    mb: 4,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 1
  },
  label: {
    fontSize: 1,
    color: 'fg.muted',
    fontWeight: '700'
  },
  input: {
    width: '100%'
  },
  errorText: {
    fontSize: 0,
    color: 'danger.fg',
    mt: 1
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
  touched
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

  // コンテナスタイル
  const containerStyles = sx ? { ...UNIFIED_FORM_STYLES.container, ...sx } : UNIFIED_FORM_STYLES.container;
  
  // エラー表示判定
  const showError = touched && error;
  const hasError = Boolean(error);

  // フィールドタイプ別のレンダリング
  const renderField = (): React.ReactNode => {
    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <TextInput
            id={id}
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
            sx={{
              ...UNIFIED_FORM_STYLES.input,
              borderColor: hasError ? 'danger.emphasis' : undefined
            }}
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
            id={id}
            name={name}
            type={type}
            value={toStringValue(value)}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            autoFocus={autoFocus}
            disabled={disabled}
            sx={{
              ...UNIFIED_FORM_STYLES.input,
              borderColor: hasError ? 'danger.emphasis' : undefined
            }}
            aria-required={validation?.required}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={id}
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
              height: `${rows * 20 + 16}px`,
              borderColor: hasError ? 'danger.emphasis' : undefined
            }}
            aria-required={validation?.required}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
          />
        );

      case 'select':
        return (
          <Select
            id={id}
            name={name}
            value={toStringValue(value)}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            autoFocus={autoFocus}
            disabled={disabled}
            sx={{
              ...UNIFIED_FORM_STYLES.input,
              borderColor: hasError ? 'danger.emphasis' : undefined
            }}
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
          <ImprovedLabelSelector
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

      case 'custom':
        return customComponent ?? null;

      default:
        return null;
    }
  };

  return (
    <Box sx={containerStyles}>
      {!hideLabel && (
        <Text 
          as="label" 
          htmlFor={id}
          sx={UNIFIED_FORM_STYLES.label}
        >
          {label}
          {validation?.required && (
            <Text as="span" sx={{ color: 'danger.fg', ml: 1 }}>*</Text>
          )}
        </Text>
      )}
      
      {renderField()}
      
      {showError && (
        <Text 
          id={`${id}-error`}
          sx={UNIFIED_FORM_STYLES.errorText}
          role="alert"
        >
          {error}
        </Text>
      )}
    </Box>
  );
});

UnifiedFormField.displayName = 'UnifiedFormField';

export default UnifiedFormField;
export { UNIFIED_FORM_STYLES };