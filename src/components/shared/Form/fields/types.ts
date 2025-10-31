/**
 * フィールドコンポーネント用の型定義
 *
 * このファイルはUnifiedFormFieldコンポーネントから分離された
 * 個別フィールドコンポーネントで使用される共通の型定義を提供します。
 */

import type { ValidationRule } from '../../../../types/unified-form';

/**
 * 基本フィールドプロパティ
 * 全てのフィールドコンポーネントが共通で持つプロパティ
 */
export interface BaseFieldProps {
  /** フィールドの識別子 */
  id: string;
  /** フィールドのname属性 */
  name: string;
  /** フィールドの値 */
  value: unknown;
  /** 値変更時のコールバック */
  onChange: (value: unknown) => void;
  /** キーダウンイベントハンドラー */
  onKeyDown?: (event: React.KeyboardEvent) => void;
  /** ブラーイベントハンドラー */
  onBlur?: () => void;
  /** フォーカスイベントハンドラー */
  onFocus?: () => void;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** オートフォーカス */
  autoFocus?: boolean;
  /** 無効化フラグ */
  disabled?: boolean;
  /** バリデーションルール */
  validation?: ValidationRule;
  /** エラーメッセージ */
  _error?: string | null;
  /** タッチ状態 */
  touched?: boolean;
  /** カスタムスタイル */
  sx?: Record<string, unknown>;
  /** インラインスタイル */
  style?: React.CSSProperties;
}

/**
 * テキスト系入力フィールドプロパティ
 */
export interface TextFieldProps extends BaseFieldProps {
  /** 入力タイプ */
  type: 'text' | 'email' | 'password' | 'number';
  /** ステップ値（number用） */
  step?: string | number;
  /** 最小値 */
  min?: string | number;
  /** 最大値 */
  max?: string | number;
}

/**
 * 日付時刻系入力フィールドプロパティ
 */
export interface DateTimeFieldProps extends BaseFieldProps {
  /** 入力タイプ */
  type: 'date' | 'datetime-local' | 'time';
  /** ステップ値 */
  step?: string | number;
  /** 最小値 */
  min?: string | number;
  /** 最大値 */
  max?: string | number;
}

/**
 * チェックボックスフィールドプロパティ
 */
export interface CheckboxFieldProps extends BaseFieldProps {
  /** チェック状態 */
  checked?: boolean;
}

/**
 * テキストエリアフィールドプロパティ
 */
export interface TextareaFieldProps extends BaseFieldProps {
  /** 行数 */
  rows?: number;
}

/**
 * セレクトフィールドプロパティ
 */
export interface SelectFieldProps extends BaseFieldProps {
  /** 選択肢 */
  options?: Array<{ value: string; label: string }>;
}

/**
 * カスタムフィールドプロパティ
 */
export interface CustomFieldProps extends BaseFieldProps {
  /** カスタムコンポーネント */
  customComponent?: React.ReactNode;
}

/**
 * フィールドコンポーネントの共通プロパティ
 */
export type FieldComponentProps =
  | TextFieldProps
  | DateTimeFieldProps
  | CheckboxFieldProps
  | TextareaFieldProps
  | SelectFieldProps
  | CustomFieldProps;
