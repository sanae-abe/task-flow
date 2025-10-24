import { memo } from 'react';
import { Text } from '@primer/react';

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


export const DataStatistics = memo<DataStatisticsProps>(({
  statistics,
  title = 'データ概要'
}) => (
    <div className="flex flex-col" style={{ gap: "8px" }}>
      {title && (
        <Text sx={{ fontSize: 1, fontWeight: '600', color: 'fg.muted' }}>
          {title}
        </Text>
      )}

      {/* シンプルな1行統計表示 */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: 'var(--color-neutral-100)',
          borderRadius: 'var(--borderRadius-medium)',
          border: '1px solid',
          borderColor: 'var(--borderColor-default)'
        }}
      >
        <Text sx={{ fontSize: 1, color: 'fg.default' }}>
          {statistics.taskCount}タスク / {statistics.boardCount}ボード / {statistics.labelCount}ラベル / {statistics.attachmentCount}添付ファイル（約 {formatFileSize(statistics.estimatedSize)}）
        </Text>
      </div>
    </div>
  ));

DataStatistics.displayName = 'DataStatistics';
