import { memo, useMemo, useState, useCallback } from 'react';
import { Box, Text, Button } from '@primer/react';
import { DownloadIcon, DatabaseIcon, ProjectIcon } from '@primer/octicons-react';

import { useKanban } from '../../contexts/KanbanContext';
import { calculateDataStatistics, calculateCurrentBoardStatistics } from '../../utils/dataStatistics';
import { DataStatistics } from './DataStatistics';
import { CollapsibleSection } from './CollapsibleSection';

/**
 * データエクスポート機能を提供するセクション
 */
interface ExportSectionProps {
  /** 全データエクスポート時のコールバック */
  onExportAll?: () => void;
  /** 現在のボードエクスポート時のコールバック */
  onExportCurrent?: () => void;
}

export const ExportSection = memo<ExportSectionProps>(({
  onExportAll,
  onExportCurrent
}) => {
  const { state } = useKanban();
  const [expandedSections, setExpandedSections] = useState({
    all: false,
    current: false
  });

  // 全体の統計情報を計算
  const allDataStatistics = useMemo(
    () => calculateDataStatistics(state.boards, state.labels),
    [state.boards, state.labels]
  );

  // 現在のボードの統計情報を計算
  const currentBoardStatistics = useMemo(
    () => calculateCurrentBoardStatistics(state.currentBoard),
    [state.currentBoard]
  );

  const currentBoardName = state.currentBoard?.title || '未選択';

  const toggleSection = useCallback((section: 'all' | 'current') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* セクション概要 */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DatabaseIcon size={20} />
          <Text sx={{ fontSize: 2, fontWeight: 'bold' }}>
            データ管理
          </Text>
        </Box>
        <Text sx={{ fontSize: 1, color: 'fg.muted', pb: 2 }}>
          タスク管理データをJSON形式でエクスポートできます。バックアップや他の環境への移行にご利用ください。
        </Text>
      </Box>

      {/* 全データエクスポート - 折りたたみ式 */}
      <CollapsibleSection
        icon={DatabaseIcon}
        title="全データをエクスポート"
        description="すべてのボード、タスク、ラベルをエクスポート"
        isExpanded={expandedSections.all}
        onToggle={() => toggleSection('all')}
        iconBg="accent.subtle"
        iconColor="accent.fg"
        expandedBg="accent.subtle"
        expandedBorderColor="accent.emphasis"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
            すべてのボード、タスク、ラベルを含む完全なバックアップを作成します。
          </Text>

          <DataStatistics
            statistics={allDataStatistics}
            title="エクスポートされるデータ"
            variant="primary"
          />

          <Button
            variant="primary"
            leadingVisual={DownloadIcon}
            onClick={onExportAll}
            sx={{
              backgroundColor: 'accent.fg',
            }}
          >
            全データをエクスポート
          </Button>
        </Box>
      </CollapsibleSection>

      {/* 現在のボードエクスポート - 折りたたみ式 */}
      <CollapsibleSection
        icon={ProjectIcon}
        title="現在のボードをエクスポート"
        description={`ボード「${currentBoardName}」のみをエクスポート`}
        isExpanded={expandedSections.current}
        onToggle={() => toggleSection('current')}
        iconBg="success.subtle"
        iconColor="success.fg"
        expandedBg="success.subtle"
        expandedBorderColor="success.emphasis"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
            選択中のボード「{currentBoardName}」のタスクと関連データのみをエクスポートします。
          </Text>

          <DataStatistics
            statistics={currentBoardStatistics}
            title="エクスポートされるデータ"
            variant="success"
          />

          <Button
            variant="primary"
            leadingVisual={DownloadIcon}
            onClick={onExportCurrent}
            disabled={!state.currentBoard}
          >
            このボードをエクスポート
          </Button>
        </Box>
      </CollapsibleSection>
    </Box>
  );
});

ExportSection.displayName = 'ExportSection';