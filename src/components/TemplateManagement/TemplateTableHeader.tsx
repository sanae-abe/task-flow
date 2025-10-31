import React from 'react';
import { ChevronUp, ChevronDown, Star } from 'lucide-react';
import type {
  TemplateSortField,
  TemplateSortDirection,
} from '../../types/template';

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
  align = 'left',
}) => {
  const isActive = currentSortField === field;

  return (
    <button
      onClick={() => onSort(field)}
      aria-label={`${children}でソート`}
      className={`w-full p-2 font-bold border-0 text-xs text-zinc-700 bg-transparent appearance-none ${
        align === 'center' ? 'justify-center' : 'justify-start'
      } flex`}
    >
      <div className='flex items-center gap-1'>
        <span className='text-xs font-bold'>{children}</span>
        <div className={`${isActive ? 'opacity-100' : 'opacity-30'}`}>
          {isActive && sortDirection === 'asc' ? (
            <ChevronUp size={12} />
          ) : (
            <ChevronDown size={12} />
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
  onSort,
}) => (
  <div className='grid grid-cols-[1fr_120px_80px_100px] gap-2 bg-neutral-100 border-b border-border text-xs font-bold text-zinc-700'>
    <SortableHeader
      field='favorite'
      currentSortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
    >
      <div className='flex items-center gap-1'>
        <Star size={12} />
        <span className='text-xs'>おすすめ順</span>
      </div>
    </SortableHeader>

    <SortableHeader
      field='category'
      currentSortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
    >
      カテゴリー
    </SortableHeader>

    <SortableHeader
      field='usageCount'
      currentSortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      align='center'
    >
      使用数
    </SortableHeader>

    <span className='block text-center text-xs p-2'>操作</span>
  </div>
);

export default TemplateTableHeader;
