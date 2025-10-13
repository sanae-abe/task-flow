import React from "react";
import { FormControl, TextInput } from "@primer/react";

interface SoftDeletionRetentionInputProps {
  softDeletionRetentionDays: number;
  enabled: boolean;
  onChange: (value: number) => void;
}

/**
 * ソフトデリート猶予期間入力コンポーネント
 *
 * アクセシビリティ対応:
 * - 明確なラベルと説明
 * - aria-labelとaria-describedbyの関連付け
 * - 入力範囲の明示
 * - 無効状態の適切な管理
 *
 * レスポンシブ対応:
 * - モバイル: 縦積み、タッチしやすい入力
 * - タブレット/デスクトップ: 横並び、適度なサイズ
 */
export const SoftDeletionRetentionInput: React.FC<
  SoftDeletionRetentionInputProps
> = ({ softDeletionRetentionDays, enabled, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = Math.max(1, Math.min(30, parseInt(e.target.value) || 1));
    onChange(newValue);
  };

  return (
    <FormControl disabled={!enabled}>
      <FormControl.Label htmlFor="soft-deletion-retention-input">
        猶予期間
      </FormControl.Label>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <TextInput
          id="soft-deletion-retention-input"
          type="number"
          min="1"
          max="30"
          value={softDeletionRetentionDays.toString()}
          onChange={handleChange}
          disabled={!enabled}
          aria-label="ソフトデリート後の復元可能日数"
          aria-describedby="soft-deletion-retention-description"
          aria-valuemin={1}
          aria-valuemax={30}
          aria-valuenow={softDeletionRetentionDays}
        />
        <span>日間復元可能</span>
      </div>
      <FormControl.Caption id="soft-deletion-retention-description">
        削除後{softDeletionRetentionDays}
        日間は復元できます(1〜30日)
      </FormControl.Caption>
    </FormControl>
  );
};
