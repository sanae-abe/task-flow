import React from 'react';
import { Text } from '@primer/react';
import { ChevronUpIcon, ChevronDownIcon } from '@primer/octicons-react';
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
      style={{
        width: '100%',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        fontWeight: 'bold',
        border: 0,
        padding: '8px',
        color: 'var(--fgColor-muted)',
        fontSize: '12px',
        background: 'none',
        appearance: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer',
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--fgColor-default)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--fgColor-muted)';
      }}
    >
      <Text sx={{ fontSize: 0, fontWeight: 'bold' }}>
        {children}
      </Text>
      <div style={{ opacity: isActive ? 1 : 0.3 }}>
        {isActive && sortDirection === 'asc' ? (
          <ChevronUpIcon size={12} />
        ) : (
          <ChevronDownIcon size={12} />
        )}
      </div>
    </button>
  );
};