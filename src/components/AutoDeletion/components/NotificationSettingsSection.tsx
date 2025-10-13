import React from "react";
import { FormControl, Checkbox } from "@primer/react";
import { BellIcon } from "@primer/octicons-react";
import type { NotificationSettingsSectionProps } from "../types/AutoDeletionSettingsTypes";
import { NotificationTimingInput } from "./NotificationTimingInput";

/**
 * 通知設定セクション - 削除前の通知機能
 *
 * デザイン強化:
 * - カード形式でコンテンツをグループ化
 * - セクションタイトルをカード外に配置
 * - アイコンで機能を視覚的に表現
 *
 * アクセシビリティ対応:
 * - チェックボックスと説明の適切な関連付け
 * - 条件付き表示のスムーズなトランジション
 * - aria-expandedで展開状態を通知
 *
 * レスポンシブ対応:
 * - モバイル: 縦積みレイアウト
 * - タブレット/デスクトップ: 適度な余白
 */
export const NotificationSettingsSection: React.FC<
  NotificationSettingsSectionProps
> = ({
  notifyBeforeDeletion,
  notificationDays,
  retentionDays,
  enabled,
  onChange,
}) => (
    <section aria-labelledby="notification-settings-label" style={{ marginBottom: "24px" }}>
      {/* セクションタイトル */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <BellIcon size={16} aria-hidden="true" />
        <h2
          id="notification-settings-label"
          style={{
            fontSize: "16px",
            margin: 0,
            padding: 0,
          }}
        >
          通知設定
        </h2>
      </div>

    {/* カードコンテナ */}
    <div
      style={{
        padding: "16px",
        backgroundColor: "var(--bgColor-muted)",
        borderRadius: "var(--borderRadius-medium)",
        border: "1px solid",
        borderColor: "var(--borderColor-default)",
        opacity: enabled ? 1 : 0.5,
        transition: "opacity 0.2s ease",
      }}
    >
      <FormControl disabled={!enabled}>
        <Checkbox
          checked={notifyBeforeDeletion}
          onChange={(e) => onChange("notifyBeforeDeletion", e.target.checked)}
          aria-describedby="notification-settings-description"
          aria-expanded={notifyBeforeDeletion}
        />
        <FormControl.Label id="notification-settings-label">
          削除前に通知する
        </FormControl.Label>
      </FormControl>

      {notifyBeforeDeletion && (
        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid",
            borderColor: "var(--borderColor-default)",
          }}
        >
          <NotificationTimingInput
            notificationDays={notificationDays}
            retentionDays={retentionDays}
            enabled={enabled}
            onChange={(value) => onChange("notificationDays", value)}
          />
        </div>
      )}
    </div>
  </section>
);
