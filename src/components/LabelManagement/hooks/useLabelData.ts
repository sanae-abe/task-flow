import { useMemo } from 'react';
import type {
  SortField,
  SortDirection,
  LabelWithInfo,
} from '../../../types/labelManagement';
import { useLabel } from '../../../contexts/LabelContext';

export const useLabelData = (
  sortField: SortField,
  sortDirection: SortDirection
) => {
  const { getAllLabelsWithBoardInfo, getAllLabelUsageCount } = useLabel();

  // 全ボードのラベルデータを取得してusageCountを追加、ソート適用
  const allLabelsWithInfo = useMemo(() => {
    const labelsMap = new Map<string, LabelWithInfo>();

    // 全ボードのラベルを収集
    const allLabelsFromContext = getAllLabelsWithBoardInfo();

    allLabelsFromContext.forEach(labelWithBoard => {
      const existingLabel = labelsMap.get(labelWithBoard.id);

      if (existingLabel) {
        // 既に存在する場合、ボード名を結合
        existingLabel.boardName = `${existingLabel.boardName}, ${labelWithBoard.boardName}`;
      } else {
        // 新しいラベルの場合、使用数を計算して追加
        labelsMap.set(labelWithBoard.id, {
          ...labelWithBoard,
          usageCount: getAllLabelUsageCount(labelWithBoard.id),
        });
      }
    });

    // ソート処理
    const sortedLabels = Array.from(labelsMap.values()).sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'boardName':
          comparison = a.boardName.localeCompare(b.boardName);
          break;
        case 'usageCount':
          comparison = a.usageCount - b.usageCount;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sortedLabels;
  }, [
    getAllLabelsWithBoardInfo,
    getAllLabelUsageCount,
    sortField,
    sortDirection,
  ]);

  return {
    allLabelsWithInfo,
  };
};
