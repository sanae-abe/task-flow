import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { type RecycleBinSettings } from '../../../types/settings';
import { InlineMessage } from '../../shared';

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
}) => {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col gap-2'>
      <label className='text-sm font-medium' htmlFor='retention-input'>
        {t('settings.recycleBinSettings.retentionLabel')}
      </label>
      <div className='flex items-center gap-2'>
        <Input
          id='retention-input'
          type='number'
          min='1'
          max='365'
          value={settings.retentionDays?.toString() || ''}
          placeholder={
            settings.retentionDays === null
              ? t('settings.recycleBinSettings.presets.unlimited')
              : ''
          }
          onChange={e => onChange(e.target.value)}
          className='w-[100px]'
          aria-describedby='retention-help'
        />
        <span className='text-muted-foreground'>
          {t('settings.recycleBinSettings.retentionUnit')}
        </span>
      </div>
      <small id='retention-help' className='text-xs text-muted-foreground0'>
        {t('settings.recycleBinSettings.retentionHelp')}
      </small>
      {validationError && (
        <InlineMessage
          variant='critical'
          message={validationError}
          size='small'
        />
      )}
    </div>
  );
};
