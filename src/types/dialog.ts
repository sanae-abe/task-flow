// 共通ダイアログ関連の型
export interface DialogActionsProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmText: string;
  cancelText?: string;
  isConfirmDisabled?: boolean;
  confirmVariant?: 'primary' | 'danger';
  // 削除系操作（永続的な削除）
  showDelete?: boolean;
  onDelete?: () => void;
  deleteText?: string;
  // 除去系操作（設定の無効化など）
  showRemove?: boolean;
  onRemove?: () => void;
  removeText?: string;
}

// フォーム関連の型
export interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  required?: boolean;
  hideLabel?: boolean;
  sx?: Record<string, unknown>;
}

export interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  required?: boolean;
}

export interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export interface DateTimeFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  required?: boolean;
}

// 共通フォームダイアログの型
export interface DialogWithFormProps {
  isOpen: boolean;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export interface SimpleFormDialogProps {
  isOpen: boolean;
  title: string;
  fieldLabel: string;
  placeholder: string;
  confirmText: string;
  initialValue?: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  ariaLabelledBy: string;
  inputId: string;
}

// 個別ダイアログの型（統一された型を継承）
export interface BoardCreateDialogProps extends DialogWithFormProps {}

export interface BoardEditDialogProps extends DialogWithFormProps {
  currentTitle: string;
}

export interface ColumnCreateDialogProps {
  isOpen: boolean;
  onSave: (title: string, insertIndex?: number) => void;
  onCancel: () => void;
  columns?: Array<{ id: string; title: string }>;
}

export interface ColumnEditDialogProps extends DialogWithFormProps {
  currentTitle: string;
}