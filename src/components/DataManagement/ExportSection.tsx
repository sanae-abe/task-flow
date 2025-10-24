import { memo, useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
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
  /** メッセージ表示時のコールバック */
  onMessage?: (message: { type: 'success' | 'critical' | 'warning' | 'danger' | 'default' | 'info' | 'upsell'; text: string }) => void;
}

export const ExportSection = memo<ExportSectionProps>(({
  onExportAll,
  onExportCurrent,
  onMessage
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

    try {
      if (exportType === 'all') {
        onExportAll?.();
        const successMessage = {
          type: 'success' as const,
          text: '全データをエクスポートしました'
        };
        onMessage?.(successMessage);
      } else if (selectedBoard && onExportCurrent) {
        onExportCurrent(selectedBoard);
        const successMessage = {
          type: 'success' as const,
          text: `「${selectedBoard.title}」をエクスポートしました`
        };
        onMessage?.(successMessage);
      }
    } catch (error) {
      const errorMessage = {
        type: 'critical' as const,
        text: 'エクスポートに失敗しました'
      };
      onMessage?.(errorMessage);
    }
  }, [exportType, selectedBoard, onExportAll, onExportCurrent, onMessage]);

  // 表示する統計情報を決定
  const currentStatistics = exportType === 'all' ? allDataStatistics : selectedBoardStatistics;
  const statisticsTitle = exportType === 'all' ? 'エクスポートされるデータ' : `「${selectedBoard?.title}」のデータ`;

  return (
    <div className="flex flex-col gap-4">
      {/* セクション概要 */}
      <p className="text-sm text-gray-600">
        タスク管理データをJSON形式でエクスポートします。<br />バックアップや他の環境への移行にご利用ください。
      </p>

      {/* エクスポート範囲選択 */}
      <div>
        <label className="text-sm font-semibold">
          エクスポート範囲
        </label>
        <div className="mt-1 space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="export-all"
              name="exportType"
              value="all"
              checked={exportType === 'all'}
              onChange={(e) => setExportType(e.target.value as 'all' | 'selected')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="export-all" className="text-sm text-gray-900">
              全データをエクスポート
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="export-selected"
              name="exportType"
              value="selected"
              checked={exportType === 'selected'}
              onChange={(e) => setExportType(e.target.value as 'all' | 'selected')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="export-selected" className="text-sm text-gray-900">
              選択したボードをエクスポート
            </label>
          </div>
        </div>
      </div>

      {/* ボード選択（特定ボードを選択した場合のみ表示） */}
      {exportType === 'selected' && (
        <div>
          <label htmlFor="board-select" className="block text-sm font-medium text-gray-700 mb-1">
            エクスポートするボード
          </label>
          <select
            id="board-select"
            value={selectedBoardId}
            onChange={(e) => setSelectedBoardId(e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">ボードを選択してください</option>
            {state.boards.map(board => (
              <option key={board.id} value={board.id}>
                {board.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 統計情報表示 */}
      {currentStatistics && (
        <DataStatistics
          statistics={currentStatistics}
          title={statisticsTitle}
        />
      )}

      {/* エクスポート実行ボタン */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-end flex-col gap-2">
          <Button
            variant="default"
            onClick={handleExport}
            disabled={exportType === 'selected' && !selectedBoard}
          >
            <DownloadIcon size={16} className="mr-2" />
            エクスポート実行
          </Button>
        </div>
      </div>
    </div>
  );
});

ExportSection.displayName = 'ExportSection';