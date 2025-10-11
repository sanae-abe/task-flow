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
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        width: '100%',
        padding: 0,
        color: 'var(--fgColor-muted)',
        fontSize: '12px',
        fontWeight: 'bold',
        fontFamily: 'inherit'
      }}
      aria-label={`${children}でソート`}
    >
      <span>{children}</span>
      <span style={{ opacity: isActive ? 1 : 0.3, fontSize: '10px' }}>
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