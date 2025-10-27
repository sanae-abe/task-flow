import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Edit, Trash2 } from 'lucide-react';

import type { TaskTemplate } from '../../types/template';
import { TEMPLATE_CATEGORIES } from './TemplateCategorySelector';
import LabelChip from '../LabelChip';
import IconButton from "../shared/IconButton";

interface TemplateCardProps {
  template: TaskTemplate;
  onSelect?: (template: TaskTemplate) => void;
  onEdit?: (template: TaskTemplate) => void;
  onDelete?: (template: TaskTemplate) => void;
  onToggleFavorite?: (template: TaskTemplate) => void;
  showActions?: boolean;
  compact?: boolean;
}

/**
 * テンプレートカードコンポーネント
 * テンプレート選択や管理で使用するカード表示
 */
const TemplateCard: React.FC<TemplateCardProps> = memo(({
  template,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
  showActions = true,
  compact = false
}) => {
  // カテゴリー情報取得
  const categoryInfo = TEMPLATE_CATEGORIES.find((cat) => cat.id === template.category);

  // 優先度表示
  const getPriorityLabel = (priority: string | undefined) => {
    if (!priority) {
      return '選択なし';
    }
    const labels: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      critical: '緊急'
    };
    return labels[priority] || priority;
  };

  const getPriorityColorClass = (priority: string | undefined) => {
    if (!priority) {
      return 'text-gray-500';
    }
    const colors: Record<string, string> = {
      low: 'text-gray-500',
      medium: 'text-yellow-600',
      high: 'text-red-600',
      critical: 'text-red-600'
    };
    return colors[priority] || 'text-foreground';
  };

  // お気に入りトグル
  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onToggleFavorite) {
        onToggleFavorite(template);
      }
    },
    [onToggleFavorite, template]
  );

  // 編集ボタン
  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onEdit) {
        onEdit(template);
      }
    },
    [onEdit, template]
  );

  // 削除ボタン
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onDelete) {
        onDelete(template);
      }
    },
    [onDelete, template]
  );

  // カード選択
  const handleSelect = useCallback(() => {
    if (onSelect) {
      onSelect(template);
    }
  }, [onSelect, template]);

  return (
    <div
      className={`
        ${compact ? 'p-2' : 'p-3'}
        border border-border border-gray-200 rounded-lg bg-white
        ${onSelect ? 'cursor-pointer hover:border-blue-600 hover:bg-gray-50' : 'cursor-default'}
        transition-all duration-200 ease-in-out
        hover:[&_.template-actions]:opacity-100
      `}
      onClick={onSelect ? handleSelect : undefined}
    >
      {/* ヘッダー部分 */}
      <div className={`flex items-start justify-between gap-2 mb-${compact ? '1' : '2'}`}>
        <div className="flex-1 min-w-0">
          {/* テンプレート名 */}
          <div className="flex items-center gap-1 mb-1">
            {template.isFavorite && (
              <div className="text-warning">
                <Star size={14} fill="currentColor" />
              </div>
            )}
            <h3 className={`
              ${compact ? 'text-sm' : 'text-base'}
              font-bold truncate
            `}>
              {template.name}
            </h3>
          </div>

          {/* カテゴリーと使用回数 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded-md">
              {categoryInfo?.label || template.category}
            </span>
            {template.usageCount > 0 && (
              <span className="text-xs text-gray-600">
                使用回数: {template.usageCount}
              </span>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        {showActions && (
          <div
            className={`template-actions flex gap-1 transition-opacity duration-200 ease-in-out ${
              compact ? 'opacity-100' : 'opacity-70'
            }`}
          >
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                aria-label={template.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                className={`p-1 h-auto min-w-0 ${
                  template.isFavorite ? 'text-warning' : 'text-gray-500'
                }`}
              >
                {template.isFavorite ? <Star size={16} fill="currentColor" /> : <Star size={16} />}
              </Button>
            )}
            {onEdit && (
              <IconButton
                icon={Edit}
                size="icon"
                onClick={handleEdit}
                ariaLabel={`テンプレート「${template.name}」を編集`}
                className="p-1"
              />
            )}
            {onDelete && (
              <IconButton
                icon={Trash2}
                size="icon"
                onClick={handleDelete}
                ariaLabel={`テンプレート「${template.name}」を削除`}
                className="p-1"
              />
            )}
          </div>
        )}
      </div>

      {/* 説明 */}
      {!compact && template.description && (
        <div className="mb-2">
          <p className="text-sm text-gray-600 line-clamp-2">
            {template.description}
          </p>
        </div>
      )}

      {/* タスク情報 */}
      {!compact && (
        <div className="pt-2 border-t border-border flex flex-col gap-1">
          {/* タスクタイトル */}
          <h4 className="text-sm font-semibold text-foreground truncate">
            {template.taskTitle}
          </h4>

          {/* タスク詳細情報 */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 優先度 */}
            <span className={`text-xs ${getPriorityColorClass(template.priority)}`}>
              優先度: {getPriorityLabel(template.priority)}
            </span>

            {/* ラベル */}
            {template.labels.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {template.labels.slice(0, 3).map((label) => (
                  <LabelChip key={label.id} label={label} />
                ))}
                {template.labels.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{template.labels.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* 繰り返し設定 */}
            {template.recurrence?.enabled && (
              <span className="text-xs text-primary px-1 py-0.5 bg-blue-50 rounded">
                繰り返し
              </span>
            )}
          </div>
        </div>
      )}

      {/* 選択ボタン（コンパクトモード） */}
      {compact && onSelect && (
        <div className="mt-2">
          <Button variant="default" size="sm" className="w-full">
            このテンプレートを使用
          </Button>
        </div>
      )}
    </div>
  );
});

TemplateCard.displayName = 'TemplateCard';

export default TemplateCard;
