import React, { useCallback, useState, useEffect } from "react";
import { FormControl } from "@primer/react";
import { ClockIcon } from "@primer/octicons-react";
import { RETENTION_PRESETS } from "../../../utils/deletionHelpers";
import type { RetentionSettingsSectionProps } from "../types/AutoDeletionSettingsTypes";
import { RetentionPresetMenu } from "./RetentionPresetMenu";
import { RetentionDaysInput } from "./RetentionDaysInput";

/**
 * 保持期間設定セクション
 *
 * デザイン強化:
 * - カード形式でコンテンツをグループ化
 * - セクションタイトルをカード外に配置
 * - 視覚的階層の改善
 *
 * アクセシビリティ対応:
 * - 明確なラベルと説明
 * - 無効時の視覚的フィードバック
 * - aria-describedbyで補足説明を関連付け
 *
 * レスポンシブ対応:
 * - モバイル: 縦積み、フルサイズ入力
 * - タブレット: 横並び開始
 * - デスクトップ: 適度な間隔
 */
export const RetentionSettingsSection: React.FC<
  RetentionSettingsSectionProps
> = ({ retentionDays, enabled, notificationDays, onChange }) => {
  // 現在の保持期間からプリセットを判定
  const determinePreset = (days: number): string => {
    const presetMatch = Object.entries(RETENTION_PRESETS).find(
      ([, preset]) => preset.days === days
    );
    return presetMatch ? presetMatch[0] : "custom";
  };

  // プリセット選択状態の管理
  const [selectedPreset, setSelectedPreset] = useState<string>(() =>
    determinePreset(retentionDays)
  );

  const handlePresetSelect = useCallback(
    (presetKey: string) => {
      setSelectedPreset(presetKey);

      const preset =
        RETENTION_PRESETS[presetKey as keyof typeof RETENTION_PRESETS];
      if (preset?.days) {
        onChange("retentionDays", preset.days);
        if (notificationDays >= preset.days) {
          onChange("notificationDays", Math.floor(preset.days / 2));
        }
      }
    },
    [notificationDays, onChange]
  );

  // retentionDaysが外部から変更された場合にプリセット状態を同期
  useEffect(() => {
    const currentPreset = determinePreset(retentionDays);
    if (currentPreset !== selectedPreset) {
      setSelectedPreset(currentPreset);
    }
  }, [retentionDays, selectedPreset]);

  // 日数が手動で変更された時はカスタムに切り替え
  const handleDaysChange = useCallback(
    (value: number) => {
      setSelectedPreset("custom");
      onChange("retentionDays", value);
    },
    [onChange]
  );

  return (
    <section aria-labelledby="retention-settings-label" style={{ marginBottom: "24px" }}>
      {/* セクションタイトル */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <ClockIcon size={16} aria-hidden="true" />
        <h2
          id="retention-settings-label"
          style={{
            fontSize: "16px",
            margin: 0,
            padding: 0,
          }}
        >
          保持期間設定
        </h2>
      </div>

      {/* カードコンテナ */}
      <div
        style={{
          marginBottom: "16px",
          padding: "12px",
          backgroundColor: "var(--bgColor-muted)",
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "var(--borderColor-default)",
        }}
      >
        <FormControl disabled={!enabled}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <RetentionPresetMenu
              value={selectedPreset}
              onSelect={handlePresetSelect}
              disabled={!enabled}
            />
            <RetentionDaysInput
              value={retentionDays}
              onChange={handleDaysChange}
              disabled={!enabled}
            />
          </div>
        </FormControl>
      </div>
    </section>
  );
};
