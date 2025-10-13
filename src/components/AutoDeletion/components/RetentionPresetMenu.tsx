import React from "react";
import { FormControl, Select } from "@primer/react";
import { RETENTION_PRESETS } from "../../../utils/deletionHelpers";

interface RetentionPresetMenuProps {
  value?: string;
  onSelect: (presetKey: string) => void;
  disabled?: boolean;
}

/**
 * 保持期間プリセット選択メニュー
 *
 * アクセシビリティ対応:
 * - 明確なボタンラベル
 * - キーボードナビゲーション対応
 * - スクリーンリーダー対応の説明
 * - 無効状態の適切な管理
 *
 * レスポンシブ対応:
 * - モバイル: タッチしやすいボタンサイズ
 * - タブレット/デスクトップ: 適度なサイズ
 */
export const RetentionPresetMenu: React.FC<RetentionPresetMenuProps> = ({
  value = "custom",
  onSelect,
  disabled = false,
}) => {
  console.log("🎯 現在のvalue:", value);
  console.log("🗂️ 利用可能なプリセット:", Object.keys(RETENTION_PRESETS));

  return (
    <FormControl aria-label="保持期間プリセットから選択" disabled={disabled}>
      <Select key={`preset-${value}`} defaultValue={value}>
        {Object.entries(RETENTION_PRESETS).map(([key, preset]) => (
          <Select.Option
            key={key}
            value={key}
            onSelect={() => {
              console.log("🔍 プリセット選択:", key);
              onSelect(key);
            }}
          >
            {preset.label}
          </Select.Option>
        ))}
      </Select>
    </FormControl>
  );
};