import { memo, useMemo, useState, useCallback } from 'react';
import { Text, Button, FormControl, Select, RadioGroup, Radio } from '@primer/react';
import { DownloadIcon } from '@primer/octicons-react';

import { useKanban } from '../../contexts/KanbanContext';
import { calculateDataStatistics, calculateCurrentBoardStatistics } from '../../utils/dataStatistics';
import type { KanbanBoard } from '../../types';
import { DataStatistics } from './DataStatistics';

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
  const [exportType, setExportType] = useState<'all' | 'selected'>('all');
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

  // エクスポート実行処理
  const handleExport = useCallback(() => {
    if (exportType === 'all') {
      onExportAll?.();
    } else if (selectedBoard && onExportCurrent) {
      onExportCurrent(selectedBoard);
    }
  }, [exportType, selectedBoard, onExportAll, onExportCurrent]);

  // 表示する統計情報を決定
  const currentStatistics = exportType === 'all' ? allDataStatistics : selectedBoardStatistics;
  const statisticsTitle = exportType === 'all' ? 'エクスポートされるデータ' : `「${selectedBoard?.title}」のデータ`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: "16px" }}>
      {/* セクション概要 */}
      <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
        タスク管理データをJSON形式でエクスポートします。バックアップや他の環境への移行にご利用ください。
      </Text>

      {/* エクスポート範囲選択 */}
      <FormControl>
        <FormControl.Label sx={{ fontSize: 1, fontWeight: '600' }}>
          エクスポート範囲
        </FormControl.Label>
        <RadioGroup
          name="exportType"
          onChange={(value) => setExportType(value as 'all' | 'selected')}
          sx={{ mt: 1 }}
        >
          <FormControl>
            <Radio value="all" checked={exportType === 'all'} />
            <FormControl.Label>全データをエクスポート</FormControl.Label>
          </FormControl>
          <FormControl>
            <Radio value="selected" checked={exportType === 'selected'} />
            <FormControl.Label>選択したボードをエクスポート</FormControl.Label>
          </FormControl>
        </RadioGroup>
      </FormControl>

      {/* ボード選択（特定ボードを選択した場合のみ表示） */}
      {exportType === 'selected' && (
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
      )}

      {/* 統計情報表示 */}
      {currentStatistics && (
        <DataStatistics
          statistics={currentStatistics}
          title={statisticsTitle}
        />
      )}

      {/* エクスポート実行ボタン */}
      <div style={{ paddingTop: "12px", borderTop: "1px solid", borderColor: "var(--borderColor-default)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
          <Button
            variant="primary"
            leadingVisual={DownloadIcon}
            onClick={handleExport}
            disabled={exportType === 'selected' && !selectedBoard}
            sx={{ alignSelf: 'flex-start' }}
          >
            エクスポート実行
          </Button>
        </div>
      </div>
    </div>
  );
});

ExportSection.displayName = 'ExportSection';