import React from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingButton } from '../../shared/LoadingButton';
import { InlineMessage } from '../../shared';

export interface SettingsSaveSectionProps {
  /** ローディング状態 */
  isLoading: boolean;
  /** バリデーションエラーがあるかどうか */
  hasValidationError: boolean;
  /** 表示するメッセージ */
  message: {
    text: string;
    type: 'success' | '_error' | 'warning' | 'info';
  } | null;
  /** 保存ハンドラ */
  onSave: () => Promise<void>;
}

/**
 * ゴミ箱設定の保存セクションコンポーネント
 * 保存ボタンとメッセージ表示を提供
 */
export const SettingsSaveSection: React.FC<SettingsSaveSectionProps> = ({
  isLoading,
  hasValidationError,
  message,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <div className='mt-6'>
      <LoadingButton
        primerVariant='primary'
        isLoading={isLoading}
        loadingText={t('settings.recycleBinSettings.saving')}
        onClick={onSave}
        disabled={hasValidationError}
      >
        {t('settings.recycleBinSettings.saveButton')}
      </LoadingButton>
      <div className='mt-3'>
        {message && (
          <InlineMessage
            variant={message.type === 'success' ? 'success' : 'critical'}
            message={message.text}
            size='small'
          />
        )}
      </div>
    </div>
  );
};
