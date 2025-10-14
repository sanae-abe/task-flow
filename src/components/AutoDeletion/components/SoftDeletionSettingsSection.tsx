import React from "react";
import { FormControl, Checkbox } from "@primer/react";
import { ShieldIcon } from "@primer/octicons-react";
import type { SoftDeletionSettingsSectionProps } from "../types/AutoDeletionSettingsTypes";
import { SoftDeletionRetentionInput } from "./SoftDeletionRetentionInput";

/**
 * ソフトデリート設定セクション - 復元可能期間の設定
 *
 * デザイン強化:
 * - カード形式でコンテンツをグループ化
 * - セクションタイトルをカード外に配置
 * - シールドアイコンで安全性を視覚的に表現
 *
 * アクセシビリティ対応:
 * - アイコンと説明の適切な配置
 * - 条件付き表示のスムーズなトランジション
 * - aria-expandedで展開状態を通知
 *
 * レスポンシブ対応:
 * - モバイル: 縦積みレイアウト
 * - タブレット/デスクトップ: 適度な余白
 */
export const SoftDeletionSettingsSection: React.FC<
  SoftDeletionSettingsSectionProps
> = ({ enableSoftDeletion, softDeletionRetentionDays, enabled, onChange }) => (
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
      <ShieldIcon size={14} aria-hidden="true" />
      <h2
        id="soft-deletion-settings-label"
        style={{
          fontSize: "14px",
          margin: 0,
          padding: 0,
        }}
      >
        ソフトデリート設定
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
          checked={enableSoftDeletion}
          onChange={(e) => onChange("enableSoftDeletion", e.target.checked)}
          aria-describedby="soft-deletion-settings-description"
          aria-expanded={enableSoftDeletion}
        />
        <FormControl.Label id="soft-deletion-settings-label">
          ソフトデリート機能を有効にする
        </FormControl.Label>
        <FormControl.Caption id="soft-deletion-settings-description">
          即座に削除せず、一定期間復元可能な状態で保持します
        </FormControl.Caption>
      </FormControl>

      {enableSoftDeletion && (
        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid",
            borderColor: "var(--borderColor-default)",
          }}
        >
          <SoftDeletionRetentionInput
            softDeletionRetentionDays={softDeletionRetentionDays}
            enabled={enabled}
            onChange={(value) => onChange("softDeletionRetentionDays", value)}
          />
        </div>
      )}
    </div>
  </section>
);
