import React from 'react';
import { Text } from '@primer/react';
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
      <div
        style={{
          textAlign: 'center',
          padding: '24px',
          border: '1px dashed',
          borderColor: 'var(--borderColor-muted)',
          borderRadius: 'var(--borderRadius-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: "8px",
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
      </div>
    );
  }

  return (
    <div
      style={{
        border: '1px solid',
        borderColor: "var(--borderColor-default)",
        borderRadius: "var(--borderRadius-medium)",
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
      <div style={{ maxHeight: '500px', overflow: 'auto' }}>
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
      </div>
    </div>
  );
};

export default TemplateTable;