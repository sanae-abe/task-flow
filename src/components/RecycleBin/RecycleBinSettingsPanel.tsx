import React from "react";
import { type RecycleBinSettings } from "../../types/settings";
import { UI_TEXT } from "../../constants/recycleBin";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { InlineMessage } from "../shared";
import { SettingsPresetButtons } from "./settings/SettingsPresetButtons";
import { SettingsRetentionInput } from "./settings/SettingsRetentionInput";
import { SettingsSaveSection } from "./settings/SettingsSaveSection";
import {
  Container,
  HeaderContainer,
  HeaderTitle,
  Description,
  ImportantNote,
} from "./RecycleBinSettingsPanel.styles";

interface RecycleBinSettingsPanelProps {
  onSave?: (settings: RecycleBinSettings) => void;
}

/**
 * シンプルなゴミ箱設定パネル
 * 複雑なAutoDeletionSettingsPanelを置き換える軽量版
 */
export const RecycleBinSettingsPanel: React.FC<RecycleBinSettingsPanelProps> = ({
  onSave,
}) => {
  const {
    settings,
    isLoading,
    validationError,
    message,
    handleRetentionDaysChange,
    handlePresetSelect,
    handleSave,
  } = useSettingsForm();

  const handleSaveWithCallback = async () => {
    await handleSave(onSave);
  };

  return (
    <Container>
      {/* ヘッダー */}
      <HeaderContainer>
        <HeaderTitle>
          {UI_TEXT.PANEL.TITLE}
        </HeaderTitle>
      </HeaderContainer>

      {/* 説明 */}
      <Description>
        {UI_TEXT.PANEL.DESCRIPTION_WITH_UNLIMITED}
      </Description>

      {/* プリセットボタン */}
      <SettingsPresetButtons
        settings={settings}
        onPresetSelect={handlePresetSelect}
      />

      {/* 保持期間設定 */}
      <SettingsRetentionInput
        settings={settings}
        validationError={validationError}
        onChange={handleRetentionDaysChange}
      />

      {/* 保存ボタンとメッセージ */}
      <SettingsSaveSection
        isLoading={isLoading}
        hasValidationError={validationError !== null}
        message={message}
        onSave={handleSaveWithCallback}
      />

      {/* 注意事項 */}
      <ImportantNote>
        <InlineMessage variant="warning" message={UI_TEXT.PANEL.IMPORTANT_NOTE_TEXT} />
      </ImportantNote>
    </Container>
  );
};

export default RecycleBinSettingsPanel;