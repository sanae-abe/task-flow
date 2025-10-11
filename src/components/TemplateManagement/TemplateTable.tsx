import React from 'react';
import { Box, Text } from '@primer/react';
import type { TaskTemplate, TemplateSortField, TemplateSortDirection } from '../../types/template';
import TemplateTableHeader from './TemplateTableHeader';
import TemplateTableRow from './TemplateTableRow';

interface TemplateTableProps {
  templates: TaskTemplate[];
  sortField: TemplateSortField;
  sortDirection: TemplateSortDirection;
  onSort: (field: TemplateSortField) => void;
  onEdit: (template: TaskTemplate) => void;
  onDelete: (template: TaskTemplate) => void;
  onToggleFavorite: (template: TaskTemplate) => void;
  hasActiveFilters: boolean;
}

/**
 * テンプレートテーブルコンポーネント
 * ヘッダーとボディを含むメインテーブル表示
 */
const TemplateTable: React.FC<TemplateTableProps> = ({
  templates,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  onToggleFavorite,
  hasActiveFilters
}) => {
  // 空状態の表示
  if (templates.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 6,
          border: '1px dashed',
          borderColor: 'border.muted',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Text sx={{ color: 'fg.muted' }}>
          {hasActiveFilters
            ? '条件に一致するテンプレートが見つかりません'
            : 'まだテンプレートがありません'}
        </Text>
        {hasActiveFilters && (
          <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
            フィルター条件を変更して再度お試しください
          </Text>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* テーブルヘッダー */}
      <TemplateTableHeader
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={onSort}
      />

      {/* テーブルボディ */}
      <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
        {templates.map((template, index) => (
          <TemplateTableRow
            key={template.id}
            template={template}
            isLast={index === templates.length - 1}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TemplateTable;