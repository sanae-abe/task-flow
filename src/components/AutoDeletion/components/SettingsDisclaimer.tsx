import React from "react";
import { Flash, Text } from "@primer/react";
import { AlertIcon } from "@primer/octicons-react";
import type { SettingsDisclaimerProps } from "../types/AutoDeletionSettingsTypes";

/**
 * 設定注意事項セクション - 重要な注意点の表示
 *
 * Primer React Notification統一:
 * - Flashコンポーネント（warning variant）を使用
 * - 既存の通知システムと統一されたデザイン
 * - Primer Design Systemに完全準拠
 *
 * アクセシビリティ対応:
 * - role="alert"で注意事項であることを明示
 * - aria-live="polite"で適切な通知
 * - セマンティックなマークアップ
 *
 * レスポンシブ対応:
 * - 自動的なレスポンシブ対応
 * - モバイル・デスクトップ両対応
 */
export const SettingsDisclaimer: React.FC<SettingsDisclaimerProps> = () => (
  <Flash
    variant="warning"
    role="alert"
    aria-live="polite"
    style={{
      marginTop: "24px",
      marginBottom: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}
  >
    {/* アイコンとタイトル */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <AlertIcon size={16} aria-hidden="true" />
      <Text
        as="strong"
        style={{
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        注意事項
      </Text>
    </div>

    {/* 本文 */}
    <Text
      as="p"
      style={{
        fontSize: "14px",
        lineHeight: 1.6,
        margin: 0,
        paddingLeft: "28px", // アイコンとテキストの位置合わせ
      }}
    >
      この機能を有効にすると、完了したタスクが自動的に削除されます。<br />
      重要なタスクは削除対象から除外するか、ソフトデリート機能を有効にして
      復元可能な期間を設けることをお勧めします。
    </Text>
  </Flash>
);
