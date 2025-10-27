import { memo } from 'react';

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
    <div className="flex flex-col gap-2">
      {title && (
        <span className="text-sm font-semibold text-zinc-700">
          {title}
        </span>
      )}

      {/* シンプルな1行統計表示 */}
      <div className="px-3 py-2 bg-neutral-100 rounded-md border border-border">
        <span className="text-sm text-foreground">
          {statistics.taskCount}タスク / {statistics.boardCount}ボード / {statistics.labelCount}ラベル / {statistics.attachmentCount}添付ファイル（約 {formatFileSize(statistics.estimatedSize)}）
        </span>
      </div>
    </div>
  ));

DataStatistics.displayName = 'DataStatistics';