import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Star, Edit, Trash2 } from 'lucide-react';
import type { TaskTemplate } from '../../types/template';
import { TEMPLATE_CATEGORIES } from './TemplateCategorySelector';
import IconButton from '../shared/IconButton';

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
        !isLast && "border-b border-border border-gray-200"
      )}
    >
      {/* テンプレート名 */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          {template.isFavorite && (
            <div className="text-warning">
              <Star size={14} fill="currentColor" />
            </div>
          )}
          <span className="font-semibold text-sm">
            {template.name}
          </span>
        </div>
        {template.description && (
          <span className="text-xs text-zinc-700 overflow-hidden text-ellipsis whitespace-nowrap">
            {template.description}
          </span>
        )}
      </div>

      {/* カテゴリー */}
      <div className="flex items-center gap-1">
        <span className="text-sm text-zinc-700 inline-block">
          {categoryInfo?.label || template.category}
        </span>
      </div>

      {/* 使用数 */}
      <div className="text-center">
        <span
          className={cn(
            "text-sm",
            template.usageCount > 0 ? "font-bold text-foreground" : "font-normal text-zinc-700"
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
            template.isFavorite ? "text-warning" : "text-zinc-700"
          )}
        >
          <Star size={16} fill={template.isFavorite ? "currentColor" : "none"} />
        </Button>
        <IconButton
          icon={Edit}
          size="icon"
          ariaLabel={`テンプレート「${template.name}」を編集`}
          onClick={() => onEdit(template)}
          className="p-1 h-auto min-w-0"
        />
        <IconButton
          icon={Trash2}
          size="icon"
          ariaLabel={`テンプレート「${template.name}」を削除`}
          onClick={() => onDelete(template)}
          className="p-1 h-auto min-w-0"
        />
      </div>
    </div>
  );
};

export default TemplateTableRow;