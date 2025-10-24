import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { SortField, SortDirection } from '../../../types/labelManagement';

interface SortableHeaderProps {
  field: SortField;
  currentSortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
  align?: 'left' | 'center';
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  currentSortField,
  sortDirection,
  onSort,
  children,
  align = 'left'
}) => {
  const isActive = currentSortField === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      style={{
        color: 'hsl(var(--muted-foreground))'
      }}
      className={`bg-transparent border-0 cursor-pointer flex w-full p-0 font-xs font-bold font-[inherit] ${
        align === 'center' ? 'justify-center' : 'justify-start'
      }`}
      aria-label={`${children}でソート`}
    >
      <span>{children}</span>
      <span className={`${isActive ? 'opacity-30 text-[10px]' : ''}`}>
        {isActive && sortDirection === 'asc' ? (
          <ChevronUp size={12} />
        ) : (
          <ChevronDown size={12} />
        )}
      </span>
    </button>
  );
};

export default SortableHeader;