import React from "react";
import { FormControl, Checkbox } from "@primer/react";
import { DownloadIcon } from "@primer/octicons-react";
import type { ExportSettingsSectionProps } from "../types/AutoDeletionSettingsTypes";

/**
 * 自動エクスポート設定セクション - 削除前のバックアップ機能
 *
 * デザイン強化:
 * - カード形式でコンテンツをグループ化
 * - セクションタイトルをカード外に配置
 * - ダウンロードアイコンで機能を視覚的に表現
 *
 * アクセシビリティ対応:
 * - FormControlによる適切なラベル関連付け
 * - aria-describedbyで説明を関連付け
 * - キーボードナビゲーション対応
 * - 無効時の視覚的フィードバック
 *
 * レスポンシブ対応:
 * - モバイル: 縦積みレイアウト
 * - タブレット/デスクトップ: 適度な余白
 */
export const ExportSettingsSection: React.FC<ExportSettingsSectionProps> = ({
  autoExportBeforeDeletion,
  enabled,
  onChange,
}) => (
  <section aria-labelledby="export-settings-label" style={{ marginBottom: "24px" }}>
    {/* セクションタイトル */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "8px",
      }}
    >
      <DownloadIcon size={14} aria-hidden="true" />
      <h2
        id="soft-deletion-settings-label"
        style={{
          fontSize: "14px",
          margin: 0,
          padding: 0,
        }}
      >
        エクスポート設定
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
          checked={autoExportBeforeDeletion}
          onChange={(e) =>
            onChange("autoExportBeforeDeletion", e.target.checked)
          }
          aria-describedby="export-settings-description"
        />
        <FormControl.Label id="export-settings-label">
          削除前に自動バックアップ
        </FormControl.Label>
        <FormControl.Caption id="export-settings-description">
          削除前にタスクデータを自動的にエクスポート・保存します
        </FormControl.Caption>
      </FormControl>
    </div>
  </section>
);
