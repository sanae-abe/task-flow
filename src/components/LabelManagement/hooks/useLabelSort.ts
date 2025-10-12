import { useState, useCallback } from 'react';
import type { SortField, SortDirection } from '../../../types/labelManagement';

export const useLabelSort = () => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      // 同じフィールドをクリックした場合は方向を反転
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // 異なるフィールドをクリックした場合は昇順で開始
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  return {
    sortField,
    sortDirection,
    handleSort
  };
};