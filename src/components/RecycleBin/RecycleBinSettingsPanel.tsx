import React, { useState, useCallback } from "react";
import {
  FormControl,
  TextInput,
  Button,
  Text,
  Flash,
} from "@primer/react";
import {
  CheckIcon,
} from "@primer/octicons-react";
import { DEFAULT_RECYCLE_BIN_SETTINGS, type RecycleBinSettings } from "../../types/settings";
import { logger } from "../../utils/logger";
import ErrorMessage from "../ErrorMessage";

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
  const [settings, setSettings] = useState<RecycleBinSettings>(() => {
    // LocalStorageから設定を読み込み、なければデフォルト値を使用
    try {
      const stored = localStorage.getItem('recycleBinSettings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      logger.warn('ゴミ箱設定の読み込みに失敗:', error);
    }
    return DEFAULT_RECYCLE_BIN_SETTINGS;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateRetentionDays = (days: number | null): string | null => {
    // 無制限の場合は有効
    if (days === null) {
      return null;
    }
    if (!Number.isInteger(days)) {
      return "整数で入力してください";
    }
    if (days < 1) {
      return "1日以上で設定してください";
    }
    if (days > 365) {
      return "365日以下で設定してください";
    }
    return null;
  };

  const handleRetentionDaysChange = useCallback((value: string) => {
    // 空文字列の場合は無制限として扱う
    if (value.trim() === "") {
      setSettings(prev => ({ ...prev, retentionDays: null }));
      setValidationError(null);
      return;
    }

    const days = parseInt(value, 10);

    if (isNaN(days)) {
      setValidationError("数値を入力してください");
      return;
    }

    const error = validateRetentionDays(days);
    setValidationError(error);

    if (!error) {
      setSettings(prev => ({ ...prev, retentionDays: days }));
    }
  }, []);

  const handleSave = useCallback(async () => {
    const error = validateRetentionDays(settings.retentionDays);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // LocalStorageに保存
      localStorage.setItem('recycleBinSettings', JSON.stringify(settings));

      // 親コンポーネントに通知
      onSave?.(settings);

      setSaveMessage("設定を保存しました");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      logger.error('設定の保存に失敗:', error);
      setSaveMessage("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }, [settings, onSave]);

  const handlePresetSelect = useCallback((days: number | null) => {
    setSettings(prev => ({ ...prev, retentionDays: days }));
    setValidationError(null);
  }, []);

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
          ゴミ箱設定
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
        削除したタスクをゴミ箱に保持する期間を設定します。<br />
        期間を過ぎたタスクは自動的に完全削除されます。無制限を選択すると自動削除されません。
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
          よく使われる設定
        </Text>
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {[
            { label: '1週間', days: 7 },
            { label: '2週間', days: 14 },
            { label: '1ヶ月', days: 30 },
            { label: '3ヶ月', days: 90 },
            { label: '無制限', days: null },
          ].map(({ label, days }) => (
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
          保持期間
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
          <Text style={{ color: 'var(--fgColor-muted)' }}>日間</Text>
        </div>
        <FormControl.Caption id="retention-help">
          1〜365日の範囲で設定、または「無制限」ボタンで無制限に設定できます（推奨: 30日）
        </FormControl.Caption>
        {validationError && (
          <ErrorMessage error={validationError} />
        )}
      </FormControl>

      {/* 保存ボタンとメッセージ */}
      <div style={{ marginTop: '24px' }}>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || validationError !== null}
          leadingVisual={!isSaving ? CheckIcon : undefined}
        >
          {isSaving ? (
            <>保存中...</>
          ) : (
            <>設定を保存</>
          )}
        </Button>

        {saveMessage && (
          <Flash
            variant={saveMessage.includes('失敗') ? 'danger' : 'success'}
            style={{ marginTop: '12px' }}
          >
            {saveMessage}
          </Flash>
        )}
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
          <strong>重要:</strong> 保持期間を短くすると、既にゴミ箱にあるタスクも新しい期間で再計算されます。
          必要なタスクは期間変更前に復元することをお勧めします。
        </Text>
      </div>
    </div>
  );
};

export default RecycleBinSettingsPanel;