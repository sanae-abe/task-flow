import React from 'react';
import { Box, Text, Button } from '@primer/react';
import { ChevronUpIcon, ChevronDownIcon, ThumbsupIcon } from '@primer/octicons-react';
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
    <Button
      variant="invisible"
      onClick={() => onSort(field)}
      aria-label={`${children}でソート`}
      sx={{
        width: '100%',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        p: 0,
        color: 'fg.muted',
        fontSize: 0,
        fontWeight: 'bold',
        '&:hover': {
          color: 'fg.default'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Text sx={{ fontSize: 0, fontWeight: 'bold' }}>
          {children}
        </Text>
        <Box sx={{ opacity: isActive ? 1 : 0.3 }}>
          {isActive && sortDirection === 'asc' ? (
            <ChevronUpIcon size={12} />
          ) : (
            <ChevronDownIcon size={12} />
          )}
        </Box>
      </Box>
    </Button>
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
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 120px 80px 100px',
        gap: 2,
        p: 2,
        bg: 'canvas.subtle',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        fontSize: 1,
        fontWeight: 'bold',
        color: 'fg.muted'
      }}
    >
      <SortableHeader
        field="favorite"
        currentSortField={sortField}
        sortDirection={sortDirection}
        onSort={onSort}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ThumbsupIcon size={12} />
          <Text sx={{ fontSize: 0 }}>おすすめ順</Text>
        </Box>
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

      <Text sx={{ textAlign: 'center', fontSize: 0 }}>操作</Text>
    </Box>
  );
};

export default TemplateTableHeader;