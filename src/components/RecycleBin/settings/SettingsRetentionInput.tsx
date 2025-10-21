import React from "react";
import { FormControl, TextInput } from "@primer/react";
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
    <FormControl required>
      <FormControl.Label>
        {UI_TEXT.PANEL.RETENTION_LABEL}
      </FormControl.Label>
      <RetentionInputContainer>
        <TextInput
          type="number"
          min="1"
          max="365"
          value={settings.retentionDays?.toString() || ""}
          placeholder={settings.retentionDays === null ? "無制限" : ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100px' }}
          aria-describedby="retention-help"
        />
        <RetentionUnit>{UI_TEXT.PANEL.RETENTION_UNIT}</RetentionUnit>
      </RetentionInputContainer>
      <FormControl.Caption id="retention-help">
        {UI_TEXT.PANEL.RETENTION_HELP}
      </FormControl.Caption>
      {validationError && (
        <InlineMessage variant="critical" message={validationError} size="small" />
      )}
    </FormControl>
  );