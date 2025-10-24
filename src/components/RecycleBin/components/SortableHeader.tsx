import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { SortField, SortDirection } from '../../../hooks/useRecycleBinSort';

interface SortableHeaderProps {
  field: SortField;
  children: React.ReactNode;
  align?: 'left' | 'center';
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

/**
 * ソート可能なテーブルヘッダーコンポーネント
 */
export const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  children,
  align = 'left',
  sortField,
  sortDirection,
  onSort,
}) => {
  const isActive = sortField === field;

  return (
    <button
      onClick={() => onSort(field)}
      aria-label={`${children}でソート${isActive ? (sortDirection === 'asc' ? '（昇順）' : '（降順）') : ''}`}
      className={`w-full ${align === 'center' ? 'justify-center' : 'justify-start'} font-bold border-0 p-2 text-muted-foreground text-xs bg-transparent appearance-none flex items-center gap-1 cursor-pointer transition-colors duration-200 ease-in-out hover:text-foreground`}
    >
      <span className="text-xs font-bold">
        {children}
      </span>
      <div className={`${isActive ? 'opacity-100' : 'opacity-30'}`}>
        {isActive && sortDirection === 'asc' ? (
          <ChevronUp size={12} />
        ) : (
          <ChevronDown size={12} />
        )}
      </div>
    </button>
  );
};