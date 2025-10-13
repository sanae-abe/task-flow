import React from "react";
import { FormControl, Text, TextInput } from "@primer/react";

interface RetentionDaysInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/**
 * 保持期間日数入力コンポーネント
 *
 * アクセシビリティ対応:
 * - 適切なaria-label
 * - 入力範囲の明示
 * - エラー状態の通知
 * - キーボード操作対応
 *
 * レスポンシブ対応:
 * - モバイル: タッチしやすい入力フィールド
 * - タブレット/デスクトップ: 適度なサイズ
 */
export const RetentionDaysInput: React.FC<RetentionDaysInputProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = Math.max(1, Math.min(365, parseInt(e.target.value) || 1));
    onChange(newValue);
  };

  return (
    <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }} disabled={disabled}>
      <FormControl.Label id="retention-settings-description" visuallyHidden>
        保持期間の日数
      </FormControl.Label>
      <TextInput
        type="number"
        min="1"
        max="365"
        value={value.toString()}
        onChange={handleChange}
        disabled={disabled}
        aria-label="保持期間の日数"
        aria-describedby="retention-settings-description"
        aria-valuemin={1}
        aria-valuemax={365}
        aria-valuenow={value}
        sx={{
          width: "80px",
          fontSize: "16px",
        }}
      />
      <Text
        sx={{
          fontSize: "14px",
          whiteSpace: "nowrap",
        }}
      >
        日後に削除
      </Text>
    </FormControl>
  );
};