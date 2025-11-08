import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { DataStatistics as DataStatisticsType } from './types';
import { formatFileSize } from '../../utils/dataStatistics';

/**
 * データ統計情報を表示するコンポーネント
 */
interface DataStatisticsProps {
  /** 統計データ */
  statistics: DataStatisticsType;
  /** タイトル */
  title?: string;
}

export const DataStatistics = memo<DataStatisticsProps>(
  ({ statistics, title }) => {
    const { t } = useTranslation();
    const defaultTitle = t('export.dataOverview');

    return (
      <div className='flex flex-col gap-2'>
        {(title || defaultTitle) && (
          <span className='text-sm font-semibold text-zinc-700'>
            {title || defaultTitle}
          </span>
        )}

        {/* シンプルな1行統計表示 */}
        <div className='px-3 py-2 bg-neutral-100 rounded-md border border-border'>
          <span className='text-sm text-foreground'>
            {t('export.taskCount', { count: statistics.taskCount })} /{' '}
            {t('export.boardCount', { count: statistics.boardCount })} /{' '}
            {t('export.labelCount', { count: statistics.labelCount })} /{' '}
            {t('export.attachmentCount', { count: statistics.attachmentCount })}
            （
            {t('export.approximateSize', {
              size: formatFileSize(statistics.estimatedSize),
            })}
            ）
          </span>
        </div>
      </div>
    );
  }
);

DataStatistics.displayName = 'DataStatistics';
