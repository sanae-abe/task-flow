import { memo, useMemo } from 'react';
import { Box, Text, Button } from '@primer/react';
import { DownloadIcon, DatabaseIcon, ProjectIcon } from '@primer/octicons-react';

import { useKanban } from '../../contexts/KanbanContext';
import { calculateDataStatistics, calculateCurrentBoardStatistics, formatFileSize } from '../../utils/dataStatistics';
import { DataStatistics } from './DataStatistics';

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Text sx={{ fontWeight: 'bold', mb: 2, display: 'block' }}>
          データのエクスポート
        </Text>
        <Text sx={{ fontSize: 1, color: 'fg.muted', mb: 3, display: 'block' }}>
          タスク管理データをJSON形式でエクスポートできます。バックアップや他の環境への移行にご利用ください。
        </Text>
      </Box>

      {/* 全データエクスポートカード */}
      <Box
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2,
          bg: 'canvas.default',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'accent.emphasis',
            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: 2,
              bg: 'accent.subtle',
              color: 'accent.fg'
            }}
          >
            <DatabaseIcon size={20} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Text sx={{ fontSize: 2, fontWeight: 'bold', display: 'block', mb: 1 }}>
              全データをエクスポート
            </Text>
            <Text sx={{ fontSize: 1, color: 'fg.muted', display: 'block' }}>
              すべてのボード、タスク、ラベルを含む完全なバックアップを作成します
            </Text>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <DataStatistics statistics={allDataStatistics} title="エクスポートされるデータ" />
        </Box>

        <Button
          variant="primary"
          leadingVisual={DownloadIcon}
          onClick={onExportAll}
          sx={{
            width: '100%',
            justifyContent: 'center',
            color: 'fg.onEmphasis !important'
          }}
        >
          全データをエクスポート
        </Button>
      </Box>

      {/* 現在のボードエクスポートカード */}
      <Box
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2,
          bg: 'canvas.default',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'accent.emphasis',
            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: 2,
              bg: 'success.subtle',
              color: 'success.fg'
            }}
          >
            <ProjectIcon size={20} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Text sx={{ fontSize: 2, fontWeight: 'bold', display: 'block', mb: 1 }}>
              現在のボードをエクスポート
            </Text>
            <Text sx={{ fontSize: 1, color: 'fg.muted', display: 'block' }}>
              選択中のボード「{currentBoardName}」のみをエクスポートします
            </Text>
          </Box>
        </Box>

        <Box
          sx={{
            mb: 3,
            p: 2,
            bg: 'canvas.subtle',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'border.default'
          }}
        >
          <Text sx={{ fontSize: 1, fontWeight: '600', color: 'fg.muted', display: 'block', mb: 2 }}>
            エクスポートされるデータ
          </Text>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text sx={{ fontSize: 1, color: 'fg.muted' }}>タスク</Text>
              <Text sx={{ fontSize: 1, fontWeight: '600' }}>
                {currentBoardStatistics.taskCount}個
              </Text>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text sx={{ fontSize: 1, color: 'fg.muted' }}>添付ファイル</Text>
              <Text sx={{ fontSize: 1, fontWeight: '600' }}>
                {currentBoardStatistics.attachmentCount}個
              </Text>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'border.muted' }}>
              <Text sx={{ fontSize: 1, color: 'fg.muted' }}>推定サイズ</Text>
              <Text sx={{ fontSize: 1, fontWeight: 'bold', color: 'success.fg' }}>
                {formatFileSize(currentBoardStatistics.estimatedSize)}
              </Text>
            </Box>
          </Box>
        </Box>

        <Button
          variant="default"
          leadingVisual={DownloadIcon}
          onClick={onExportCurrent}
          disabled={!state.currentBoard}
          sx={{
            width: '100%',
            justifyContent: 'center'
          }}
        >
          このボードをエクスポート
        </Button>
      </Box>
    </Box>
  );
});

ExportSection.displayName = 'ExportSection';
