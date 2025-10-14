import React, { useState, useCallback } from "react";
import {
  FormControl,
  TextInput,
  Button,
  Text,
} from "@primer/react";
import {
  CheckIcon,
} from "@primer/octicons-react";
import { type RecycleBinSettings } from "../../types/settings";
import { useRecycleBinSettings } from "../../hooks/useRecycleBinSettings";
import { RETENTION_PRESETS, UI_TEXT, MESSAGES } from "../../constants/recycleBin";
import { validateRetentionDaysInput, getValidationMessage } from "../../utils/recycleBinValidation";
import InlineMessage from "../shared/InlineMessage";

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
    updateSettings,
    saveSettings,
    isLoading,
    error: hookError,
  } = useRecycleBinSettings();

  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);


  const handleRetentionDaysChange = useCallback((value: string) => {
    // バリデーション実行
    const validationMessage = getValidationMessage(value);
    setValidationError(validationMessage);

    // 有効な場合のみ設定を更新
    if (!validationMessage) {
      const newRetentionDays = value.trim() === "" ? null : parseInt(value, 10);
      updateSettings({ ...settings, retentionDays: newRetentionDays });
    }
  }, [settings, updateSettings]);

  const handleSave = useCallback(async () => {
    // バリデーション実行
    const validationResult = validateRetentionDaysInput(settings.retentionDays?.toString() || "");
    if (!validationResult.isValid) {
      setValidationError(validationResult.error || null);
      return;
    }

    setSaveMessage(null);

    try {
      const success = await saveSettings(settings);

      if (success) {
        // 親コンポーネントに通知
        onSave?.(settings);

        setSaveMessage(MESSAGES.SAVE.SUCCESS);
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage(hookError || MESSAGES.SAVE.FAILED);
      }
    } catch (error) {
      setSaveMessage(MESSAGES.SAVE.FAILED);
    }
  }, [settings, saveSettings, onSave, hookError]);

  const handlePresetSelect = useCallback((days: number | null) => {
    updateSettings({ ...settings, retentionDays: days });
    setValidationError(null);
  }, [settings, updateSettings]);

  return (
    <div style={{ paddingBottom: '16px' }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px'
      }}>
        <Text
          as="h2"
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            margin: 0
          }}
        >
          {UI_TEXT.PANEL.TITLE}
        </Text>
      </div>

      {/* 説明 */}
      <Text
        style={{
          color: 'var(--fgColor-muted)',
          fontSize: '14px',
          marginBottom: '20px',
          display: 'block'
        }}
      >
        {UI_TEXT.PANEL.DESCRIPTION_WITH_UNLIMITED}
      </Text>

      {/* プリセットボタン */}
      <div style={{ marginBottom: '16px' }}>
        <Text
          style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
            display: 'block'
          }}
        >
          {UI_TEXT.PANEL.PRESET_TITLE}
        </Text>
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {RETENTION_PRESETS.map(({ label, days }) => (
            <Button
              key={days?.toString() || 'unlimited'}
              variant={settings.retentionDays === days ? "primary" : "default"}
              onClick={() => handlePresetSelect(days)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* 保持期間設定 */}
      <FormControl required>
        <FormControl.Label>
          {UI_TEXT.PANEL.RETENTION_LABEL}
        </FormControl.Label>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <TextInput
            type="number"
            min="1"
            max="365"
            value={settings.retentionDays?.toString() || ""}
            placeholder={settings.retentionDays === null ? "無制限" : ""}
            onChange={(e) => handleRetentionDaysChange(e.target.value)}
            style={{ width: '100px' }}
            aria-describedby="retention-help"
          />
          <Text style={{ color: 'var(--fgColor-muted)' }}>{UI_TEXT.PANEL.RETENTION_UNIT}</Text>
        </div>
        <FormControl.Caption id="retention-help">
          {UI_TEXT.PANEL.RETENTION_HELP}
        </FormControl.Caption>
        {validationError && (
          <InlineMessage variant="error" message={validationError} />
        )}
      </FormControl>

      {/* 保存ボタンとメッセージ */}
      <div style={{ marginTop: '24px' }}>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isLoading || validationError !== null}
          leadingVisual={!isLoading ? CheckIcon : undefined}
        >
          {isLoading ? (
            <>{MESSAGES.SAVE.IN_PROGRESS}</>
          ) : (
            <>{UI_TEXT.PANEL.SAVE_BUTTON}</>
          )}
        </Button>
        <div style={{ marginTop: '12px' }}>
          {saveMessage && (
            <InlineMessage
              variant={saveMessage?.includes('失敗') ? "error" : "success"}
              message={saveMessage}
            /> 
          )}
        </div>
      </div>

      {/* 注意事項 */}
      <div style={{
        marginTop: '24px',
        padding: '12px',
        backgroundColor: 'var(--bgColor-muted)',
        borderRadius: '6px',
        border: '1px solid var(--borderColor-muted)'
      }}>
        <Text
          style={{
            fontSize: '12px',
            color: 'var(--fgColor-muted)',
            lineHeight: '1.4'
          }}
        >
          <strong>{UI_TEXT.PANEL.IMPORTANT_NOTE_TITLE}</strong> {UI_TEXT.PANEL.IMPORTANT_NOTE_TEXT}
        </Text>
      </div>
    </div>
  );
};

export default RecycleBinSettingsPanel;