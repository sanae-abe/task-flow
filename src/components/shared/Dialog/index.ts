/**
 * 統合ダイアログシステム
 *
 * 一貫したダイアログ体験を提供する統合システムです。
 * 以下のダイアログタイプをサポートします：
 *
 * - UnifiedDialog: ベースダイアログ（カスタマイズ可能）
 * - ConfirmDialog: 確認ダイアログ（危険な操作用）
 * - SimpleFormDialog: シンプルフォーム（単一入力）
 */

// ベースダイアログ
export {
  default as UnifiedDialog,
  DialogHeader,
  DialogFooter,
} from './UnifiedDialog';

// 特化ダイアログ
export { default as ConfirmDialog } from './ConfirmDialog';
export { default as SimpleFormDialog } from './SimpleFormDialog';

// アクションコンポーネント
export { default as DialogActions } from './DialogActions';

// 型定義をre-export
export type {
  UnifiedDialogProps,
  ConfirmDialogProps,
  SimpleFormDialogProps,
  CustomDialogProps,
  DialogAction,
  DialogVariant,
  DialogSize,
  DialogType,
} from '../../../types/unified-dialog';
