/**
 * 統合ダイアログシステムの型定義
 */

import type { LucideIcon } from 'lucide-react';

export type DialogVariant = 'modal' | 'overlay' | 'inline';
export type DialogSize = 'small' | 'medium' | 'large' | 'xl';
export type DialogType = 'confirm' | 'form' | 'complex' | 'custom';

// ベースダイアログプロパティ
export interface BaseUnifiedDialogProps {
  /** ダイアログの表示状態 */
  isOpen: boolean;
  /** ダイアログのタイトル */
  title: string;
  /** ダイアログを閉じる際のコールバック */
  onClose: () => void;
  /** ダイアログのバリアント */
  variant?: DialogVariant;
  /** ダイアログのサイズ */
  size?: DialogSize;
  /** アクセシビリティ用のlabelledBy属性 */
  ariaLabelledBy?: string;
}

// アクション関連の型
export interface DialogAction {
  /** アクションラベル */
  label: string;
  /** クリック時のコールバック */
  onClick: () => void;
  /** ボタンのバリアント */
  variant?:
    | 'default'
    | 'primary'
    | 'danger'
    | 'outline'
    | 'secondary'
    | 'destructive'
    | 'ghost'
    | 'link';
  /** 無効状態 */
  disabled?: boolean;
  /** ローディング状態 */
  loading?: boolean;
  /** アイコン（オプション） */
  icon?: LucideIcon;
  /** ボタンの位置（splitレイアウト用） */
  position?: 'left' | 'right';
}

// 確認ダイアログ
export interface ConfirmDialogProps extends BaseUnifiedDialogProps {
  /** 確認メッセージ */
  message: string;
  /** 確認時のコールバック */
  onConfirm: () => void;
  /** キャンセル時のコールバック */
  onCancel: () => void;
  /** 確認ボタンのテキスト */
  confirmText?: string;
  /** キャンセルボタンのテキスト */
  cancelText?: string;
  /** 確認ボタンのバリアント */
  confirmVariant?:
    | 'default'
    | 'primary'
    | 'danger'
    | 'outline'
    | 'secondary'
    | 'destructive'
    | 'ghost'
    | 'link';
}

// シンプルフォームダイアログ（単一入力フィールド）
export interface SimpleFormDialogProps extends BaseUnifiedDialogProps {
  /** フィールドのラベル */
  fieldLabel: string;
  /** プレースホルダーテキスト */
  placeholder: string;
  /** 初期値 */
  initialValue?: string;
  /** 保存時のコールバック */
  onSave: (value: string) => void;
  /** キャンセル時のコールバック */
  onCancel: () => void;
  /** 保存ボタンのテキスト */
  saveText?: string;
  /** 必須フィールドかどうか */
  required?: boolean;
  /** 最小文字数 */
  minLength?: number;
}

// カスタムダイアログ
export interface CustomDialogProps extends BaseUnifiedDialogProps {
  /** カスタムコンテンツ */
  children: React.ReactNode;
  /** カスタムアクション */
  actions?: DialogAction[];
  /** フッターを非表示にするか */
  hideFooter?: boolean;
}

// 統合ダイアログコンポーネントのプロパティ
export interface UnifiedDialogProps extends BaseUnifiedDialogProps {
  /** ダイアログの種類 */
  type?: DialogType;
  /** ダイアログのコンテンツ */
  children?: React.ReactNode;
  /** アクション定義 */
  actions?: DialogAction[];
  /** アクションレイアウト */
  actionsLayout?: 'standard' | 'split';
  /** フッターを非表示にするか */
  hideFooter?: boolean;
  /** ヘッダーを非表示にするか */
  hideHeader?: boolean;
  /** バックドロップクリックで閉じるか */
  closeOnBackdropClick?: boolean;
  /** Escapeキーで閉じるか */
  closeOnEscape?: boolean;
}
