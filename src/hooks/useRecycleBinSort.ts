import { useMemo, useState, useCallback } from 'react';
import type { RecycleBinItemWithMeta } from '../types/recycleBin';
import type { RecycleBinSettings } from '../types/settings';

export type SortField = 'type' | 'title' | 'deletedAt' | 'location' | 'timeUntilDeletion';
export type SortDirection = 'asc' | 'desc';

interface UseRecycleBinSortProps {
  items: RecycleBinItemWithMeta[];
  recycleBinSettings: RecycleBinSettings;
  defaultSortField?: SortField;
  defaultSortDirection?: SortDirection;
}

interface UseRecycleBinSortReturn {
  sortField: SortField;
  sortDirection: SortDirection;
  sortedItems: RecycleBinItemWithMeta[];
  handleSort: (field: SortField) => void;
}

/**
 * ゴミ箱アイテムのソート機能を提供するカスタムフック
 */
export const useRecycleBinSort = ({
  items,
  recycleBinSettings,
  defaultSortField = 'deletedAt',
  defaultSortDirection = 'desc',
}: UseRecycleBinSortProps): UseRecycleBinSortReturn => {
  const [sortField, setSortField] = useState<SortField>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  /**
   * 削除予定時刻を計算
   */
  const getExpirationTime = useCallback((item: RecycleBinItemWithMeta): number => {
    if (recycleBinSettings.retentionDays === null || !item.deletedAt) {
      return Number.MAX_SAFE_INTEGER; // 無制限は最後
    }
    const deletedDate = new Date(item.deletedAt);
    return deletedDate.getTime() + (recycleBinSettings.retentionDays * 24 * 60 * 60 * 1000);
  }, [recycleBinSettings.retentionDays]);

  /**
   * ソート値を取得
   */
  const getSortValue = useCallback((item: RecycleBinItemWithMeta, field: SortField): string | number => {
    switch (field) {
      case 'type':
        return item.type;
      case 'title':
        return item.title.toLowerCase();
      case 'deletedAt':
        return new Date(item.deletedAt || 0).getTime();
      case 'location':
        return item.type === 'task' ? `${item.boardTitle} → ${item.columnTitle}` : '';
      case 'timeUntilDeletion':
        return getExpirationTime(item);
      default:
        return '';
    }
  }, [getExpirationTime]);

  /**
   * ソート済みアイテム
   */
  const sortedItems = useMemo(() =>
    [...items].sort((a, b) => {
      const aValue = getSortValue(a, sortField);
      const bValue = getSortValue(b, sortField);

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    }),
    [items, sortField, sortDirection, getSortValue]
  );

  /**
   * ソートハンドラー
   */
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  return {
    sortField,
    sortDirection,
    sortedItems,
    handleSort,
  };
};