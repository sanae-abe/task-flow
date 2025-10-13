import React from "react";
import { Flash } from "@primer/react";
import { useAutoDeletionSettings } from "./hooks/useAutoDeletionSettings";
import { useSettingsSave } from "./hooks/useSettingsSave";
import { AutoDeletionSettingsHeader } from "./components/AutoDeletionSettingsHeader";
import { BasicSettingsSection } from "./components/BasicSettingsSection";
import { RetentionSettingsSection } from "./components/RetentionSettingsSection";
import { NotificationSettingsSection } from "./components/NotificationSettingsSection";
import { SoftDeletionSettingsSection } from "./components/SoftDeletionSettingsSection";
import { ExportSettingsSection } from "./components/ExportSettingsSection";
import { SettingsActions } from "./components/SettingsActions";
import { SettingsDisclaimer } from "./components/SettingsDisclaimer";

/**
 * 自動削除設定パネルメインコンポーネント
 *
 * 完了タスクの自動削除に関する設定を管理するパネル。
 * 以下の設定項目を提供:
 * - 自動削除の有効/無効
 * - 保持期間設定
 * - 削除前通知設定
 * - ソフトデリート設定
 * - 自動バックアップ設定
 *
 * デザイン強化:
 * - 統一されたタイポグラフィ階層
 * - カード形式による視覚的グループ化
 * - 一貫性のある色彩設計とスペーシング
 * - アイコンによる機能の視覚化
 *
 * アクセシビリティ対応:
 * - セマンティックHTML構造
 * - ARIA属性による適切な説明
 * - キーボードナビゲーション
 * - スクリーンリーダー対応
 *
 * レスポンシブ対応:
 * - モバイル: 全幅表示、縦積みレイアウト
 * - タブレット: 適度なパディング
 * - デスクトップ: 最大幅720px、中央配置
 */
export const AutoDeletionSettingsPanel: React.FC = () => {
  // カスタムフックで状態管理
  const { settings, handleChange, resetSettings } = useAutoDeletionSettings();
  const { isSaving, saveMessage, handleSave } = useSettingsSave(settings);

  return (
    <section
      aria-labelledby="auto-deletion-settings-title"
      style={{
        maxWidth: "720px",
        margin: "0 auto",
      }}
    >
      {/* ヘッダー */}
      <AutoDeletionSettingsHeader />

      {/* 保存結果メッセージ - ライブリージョンでスクリーンリーダーに通知 */}
      {saveMessage && (
        <Flash
          variant={saveMessage.type === "error" ? "danger" : "success"}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          sx={{
            mb: 4,
            fontSize: [0, 1, 1],
            fontWeight: "medium",
          }}
        >
          {saveMessage.text}
        </Flash>
      )}

      {/* 設定フォーム */}
      <form aria-label="自動削除設定フォーム">
        {/* 基本設定 */}
        <BasicSettingsSection
          enabled={settings.enabled}
          onChange={handleChange}
        />

        {/* 保持期間設定 */}
        <RetentionSettingsSection
          retentionDays={settings.retentionDays}
          enabled={settings.enabled}
          notificationDays={settings.notificationDays}
          onChange={handleChange}
        />

        {/* 通知設定 */}
        <NotificationSettingsSection
          notifyBeforeDeletion={settings.notifyBeforeDeletion}
          notificationDays={settings.notificationDays}
          retentionDays={settings.retentionDays}
          enabled={settings.enabled}
          onChange={handleChange}
        />

        {/* ソフトデリート設定 */}
        <SoftDeletionSettingsSection
          enableSoftDeletion={settings.enableSoftDeletion}
          softDeletionRetentionDays={settings.softDeletionRetentionDays}
          enabled={settings.enabled}
          onChange={handleChange}
        />

        {/* 自動エクスポート設定 */}
        <ExportSettingsSection
          autoExportBeforeDeletion={settings.autoExportBeforeDeletion}
          enabled={settings.enabled}
          onChange={handleChange}
        />

        {/* アクションボタン */}
        <SettingsActions
          onSave={handleSave}
          onReset={resetSettings}
          isSaving={isSaving}
        />
      </form>

      {/* 注意事項 */}
      <SettingsDisclaimer />
    </section>
  );
};

export default AutoDeletionSettingsPanel;
