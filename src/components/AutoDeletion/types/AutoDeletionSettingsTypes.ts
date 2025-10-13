import type { AutoDeletionSettings } from "../../../types/settings";

/**
 * 設定変更ハンドラー型定義
 */
export type SettingsChangeHandler = <K extends keyof AutoDeletionSettings>(
  key: K,
  value: AutoDeletionSettings[K]
) => void;

/**
 * 保存メッセージ型定義
 */
export interface SaveMessage {
  type: "success" | "error";
  text: string;
}

/**
 * ヘッダーコンポーネントのProps
 */
export interface AutoDeletionSettingsHeaderProps {
  // 現時点でpropsは不要だが、将来の拡張性のため定義
}

/**
 * 基本設定セクションのProps
 */
export interface BasicSettingsSectionProps {
  enabled: boolean;
  onChange: SettingsChangeHandler;
  disabled?: boolean;
}

/**
 * 保持期間設定セクションのProps
 */
export interface RetentionSettingsSectionProps {
  retentionDays: number;
  enabled: boolean;
  notificationDays: number;
  onChange: SettingsChangeHandler;
}

/**
 * 通知設定セクションのProps
 */
export interface NotificationSettingsSectionProps {
  notifyBeforeDeletion: boolean;
  notificationDays: number;
  retentionDays: number;
  enabled: boolean;
  onChange: SettingsChangeHandler;
}

/**
 * ソフトデリート設定セクションのProps
 */
export interface SoftDeletionSettingsSectionProps {
  enableSoftDeletion: boolean;
  softDeletionRetentionDays: number;
  enabled: boolean;
  onChange: SettingsChangeHandler;
}

/**
 * 自動エクスポート設定セクションのProps
 */
export interface ExportSettingsSectionProps {
  autoExportBeforeDeletion: boolean;
  enabled: boolean;
  onChange: SettingsChangeHandler;
}

/**
 * アクションボタンセクションのProps
 */
export interface SettingsActionsProps {
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
}

/**
 * 注意事項セクションのProps
 */
export interface SettingsDisclaimerProps {
  // 現時点でpropsは不要だが、将来の拡張性のため定義
}
