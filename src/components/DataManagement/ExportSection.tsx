import { memo, useMemo, useState, useCallback } from 'react';
import { Box, Text, Heading, Button, FormControl, Select } from '@primer/react';
import { DownloadIcon, DatabaseIcon, ProjectIcon } from '@primer/octicons-react';

import { useKanban } from '../../contexts/KanbanContext';
import { calculateDataStatistics, calculateCurrentBoardStatistics } from '../../utils/dataStatistics';
import type { KanbanBoard } from '../../types';
import { DataStatistics } from './DataStatistics';
import { CollapsibleSection } from './CollapsibleSection';

/**
 * データエクスポート機能を提供するセクション
 */
interface ExportSectionProps {
  /** 全データエクスポート時のコールバック */
  onExportAll?: () => void;
  /** ボード選択エクスポート時のコールバック */
  onExportCurrent?: (board?: KanbanBoard) => void;
}

export const ExportSection = memo<ExportSectionProps>(({
  onExportAll,
  onExportCurrent
}) => {
  const { state } = useKanban();
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');

  // 全体の統計情報を計算
  const allDataStatistics = useMemo(
    () => calculateDataStatistics(state.boards, state.labels),
    [state.boards, state.labels]
  );

  // 選択されたボードの統計情報を計算
  const selectedBoard = useMemo(
    () => state.boards.find(board => board.id === selectedBoardId),
    [state.boards, selectedBoardId]
  );

  const selectedBoardStatistics = useMemo(
    () => selectedBoard ? calculateCurrentBoardStatistics(selectedBoard) : null,
    [selectedBoard]
  );

  // ボード選択時のエクスポート処理
  const handleExportSelectedBoard = useCallback(() => {
    if (selectedBoard && onExportCurrent) {
      onExportCurrent(selectedBoard);
    }
  }, [selectedBoard, onExportCurrent]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* セクション概要 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <Heading sx={{ fontSize: 2, fontWeight: 'bold' }}>
          データ管理
        </Heading>
        <Text sx={{ fontSize: 1, color: 'fg.muted', pb: 2 }}>
          タスク管理データをJSON形式でエクスポートできます。バックアップや他の環境への移行にご利用ください。
        </Text>
      </div>

      {/* 全データエクスポート - 折りたたみ式 */}
      <CollapsibleSection
        icon={DatabaseIcon}
        title="全データをエクスポート"
        iconBg="var(--bgColor-accent-muted)"
        iconColor="var(--fgColor-accent)"
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
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: 'var(--button-outline-bgColor-active)'
              }
            }}
          >
            全データをエクスポート
          </Button>
        </Box>
      </CollapsibleSection>

      {/* ボード選択エクスポート - 折りたたみ式 */}
      <CollapsibleSection
        icon={ProjectIcon}
        title="ボードを選択してエクスポート"
        iconBg="var(--bgColor-success-muted)"
        iconColor="var(--fgColor-success)"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
            エクスポートするボードを選択して、そのボードのタスクと関連データをエクスポートします。
          </Text>

          {/* ボード選択 */}
          <FormControl>
            <FormControl.Label>エクスポートするボード</FormControl.Label>
            <Select
              value={selectedBoardId}
              onChange={(e) => setSelectedBoardId(e.target.value)}
              sx={{ width: '100%' }}
              placeholder="ボードを選択してください"
            >
              {state.boards.map(board => (
                <Select.Option key={board.id} value={board.id}>
                  {board.title}
                </Select.Option>
              ))}
            </Select>
          </FormControl>

          {/* 選択されたボードの統計情報 */}
          {selectedBoardStatistics && selectedBoard && (
            <DataStatistics
              statistics={selectedBoardStatistics}
              title={`「${selectedBoard.title}」のデータ`}
              variant="success"
            />
          )}

          <Button
            variant="primary"
            leadingVisual={DownloadIcon}
            onClick={handleExportSelectedBoard}
            disabled={!selectedBoard}
          >
            選択したボードをエクスポート
          </Button>
        </Box>
      </CollapsibleSection>
    </Box>
  );
});

ExportSection.displayName = 'ExportSection';