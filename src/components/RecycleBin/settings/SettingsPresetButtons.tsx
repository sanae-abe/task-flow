import React from "react";
import { Button } from "@primer/react";
import { type RecycleBinSettings } from "../../../types/settings";
import { RETENTION_PRESETS, UI_TEXT } from "../../../constants/recycleBin";
import {
  PresetSection,
  PresetTitle,
  PresetButtonsContainer,
} from "../RecycleBinSettingsPanel.styles";

export interface SettingsPresetButtonsProps {
  /** 現在の設定 */
  settings: RecycleBinSettings;
  /** プリセット選択ハンドラ */
  onPresetSelect: (days: number | null) => void;
}

/**
 * ゴミ箱設定のプリセットボタン群コンポーネント
 * よく使われる保持期間をワンクリックで設定可能
 */
export const SettingsPresetButtons: React.FC<SettingsPresetButtonsProps> = ({
  settings,
  onPresetSelect,
}) => (
    <PresetSection>
      <PresetTitle>
        {UI_TEXT.PANEL.PRESET_TITLE}
      </PresetTitle>
      <PresetButtonsContainer>
        {RETENTION_PRESETS.map(({ label, days }) => (
          <Button
            key={days?.toString() || 'unlimited'}
            variant={settings.retentionDays === days ? "primary" : "default"}
            onClick={() => onPresetSelect(days)}
          >
            {label}
          </Button>
        ))}
      </PresetButtonsContainer>
    </PresetSection>
  );