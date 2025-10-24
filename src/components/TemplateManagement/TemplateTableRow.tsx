import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StarIcon, StarFillIcon, PencilIcon, TrashIcon } from '@primer/octicons-react';
import type { TaskTemplate } from '../../types/template';
import { TEMPLATE_CATEGORIES } from './TemplateCategorySelector';

interface TemplateTableRowProps {
  template: TaskTemplate;
  isLast: boolean;
  onEdit: (template: TaskTemplate) => void;
  onDelete: (template: TaskTemplate) => void;
  onToggleFavorite: (template: TaskTemplate) => void;
}

/**
 * テンプレートテーブルの行コンポーネント
 */
const TemplateTableRow: React.FC<TemplateTableRowProps> = ({
  template,
  isLast,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  const categoryInfo = TEMPLATE_CATEGORIES.find((cat) => cat.id === template.category);

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_100px_80px_100px] gap-2 p-2 items-center",
        "hover:bg-gray-50 hover:[&_.template-actions]:opacity-100",
        !isLast && "border-b border-gray-200"
      )}
    >
      {/* テンプレート名 */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          {template.isFavorite && (
            <div className="text-yellow-700">
              <StarFillIcon size={14} />
            </div>
          )}
          <span className="font-semibold text-sm">
            {template.name}
          </span>
        </div>
        {template.description && (
          <span className="text-xs text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
            {template.description}
          </span>
        )}
      </div>

      {/* カテゴリー */}
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-600 inline-block">
          {categoryInfo?.label || template.category}
        </span>
      </div>

      {/* 使用数 */}
      <div className="text-center">
        <span
          className={cn(
            "text-sm",
            template.usageCount > 0 ? "font-bold text-gray-900" : "font-normal text-gray-600"
          )}
        >
          {template.usageCount}
        </span>
      </div>

      {/* アクションボタン */}
      <div className="template-actions flex justify-center gap-1 opacity-70 transition-opacity duration-200">
        <Button
          variant="ghost"
          size="sm"
          aria-label={template.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
          onClick={() => onToggleFavorite(template)}
          className={cn(
            "p-1 h-auto min-w-0",
            template.isFavorite ? "text-yellow-700" : "text-gray-600"
          )}
        >
          {template.isFavorite ? <StarFillIcon size={16} /> : <StarIcon size={16} />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`テンプレート「${template.name}」を編集`}
          onClick={() => onEdit(template)}
          className="p-1 h-auto min-w-0"
        >
          <PencilIcon size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`テンプレート「${template.name}」を削除`}
          onClick={() => onDelete(template)}
          className="p-1 h-auto min-w-0"
        >
          <TrashIcon size={16} />
        </Button>
      </div>
    </div>
  );
};

export default TemplateTableRow;