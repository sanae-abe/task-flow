import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { type RecycleBinSettings } from '../../../types/settings';

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
}) => {
  const { t } = useTranslation();

  const presets = [
    { days: 7, label: t('settings.recycleBinSettings.presets.oneWeek') },
    { days: 14, label: t('settings.recycleBinSettings.presets.twoWeeks') },
    { days: 30, label: t('settings.recycleBinSettings.presets.oneMonth') },
    { days: 90, label: t('settings.recycleBinSettings.presets.threeMonths') },
    { days: null, label: t('settings.recycleBinSettings.presets.unlimited') },
  ];

  return (
    <div className='mb-4'>
      <span className='text-sm font-semibold mb-2 block'>
        {t('settings.recycleBinSettings.presetTitle')}
      </span>
      <div className='flex gap-2 flex-wrap'>
        {presets.map(({ label, days }) => (
          <Button
            key={days?.toString() || 'unlimited'}
            variant={settings.retentionDays === days ? 'default' : 'outline'}
            onClick={() => onPresetSelect(days)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};
