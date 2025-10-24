import React from "react";
import { Input } from "@/components/ui/input";
import { type RecycleBinSettings } from "../../../types/settings";
import { UI_TEXT } from "../../../constants/recycleBin";
import { InlineMessage } from "../../shared";
import {
  RetentionInputContainer,
  RetentionUnit,
} from "../RecycleBinSettingsPanel.styles";

export interface SettingsRetentionInputProps {
  /** 現在の設定 */
  settings: RecycleBinSettings;
  /** バリデーションエラー */
  validationError: string | null;
  /** 値変更ハンドラ */
  onChange: (value: string) => void;
}

/**
 * ゴミ箱設定の保持期間入力コンポーネント
 * 数値入力とバリデーション機能を提供
 */
export const SettingsRetentionInput: React.FC<SettingsRetentionInputProps> = ({
  settings,
  validationError,
  onChange,
}) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor="retention-input">
        {UI_TEXT.PANEL.RETENTION_LABEL}
      </label>
      <RetentionInputContainer>
        <Input
          id="retention-input"
          type="number"
          min="1"
          max="365"
          value={settings.retentionDays?.toString() || ""}
          placeholder={settings.retentionDays === null ? "無制限" : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-[100px]"
          aria-describedby="retention-help"
        />
        <RetentionUnit>{UI_TEXT.PANEL.RETENTION_UNIT}</RetentionUnit>
      </RetentionInputContainer>
      <small id="retention-help" className="text-xs text-muted-foreground">
        {UI_TEXT.PANEL.RETENTION_HELP}
      </small>
      {validationError && (
        <InlineMessage variant="critical" message={validationError} size="small" />
      )}
    </div>
  );