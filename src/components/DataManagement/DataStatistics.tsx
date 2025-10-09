import { memo } from 'react';
import { Box, Text } from '@primer/react';
import { DatabaseIcon, TagIcon, TasklistIcon, FileIcon } from '@primer/octicons-react';

import type { DataStatistics as DataStatisticsType, DataStatisticsVariant } from './types';
import { formatFileSize } from '../../utils/dataStatistics';

/**
 * データ統計情報を表示するコンポーネント
 */
interface DataStatisticsProps {
  /** 統計データ */
  statistics: DataStatisticsType;
  /** タイトル */
  title?: string;
  /** 色彩バリエーション */
  variant?: DataStatisticsVariant;
}

interface StatItemProps {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: number | string;
  variant?: DataStatisticsVariant;
}

const StatItem = memo<StatItemProps>(({ icon: Icon, label, value, variant = 'primary' }) => {
  const colorScheme = variant === 'success'
    ? { bg: 'success.subtle', fg: 'success.fg' }
    : { bg: 'accent.subtle', fg: 'accent.fg' };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 2,
        px: 3,
        bg: 'canvas.subtle',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'border.default'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          bg: colorScheme.bg,
          color: colorScheme.fg
        }}
      >
        <Icon size={16} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Text sx={{ fontSize: 0, color: 'fg.muted', display: 'block' }}>
          {label}
        </Text>
        <Text sx={{ fontSize: 2, fontWeight: 'bold', color: 'fg.default' }}>
          {value}
        </Text>
      </Box>
    </Box>
  );
});

StatItem.displayName = 'StatItem';

export const DataStatistics = memo<DataStatisticsProps>(({
  statistics,
  title = 'データ概要',
  variant = 'primary'
}) => {
  const colorScheme = variant === 'success'
    ? { bg: 'success.subtle', fg: 'success.fg' }
    : { bg: 'accent.subtle', fg: 'accent.fg' };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Text sx={{ fontSize: 1, fontWeight: '600', color: 'fg.muted' }}>
        {title}
      </Text>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2
        }}
      >
        <StatItem
          icon={DatabaseIcon}
          label="ボード"
          value={`${statistics.boardCount}個`}
          variant={variant}
        />
        <StatItem
          icon={TasklistIcon}
          label="タスク"
          value={`${statistics.taskCount}個`}
          variant={variant}
        />
        <StatItem
          icon={TagIcon}
          label="ラベル"
          value={`${statistics.labelCount}個`}
          variant={variant}
        />
        <StatItem
          icon={FileIcon}
          label="添付ファイル"
          value={`${statistics.attachmentCount}個`}
          variant={variant}
        />
      </Box>

      <Box
        sx={{
          mt: 1,
          p: 2,
          textAlign: 'center',
          bg: 'canvas.inset',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'border.default'
        }}
      >
        <Text sx={{ fontSize: 0, color: 'fg.muted', display: 'block', mb: 1 }}>
          推定データサイズ
        </Text>
        <Text sx={{ fontSize: 3, fontWeight: 'bold', color: colorScheme.fg }}>
          {formatFileSize(statistics.estimatedSize)}
        </Text>
      </Box>
    </Box>
  );
});

DataStatistics.displayName = 'DataStatistics';
