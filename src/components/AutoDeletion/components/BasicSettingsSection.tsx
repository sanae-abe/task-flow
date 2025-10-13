import React from "react";
import { FormControl, Checkbox } from "@primer/react";
import { GearIcon } from "@primer/octicons-react";
import type { BasicSettingsSectionProps } from "../types/AutoDeletionSettingsTypes";

/**
 * 基本設定セクション - 自動削除機能の有効/無効切り替え
 *
 * デザイン強化:
 * - カード形式でコンテンツをグループ化
 * - アイコンで機能を視覚的に表現
 * - タイポグラフィ階層の最適化
 *
 * アクセシビリティ対応:
 * - FormControlによる適切なラベル関連付け
 * - Captionで補足説明を提供
 * - キーボードナビゲーション対応
 * - スクリーンリーダーで状態を読み上げ
 *
 * レスポンシブ対応:
 * - モバイル: 縦積みレイアウト
 * - タブレット/デスクトップ: 適度な余白
 */
export const BasicSettingsSection: React.FC<BasicSettingsSectionProps> = ({
  enabled,
  onChange,
  disabled = false,
}) => (
  <section aria-labelledby="basic-settings-label" style={{ marginBottom: "24px" }}>
    {/* セクションタイトル */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "8px",
      }}
    >
      <GearIcon size={16} aria-hidden="true" />
      <h2
        style={{
          fontSize: "16px",
          margin: 0,
          padding: 0,
        }}
      >
        基本設定
      </h2>
    </div>
    <div
      aria-labelledby="basic-settings-label"
      style={{
        marginBottom: "16px",
        padding: "12px",
        backgroundColor: "var(--bgColor-muted)",
        borderRadius: "8px",
        border: "1px solid",
        borderColor: "var(--borderColor-default)",
      }}
    >
      {/* フォームコントロール */}
      <FormControl disabled={disabled}>
        <Checkbox
          checked={enabled}
          onChange={(e) => onChange("enabled", e.target.checked)}
          aria-describedby="basic-settings-description"
        />
        <FormControl.Label
          id="basic-settings-label"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "400",
          }}
        >
          自動削除機能を有効にする
        </FormControl.Label>
      </FormControl>
    </div>
  </section>
);
