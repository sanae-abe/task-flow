import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { StarIcon, StarFillIcon, PencilIcon, TrashIcon } from '@primer/octicons-react';

import type { TaskTemplate } from '../../types/template';
import { TEMPLATE_CATEGORIES } from './TemplateCategorySelector';
import LabelChip from '../LabelChip';

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
    return colors[priority] || 'text-gray-900';
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
        border border-gray-200 rounded-lg bg-white
        ${onSelect ? 'cursor-pointer hover:border-blue-600 hover:bg-gray-50' : 'cursor-default'}
        transition-all duration-200 ease-in-out
        hover:[&_.template-actions]:opacity-100
      `}
      onClick={onSelect ? handleSelect : undefined}
    >
      {/* ヘッダー部分 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: "8px",
        marginBottom: compact ? "4px" : "8px"
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* テンプレート名 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: "4px", marginBottom: "4px" }}>
            {template.isFavorite && (
              <div style={{ color: 'var(--fgColor-attention)' }}>
                <StarFillIcon size={14} />
              </div>
            )}
            <h3 className={`
              ${compact ? 'text-sm' : 'text-base'}
              font-bold text-gray-900 truncate
            `}>
              {template.name}
            </h3>
          </div>

          {/* カテゴリーと使用回数 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: "8px", flexWrap: 'wrap' }}>
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
            className="template-actions"
            style={{
              display: 'flex',
              gap: "4px",
              opacity: compact ? 1 : 0.7,
              transition: 'opacity 0.2s ease'
            }}
          >
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                aria-label={template.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                className={`p-1 h-auto min-w-0 ${
                  template.isFavorite ? 'text-yellow-600' : 'text-gray-500'
                }`}
              >
                {template.isFavorite ? <StarFillIcon size={16} /> : <StarIcon size={16} />}
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                aria-label={`テンプレート「${template.name}」を編集`}
                className="p-1 h-auto min-w-0 text-gray-500 hover:text-gray-700"
              >
                <PencilIcon size={16} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                aria-label={`テンプレート「${template.name}」を削除`}
                className="p-1 h-auto min-w-0 text-gray-500 hover:text-red-600"
              >
                <TrashIcon size={16} />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 説明 */}
      {!compact && template.description && (
        <div style={{ marginBottom: "8px" }}>
          <p className="text-sm text-gray-600 line-clamp-2">
            {template.description}
          </p>
        </div>
      )}

      {/* タスク情報 */}
      {!compact && (
        <div style={{
          paddingTop: "8px",
          borderTop: '1px solid',
          borderColor: 'var(--borderColor-muted)',
          display: 'flex',
          flexDirection: 'column',
          gap: "4px"
        }}>
          {/* タスクタイトル */}
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {template.taskTitle}
          </h4>

          {/* タスク詳細情報 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: "8px", flexWrap: 'wrap' }}>
            {/* 優先度 */}
            <span className={`text-xs ${getPriorityColorClass(template.priority)}`}>
              優先度: {getPriorityLabel(template.priority)}
            </span>

            {/* ラベル */}
            {template.labels.length > 0 && (
              <div style={{ display: 'flex', gap: "4px", flexWrap: 'wrap' }}>
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
              <span className="text-xs text-blue-600 px-1 py-0.5 bg-blue-50 rounded">
                繰り返し
              </span>
            )}
          </div>
        </div>
      )}

      {/* 選択ボタン（コンパクトモード） */}
      {compact && onSelect && (
        <div style={{ marginTop: "8px" }}>
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
