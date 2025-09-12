import type { ReactNode } from 'react';
import type { Label, FileAttachment } from '../types';

// 基本フォームフィールド型
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'date' 
  | 'datetime-local' 
  | 'password' 
  | 'email' 
  | 'number' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'label-selector' 
  | 'color-selector' 
  | 'custom';

// バリデーションルール
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

// フォームフィールド設定
export interface FormFieldConfig {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  value: any;
  validation?: ValidationRule;
  options?: Array<{ value: string; label: string }>;
  rows?: number; // textarea用
  autoFocus?: boolean;
  disabled?: boolean;
  hideLabel?: boolean;
  customComponent?: ReactNode;
  sx?: Record<string, unknown>;
  onChange: (value: any) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

// フォームエラー状態
export interface FormError {
  fieldId: string;
  message: string;
}

// フォーム状態管理
export interface FormState {
  values: Record<string, any>;
  errors: FormError[];
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// フォームアクション
export type FormAction = 
  | { type: 'SET_FIELD_VALUE'; fieldId: string; value: any }
  | { type: 'SET_FIELD_ERROR'; fieldId: string; error: string | null }
  | { type: 'SET_FIELD_TOUCHED'; fieldId: string; touched: boolean }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_ERRORS'; errors: FormError[] }
  | { type: 'RESET_FORM'; initialValues?: Record<string, any> }
  | { type: 'VALIDATE_FORM' };

// 統合フォームプロパティ
export interface UnifiedFormProps {
  fields: FormFieldConfig[];
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  initialValues?: Record<string, any>;
  submitText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
  disabled?: boolean;
  className?: string;
  sx?: Record<string, unknown>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  autoComplete?: boolean;
  children?: ReactNode;
}

// 特殊フィールド型定義
export interface LabelSelectorFieldProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

export interface FileUploaderFieldProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
  showModeSelector?: boolean;
}

export interface ColorSelectorFieldProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

// フォームレイアウト設定
export interface FormLayoutConfig {
  direction?: 'column' | 'row';
  spacing?: number;
  showLabels?: boolean;
  fieldWidth?: 'auto' | 'full' | string;
  groupSpacing?: number;
}

// 高度なフォーム設定
export interface AdvancedFormConfig {
  layout?: FormLayoutConfig;
  validation?: {
    validateOnSubmit?: boolean;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    showErrorsImmediately?: boolean;
  };
  submission?: {
    preventMultipleSubmit?: boolean;
    showLoadingState?: boolean;
    resetOnSuccess?: boolean;
  };
  accessibility?: {
    announceErrors?: boolean;
    focusFirstError?: boolean;
  };
}

// タスク専用フォーム設定（既存との互換性）
export interface TaskFormConfig {
  showCompletedAt?: boolean;
  showLabels?: boolean;
  showAttachments?: boolean;
  showStatus?: boolean;
  isEditing?: boolean;
}

// 汎用フォームフックの型
export interface UseFormReturn {
  state: FormState;
  setValue: (fieldId: string, value: any) => void;
  setError: (fieldId: string, error: string | null) => void;
  setTouched: (fieldId: string, touched: boolean) => void;
  validateField: (fieldId: string) => boolean;
  validateForm: () => boolean;
  resetForm: (initialValues?: Record<string, any>) => void;
  handleSubmit: (onSubmit: (values: Record<string, any>) => void | Promise<void>) => (e?: React.FormEvent) => void;
  isFieldValid: (fieldId: string) => boolean;
  getFieldError: (fieldId: string) => string | null;
}

// フォームイベントハンドラー型
export interface FormEventHandlers {
  onFieldChange: (fieldId: string, value: any) => void;
  onFieldBlur: (fieldId: string) => void;
  onFieldFocus: (fieldId: string) => void;
  onKeyDown: (event: React.KeyboardEvent, fieldId: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onReset: () => void;
}