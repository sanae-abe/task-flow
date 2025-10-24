import React from 'react';
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
      <div className="text-center p-6 border border-dashed border-border rounded-md flex flex-col gap-2 justify-center items-center">
        <span className="text-muted-foreground">
          {hasActiveFilters
            ? '条件に一致するテンプレートが見つかりません'
            : 'まだテンプレートがありません'}
        </span>
        {hasActiveFilters && (
          <span className="text-xs text-muted-foreground">
            フィルター条件を変更して再度お試しください
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* テーブルヘッダー */}
      <TemplateTableHeader
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={onSort}
      />

      {/* テーブルボディ */}
      <div className="max-h-[500px] overflow-auto">
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