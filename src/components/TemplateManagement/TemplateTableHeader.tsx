import React from 'react';
import { Text } from '@primer/react';
import { ChevronUpIcon, ChevronDownIcon, StarFillIcon } from '@primer/octicons-react';
import type { TemplateSortField, TemplateSortDirection } from '../../types/template';

interface SortableHeaderProps {
  field: TemplateSortField;
  currentSortField: TemplateSortField;
  sortDirection: TemplateSortDirection;
  onSort: (field: TemplateSortField) => void;
  children: React.ReactNode;
  align?: 'left' | 'center';
}

/**
 * ソート可能なヘッダーコンポーネント
 */
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
      onClick={() => onSort(field)}
      aria-label={`${children}でソート`}
      className="TableSortButton"
      style={{
        width: '100%',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        fontWeight: 'bold',
        border: 0,
        padding: '8px',
        color: 'var(--fgColor-muted)',
        fontSize: 0,
        background: 'none',
        appearance: 'none'
      }}
    >
      <div className="flex items-center gap-1">
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
      </div>
    </button>
  );
};

interface TemplateTableHeaderProps {
  sortField: TemplateSortField;
  sortDirection: TemplateSortDirection;
  onSort: (field: TemplateSortField) => void;
}

/**
 * テンプレートテーブルのヘッダーコンポーネント
 */
const TemplateTableHeader: React.FC<TemplateTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 120px 80px 100px',
      gap: '8px',
      background: 'var(--color-neutral-100)',
      borderBottom: '1px solid',
      borderColor: 'var(--borderColor-default)',
      fontSize: '12px',
      fontWeight: 'bold',
      color: 'var(--fgColor-muted)'
    }}
  >
    <SortableHeader
      field="favorite"
      currentSortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
    >
      <div className="flex items-center gap-1">
        <StarFillIcon size={12} />
        <Text sx={{ fontSize: 0 }}>おすすめ順</Text>
      </div>
    </SortableHeader>

    <SortableHeader
      field="category"
      currentSortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
    >
      カテゴリー
    </SortableHeader>

    <SortableHeader
      field="usageCount"
      currentSortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      align="center"
    >
      使用数
    </SortableHeader>

    <Text sx={{ textAlign: 'center', fontSize: 0, p: 2 }}>操作</Text>
  </div>
);

export default TemplateTableHeader;