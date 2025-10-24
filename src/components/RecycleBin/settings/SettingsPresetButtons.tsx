import React from "react";
import { Button } from "@/components/ui/button";
import { type RecycleBinSettings } from "../../../types/settings";
import { RETENTION_PRESETS, UI_TEXT } from "../../../constants/recycleBin";

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
    <div className="mb-4">
      <span className="text-sm font-semibold mb-2 block">
        {UI_TEXT.PANEL.PRESET_TITLE}
      </span>
      <div className="flex gap-2 flex-wrap">
        {RETENTION_PRESETS.map(({ label, days }) => (
          <Button
            key={days?.toString() || 'unlimited'}
            variant={settings.retentionDays === days ? "default" : "outline"}
            onClick={() => onPresetSelect(days)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );