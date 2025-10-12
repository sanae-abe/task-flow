import React, { useState, useCallback } from "react";
import {
  Text,
  FormControl,
  Checkbox,
  Button,
  TextInput,
  ActionList,
  ActionMenu,
  Flash,
} from "@primer/react";
import { TrashIcon, ShieldIcon, ClockIcon } from "@primer/octicons-react";
import type { AutoDeletionSettings } from "../../types/settings";
import {
  getAutoDeletionSettings,
  updateAutoDeletionSettings,
} from "../../utils/settingsStorage";
import { RETENTION_PRESETS } from "../../utils/deletionHelpers";
import { logger } from "../../utils/logger";

export const AutoDeletionSettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<AutoDeletionSettings>(getAutoDeletionSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      updateAutoDeletionSettings(settings);
      setSaveMessage({
        type: "success",
        text: "設定が保存されました",
      });
      logger.info("Auto-deletion settings saved successfully");
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: "設定の保存に失敗しました",
      });
      logger.error("Failed to save auto-deletion settings:", error);
    } finally {
      setIsSaving(false);
      // 3秒後にメッセージを消去
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [settings]);

  const handlePresetSelect = useCallback((presetKey: string) => {
    const preset = RETENTION_PRESETS[presetKey as keyof typeof RETENTION_PRESETS];
    if (preset && preset.days) {
      setSettings((prev) => ({
        ...prev,
        retentionDays: preset.days,
        notificationDays: Math.min(prev.notificationDays, Math.floor(preset.days / 2)),
      }));
    }
  }, []);

  const handleReset = useCallback(() => {
    const defaultSettings: AutoDeletionSettings = {
      enabled: false,
      retentionDays: 30,
      notifyBeforeDeletion: true,
      notificationDays: 7,
      excludeLabelIds: [],
      excludePriorities: ["critical"],
      autoExportBeforeDeletion: true,
      enableSoftDeletion: true,
      softDeletionRetentionDays: 7,
    };
    setSettings(defaultSettings);
  }, []);

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '32px'
    }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <TrashIcon size={24} />
          <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>
            自動削除設定
          </Text>
        </div>
        <Text style={{ color: 'var(--fgColor-muted)' }}>
          完了したタスクを自動的に削除して、データを整理します。
        </Text>
      </div>

      {/* 成功/エラーメッセージ */}
      {saveMessage && (
        <Flash variant={saveMessage.type === "error" ? "danger" : "success"} style={{ marginBottom: '24px' }}>
          {saveMessage.text}
        </Flash>
      )}

      {/* 基本設定 */}
      <div style={{ marginBottom: '32px' }}>
        <FormControl>
          <FormControl.Label>
            <Checkbox
              checked={settings.enabled}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, enabled: e.target.checked }))
              }
            />
            自動削除機能を有効にする
          </FormControl.Label>
          <FormControl.Caption>
            完了したタスクを指定した期間後に自動削除します
          </FormControl.Caption>
        </FormControl>
      </div>

      {/* 保持期間設定 */}
      <div style={{ marginBottom: '32px', opacity: settings.enabled ? 1 : 0.5 }}>
        <FormControl disabled={!settings.enabled}>
          <FormControl.Label>
            <ClockIcon size={16} /> 保持期間
          </FormControl.Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
            <TextInput
              type="number"
              min="1"
              max="365"
              value={settings.retentionDays.toString()}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  retentionDays: Math.max(1, Math.min(365, parseInt(e.target.value) || 1)),
                }))
              }
              style={{ width: '80px' }}
            />
            <Text>日後に削除</Text>
            <ActionMenu>
              <ActionMenu.Button size="small">
                プリセット
              </ActionMenu.Button>
              <ActionMenu.Overlay>
                <ActionList>
                  {Object.entries(RETENTION_PRESETS).map(([key, preset]) => {
                    if (!preset.days) {
                      return null;
                    }
                    return (
                      <ActionList.Item
                        key={key}
                        onSelect={() => handlePresetSelect(key)}
                      >
                        <ActionList.LeadingVisual>
                          {preset.icon}
                        </ActionList.LeadingVisual>
                        {preset.label}
                        <ActionList.Description>
                          {preset.description}
                        </ActionList.Description>
                      </ActionList.Item>
                    );
                  })}
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </div>
          <FormControl.Caption>
            完了から削除までの日数（1〜365日）
          </FormControl.Caption>
        </FormControl>
      </div>

      {/* 通知設定 */}
      <div style={{ marginBottom: '32px', opacity: settings.enabled ? 1 : 0.5 }}>
        <FormControl disabled={!settings.enabled}>
          <FormControl.Label>
            <Checkbox
              checked={settings.notifyBeforeDeletion}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  notifyBeforeDeletion: e.target.checked,
                }))
              }
            />
            削除前に通知する
          </FormControl.Label>
          <FormControl.Caption>
            削除予定のタスクがある場合に事前通知します
          </FormControl.Caption>
        </FormControl>

        {settings.notifyBeforeDeletion && (
          <div style={{ marginTop: '16px', marginLeft: '24px' }}>
            <FormControl disabled={!settings.enabled}>
              <FormControl.Label>通知タイミング</FormControl.Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <TextInput
                  type="number"
                  min="0"
                  max={Math.max(0, settings.retentionDays - 1)}
                  value={settings.notificationDays.toString()}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      notificationDays: Math.max(
                        0,
                        Math.min(
                          prev.retentionDays - 1,
                          parseInt(e.target.value) || 0
                        )
                      ),
                    }))
                  }
                  style={{ width: '80px' }}
                />
                <Text>日前に通知</Text>
              </div>
            </FormControl>
          </div>
        )}
      </div>

      {/* ソフトデリート設定 */}
      <div style={{ marginBottom: '32px', opacity: settings.enabled ? 1 : 0.5 }}>
        <FormControl disabled={!settings.enabled}>
          <FormControl.Label>
            <Checkbox
              checked={settings.enableSoftDeletion}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  enableSoftDeletion: e.target.checked,
                }))
              }
            />
            <ShieldIcon size={16} /> ソフトデリート機能
          </FormControl.Label>
          <FormControl.Caption>
            即座に削除せず、一定期間復元可能な状態で保持します
          </FormControl.Caption>
        </FormControl>

        {settings.enableSoftDeletion && (
          <div style={{ marginTop: '16px', marginLeft: '24px' }}>
            <FormControl disabled={!settings.enabled}>
              <FormControl.Label>猶予期間</FormControl.Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <TextInput
                  type="number"
                  min="1"
                  max="30"
                  value={settings.softDeletionRetentionDays.toString()}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      softDeletionRetentionDays: Math.max(
                        1,
                        Math.min(30, parseInt(e.target.value) || 1)
                      ),
                    }))
                  }
                  style={{ width: '80px' }}
                />
                <Text>日間復元可能</Text>
              </div>
            </FormControl>
          </div>
        )}
      </div>

      {/* 自動エクスポート設定 */}
      <div style={{ marginBottom: '32px', opacity: settings.enabled ? 1 : 0.5 }}>
        <FormControl disabled={!settings.enabled}>
          <FormControl.Label>
            <Checkbox
              checked={settings.autoExportBeforeDeletion}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  autoExportBeforeDeletion: e.target.checked,
                }))
              }
            />
            削除前に自動バックアップ
          </FormControl.Label>
          <FormControl.Caption>
            削除前にタスクデータを自動的にエクスポート・保存します
          </FormControl.Caption>
        </FormControl>
      </div>

      {/* アクションボタン */}
      <div style={{
        display: 'flex',
        gap: '16px',
        paddingTop: '24px',
        borderTop: '1px solid var(--borderColor-default)'
      }}>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
          style={{ flex: 1 }}
        >
          {isSaving ? "保存中..." : "設定を保存"}
        </Button>
        <Button
          onClick={handleReset}
          disabled={isSaving}
        >
          リセット
        </Button>
      </div>

      {/* 注意事項 */}
      <div style={{
        marginTop: '32px',
        padding: '24px',
        backgroundColor: 'var(--bgColor-attention-subtle)',
        borderRadius: '8px'
      }}>
        <Text style={{ fontSize: '14px', color: 'var(--fgColor-muted)' }}>
          <strong>注意:</strong> この機能を有効にすると、完了したタスクが自動的に削除されます。
          重要なタスクは削除対象から除外するか、ソフトデリート機能を有効にして
          復元可能な期間を設けることをお勧めします。
        </Text>
      </div>
    </div>
  );
};

export default AutoDeletionSettingsPanel;