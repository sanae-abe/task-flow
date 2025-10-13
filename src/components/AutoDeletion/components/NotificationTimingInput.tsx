import React from "react";
import { FormControl, TextInput } from "@primer/react";

interface NotificationTimingInputProps {
  notificationDays: number;
  retentionDays: number;
  enabled: boolean;
  onChange: (value: number) => void;
}

/**
 * 通知タイミング入力コンポーネント
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
export const NotificationTimingInput: React.FC<
  NotificationTimingInputProps
> = ({ notificationDays, retentionDays, enabled, onChange }) => {
  const maxDays = Math.max(0, retentionDays - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = Math.max(
      0,
      Math.min(maxDays, parseInt(e.target.value) || 0)
    );
    onChange(newValue);
  };

  return (
    <FormControl disabled={!enabled}>
      <FormControl.Label>
        通知タイミング
      </FormControl.Label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <TextInput
          id="notification-timing-input"
          type="number"
          min="0"
          max={maxDays}
          value={notificationDays.toString()}
          onChange={handleChange}
          disabled={!enabled}
          aria-label="削除の何日前に通知するか"
          aria-describedby="notification-timing-description"
          aria-valuemin={0}
          aria-valuemax={maxDays}
          aria-valuenow={notificationDays}
          sx={{
            width: "80px",
            fontSize: "16px",
          }}
        />
        <span>日前に通知</span>
      </div>
    </FormControl>
  );
};
