import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@primer/octicons-react';
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
        color: 'var(--fgColor-muted)'
      }}
      className={`bg-transparent border-0 cursor-pointer flex w-full p-0 font-xs font-bold font-[inherit] ${
        align === 'center' ? 'justify-center' : 'justify-start'
      }`}
      aria-label={`${children}でソート`}
    >
      <span>{children}</span>
      <span className={`${isActive ? 'opacity-30 text-[10px]' : ''}`}>
        {isActive && sortDirection === 'asc' ? (
          <ChevronUpIcon size={12} />
        ) : (
          <ChevronDownIcon size={12} />
        )}
      </span>
    </button>
  );
};

export default SortableHeader;