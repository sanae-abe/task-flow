import { memo, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

import type { FormFieldConfig } from '../../types/unified-form';
import { useUnifiedForm } from '../../hooks/useUnifiedForm';
import UnifiedFormField from '../shared/Form/UnifiedFormField';
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

  // 初期値の設定
  const initialValues = useMemo(() => ({
    exportType: 'all',
    selectedBoardId: ''
  }), []);

  // ボード選択のオプション生成
  const boardOptions = useMemo(() => {
    const options = [{ value: '', label: 'ボードを選択してください' }];
    state.boards.forEach(board => {
      options.push({
        value: board.id,
        label: board.title
      });
    });
    return options;
  }, [state.boards]);

  // フィールド設定
  const fields: FormFieldConfig[] = useMemo(() => [
    // エクスポート範囲選択
    {
      id: 'exportType',
      name: 'exportType',
      type: 'select',
      label: 'エクスポート範囲',
      value: initialValues.exportType,
      options: [
        { value: 'all', label: '全データをエクスポート' },
        { value: 'selected', label: '選択したボードをエクスポート' }
      ],
      onChange: () => {}, // フォームで管理
    },
    // ボード選択（条件付き表示）
    {
      id: 'selectedBoardId',
      name: 'selectedBoardId',
      type: 'select',
      label: 'エクスポートするボード',
      value: initialValues.selectedBoardId,
      options: boardOptions,
      onChange: () => {}, // フォームで管理
    },
  ], [initialValues, boardOptions]);

  // 統合フォーム管理
  const form = useUnifiedForm(fields, initialValues);

  // 現在の値を取得
  const currentExportType = String(form.state.values['exportType'] || 'all');
  const currentSelectedBoardId = String(form.state.values['selectedBoardId'] || '');

  // 全体の統計情報を計算
  const allDataStatistics = useMemo(
    () => calculateDataStatistics(state.boards, state.labels),
    [state.boards, state.labels]
  );

  // 選択されたボードの統計情報を計算
  const selectedBoard = useMemo(
    () => state.boards.find(board => board.id === currentSelectedBoardId),
    [state.boards, currentSelectedBoardId]
  );

  const selectedBoardStatistics = useMemo(
    () => selectedBoard ? calculateCurrentBoardStatistics(selectedBoard) : null,
    [selectedBoard]
  );

  // エクスポート実行処理
  const handleExport = useCallback(() => {
    try {
      if (currentExportType === 'all') {
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
    } catch (_error) {
      const errorMessage = {
        type: 'critical' as const,
        text: 'エクスポートに失敗しました'
      };
      onMessage?.(errorMessage);
    }
  }, [currentExportType, selectedBoard, onExportAll, onExportCurrent, onMessage]);

  // 表示する統計情報を決定
  const currentStatistics = currentExportType === 'all' ? allDataStatistics : selectedBoardStatistics;
  const statisticsTitle = currentExportType === 'all' ? 'エクスポートされるデータ' : `「${selectedBoard?.title}」のデータ`;

  // 表示するフィールドをフィルタリング
  const visibleFields = useMemo(() =>
    fields.filter(field => {
      if (field.name === 'selectedBoardId') {
        return currentExportType === 'selected';
      }
      return true;
    }), [fields, currentExportType]);

  return (
    <div className="flex flex-col gap-4">
      {/* セクション概要 */}
      <p className="text-sm text-gray-600">
        タスク管理データをJSON形式でエクスポートします。<br />バックアップや他の環境への移行にご利用ください。
      </p>

      {/* フォームフィールド */}
      <div className="flex flex-col gap-4">
        {visibleFields.map((field) => (
          <UnifiedFormField
            key={field.id}
            {...field}
            value={form.state.values[field.name]}
            onChange={(value) => form.setValue(field.name, value)}
            onBlur={() => form.setTouched(field.name, true)}
            _error={form.getFieldError(field.name)}
            touched={form.state.touched[field.name]}
            disabled={form.state.isSubmitting}
          />
        ))}
      </div>

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
            disabled={currentExportType === 'selected' && !selectedBoard}
          >
            <Download size={16} className="mr-2" />
            エクスポート実行
          </Button>
        </div>
      </div>
    </div>
  );
});

ExportSection.displayName = 'ExportSection';