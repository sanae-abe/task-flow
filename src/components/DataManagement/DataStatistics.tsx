import { memo } from 'react';
import { Box, Text } from '@primer/react';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {title && (
        <Text sx={{ fontSize: 1, fontWeight: '600', color: 'fg.muted' }}>
          {title}
        </Text>
      )}

      {/* シンプルな1行統計表示 */}
      <Box
        sx={{
          py: 2,
          px: 3,
          bg: 'canvas.subtle',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'border.default'
        }}
      >
        <Text sx={{ fontSize: 1, color: 'fg.default' }}>
          {statistics.taskCount}タスク / {statistics.boardCount}ボード / {statistics.labelCount}ラベル / {statistics.attachmentCount}添付ファイル（約 {formatFileSize(statistics.estimatedSize)}）
        </Text>
      </Box>
    </Box>
  ));

DataStatistics.displayName = 'DataStatistics';
