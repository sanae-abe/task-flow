import React from 'react';
import { useTranslation } from 'react-i18next';
import { type RecycleBinSettings } from '../../types/settings';
import { useSettingsForm } from '../../hooks/useSettingsForm';
import { InlineMessage } from '../shared';
import { SettingsPresetButtons } from './settings/SettingsPresetButtons';
import { SettingsRetentionInput } from './settings/SettingsRetentionInput';
import { SettingsSaveSection } from './settings/SettingsSaveSection';

interface RecycleBinSettingsPanelProps {
  onSave?: (settings: RecycleBinSettings) => void;
}

/**
 * シンプルなゴミ箱設定パネル
 * 複雑なAutoDeletionSettingsPanelを置き換える軽量版
 */
export const RecycleBinSettingsPanel: React.FC<
  RecycleBinSettingsPanelProps
> = ({ onSave }) => {
  const { t } = useTranslation();
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
    <div className='pb-4'>
      {/* ヘッダー */}
      <div className='flex items-center gap-2 mb-2'>
        <h2 className='text-lg font-bold'>
          {t('settings.recycleBinSettings.title')}
        </h2>
      </div>

      {/* 説明 */}
      <span className='text-sm text-zinc-700 mb-5 block'>
        {t('settings.recycleBinSettings.description')}
      </span>

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
      <div className='mt-5'>
        <InlineMessage
          variant='warning'
          message={t('settings.recycleBinSettings.importantNote')}
        />
      </div>
    </div>
  );
};

export default RecycleBinSettingsPanel;
