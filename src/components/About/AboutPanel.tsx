import { Info } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * アプリケーション情報を表示するパネル
 */
const AboutPanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className='space-y-6'>
      {/* アプリケーション情報セクション */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Info size={20} className='text-primary' />
          <h3 className='text-lg font-semibold'>{t('about.title')}</h3>
        </div>

        <div className='space-y-3'>
          {/* アプリケーション名 */}
          <div>
            <dt className='text-sm font-medium text-muted-foreground'>
              {t('about.appName')}
            </dt>
            <dd className='text-base font-semibold mt-1'>TaskFlow</dd>
          </div>

          {/* バージョン */}
          <div>
            <dt className='text-sm font-medium text-muted-foreground'>
              {t('about.version')}
            </dt>
            <dd className='text-base font-mono mt-1'>{__APP_VERSION__}</dd>
          </div>
        </div>
        <div>
          <dt className='text-sm font-medium text-muted-foreground'>
            {t('about.developer')}
          </dt>
          <dd className='text-base mt-1'>
            {__APP_AUTHOR__} (sanae.a.sunny@gmail.com)
          </dd>
        </div>
      </div>
    </div>
  );
};

export default AboutPanel;
