/**
 * NotificationContainer関連のエクスポート
 *
 * このファイルは NotificationContainer モジュールの
 * パブリックAPIを定義します。
 */

// メインコンポーネント
export { NotificationContainer } from "./NotificationContainer";

// サブコンポーネント
export { NotificationItem } from "./NotificationItem";
export type { NotificationItemProps } from "./NotificationItem";

// ユーティリティ関数（他のコンポーネントから利用される可能性がある場合）
export {
  getResponsiveContainerClasses,
  getResponsiveWrapperClasses,
  containerClasses,
  wrapperClasses,
  iconContainerClasses,
  messageContainerClasses,
  messageTextClasses,
  closeButtonClasses,
} from "./styles";

// デフォルトエクスポート（後方互換性のため）
export { NotificationContainer as default } from "./NotificationContainer";