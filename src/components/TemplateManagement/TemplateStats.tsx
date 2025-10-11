import React from 'react';
import { Box, Text } from '@primer/react';
import type { TaskTemplate } from '../../types/template';

interface TemplateStatsProps {
  templates: TaskTemplate[];
  filteredTemplates: TaskTemplate[];
  hasActiveFilters: boolean;
}

/**
 * テンプレート統計情報コンポーネント
 */
const TemplateStats: React.FC<TemplateStatsProps> = ({
  templates,
  filteredTemplates,
  hasActiveFilters
}) => {
  // 統計情報の計算
  const totalTemplates = templates.length;
  const favoriteCount = templates.filter(t => t.isFavorite).length;
  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);
  const usedTemplatesCount = templates.filter(t => t.usageCount > 0).length;
  const filteredCount = filteredTemplates.length;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 3,
        p: 3,
        bg: 'canvas.subtle',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'border.default'
      }}
    >
      {/* 総テンプレート数 */}
      <Box sx={{ textAlign: 'center' }}>
        <Text sx={{ fontSize: 2, fontWeight: 'bold', color: 'fg.default' }}>
          {hasActiveFilters ? `${filteredCount} / ${totalTemplates}` : totalTemplates}
        </Text>
        <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
          {hasActiveFilters ? '表示中 / 総テンプレート数' : '総テンプレート数'}
        </Text>
      </Box>

      {/* お気に入り数 */}
      <Box sx={{ textAlign: 'center' }}>
        <Text sx={{ fontSize: 2, fontWeight: 'bold', color: 'attention.fg' }}>
          {favoriteCount}
        </Text>
        <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
          お気に入り
        </Text>
      </Box>

      {/* 総使用回数 */}
      <Box sx={{ textAlign: 'center' }}>
        <Text sx={{ fontSize: 2, fontWeight: 'bold', color: 'success.fg' }}>
          {totalUsage}
        </Text>
        <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
          総使用回数
        </Text>
      </Box>

      {/* 使用済みテンプレート数 */}
      <Box sx={{ textAlign: 'center' }}>
        <Text sx={{ fontSize: 2, fontWeight: 'bold', color: 'accent.fg' }}>
          {usedTemplatesCount}
        </Text>
        <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
          使用済み数
        </Text>
      </Box>
    </Box>
  );
};

export default TemplateStats;