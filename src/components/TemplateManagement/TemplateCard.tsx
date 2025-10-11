import React, { memo, useCallback } from 'react';
import { Box, Text, Button, IconButton } from '@primer/react';
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

  const getPriorityColor = (priority: string | undefined) => {
    if (!priority) {
      return 'fg.muted';
    }
    const colors: Record<string, string> = {
      low: 'fg.muted',
      medium: 'attention.fg',
      high: 'danger.fg',
      critical: 'danger.fg'
    };
    return colors[priority] || 'fg.default';
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
    <Box
      sx={{
        p: compact ? 2 : 3,
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        bg: 'canvas.default',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: onSelect ? 'accent.fg' : 'border.default',
          bg: onSelect ? 'canvas.subtle' : 'canvas.default',
          '& .template-actions': {
            opacity: 1
          }
        }
      }}
      onClick={onSelect ? handleSelect : undefined}
    >
      {/* ヘッダー部分 */}
      <Box sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
        mb: compact ? 1 : 2
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* テンプレート名 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {template.isFavorite && (
              <Box sx={{ color: 'attention.fg' }}>
                <StarFillIcon size={14} />
              </Box>
            )}
            <Text sx={{
              fontSize: compact ? 1 : 2,
              fontWeight: 'bold',
              color: 'fg.default',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {template.name}
            </Text>
          </Box>

          {/* カテゴリーと使用回数 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Text sx={{
              fontSize: 0,
              color: 'fg.muted',
              px: 2,
              py: 1,
              bg: 'neutral.muted',
              borderRadius: 2
            }}>
              {categoryInfo?.label || template.category}
            </Text>
            {template.usageCount > 0 && (
              <Text sx={{
                fontSize: 0,
                color: 'fg.muted'
              }}>
                使用回数: {template.usageCount}
              </Text>
            )}
          </Box>
        </Box>

        {/* アクションボタン */}
        {showActions && (
          <Box
            className="template-actions"
            sx={{
              display: 'flex',
              gap: 1,
              opacity: compact ? 1 : 0.7,
              transition: 'opacity 0.2s ease'
            }}
          >
            {onToggleFavorite && (
              <IconButton
                icon={template.isFavorite ? StarFillIcon : StarIcon}
                aria-label={template.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                size="small"
                variant="invisible"
                onClick={handleToggleFavorite}
                sx={{
                  color: template.isFavorite ? 'attention.fg' : 'fg.muted'
                }}
              />
            )}
            {onEdit && (
              <IconButton
                icon={PencilIcon}
                aria-label={`テンプレート「${template.name}」を編集`}
                size="small"
                variant="invisible"
                onClick={handleEdit}
              />
            )}
            {onDelete && (
              <IconButton
                icon={TrashIcon}
                aria-label={`テンプレート「${template.name}」を削除`}
                size="small"
                variant="invisible"
                onClick={handleDelete}
              />
            )}
          </Box>
        )}
      </Box>

      {/* 説明 */}
      {!compact && template.description && (
        <Box sx={{ mb: 2 }}>
          <Text sx={{
            fontSize: 1,
            color: 'fg.muted',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {template.description}
          </Text>
        </Box>
      )}

      {/* タスク情報 */}
      {!compact && (
        <Box sx={{
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'border.muted',
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          {/* タスクタイトル */}
          <Text sx={{
            fontSize: 1,
            fontWeight: 'semibold',
            color: 'fg.default',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {template.taskTitle}
          </Text>

          {/* タスク詳細情報 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {/* 優先度 */}
            <Text sx={{
              fontSize: 0,
              color: getPriorityColor(template.priority)
            }}>
              優先度: {getPriorityLabel(template.priority)}
            </Text>

            {/* ラベル */}
            {template.labels.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {template.labels.slice(0, 3).map((label) => (
                  <LabelChip key={label.id} label={label} />
                ))}
                {template.labels.length > 3 && (
                  <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                    +{template.labels.length - 3}
                  </Text>
                )}
              </Box>
            )}

            {/* 繰り返し設定 */}
            {template.recurrence?.enabled && (
              <Text sx={{
                fontSize: 0,
                color: 'accent.fg',
                px: 1,
                py: 0.5,
                bg: 'accent.subtle',
                borderRadius: 1
              }}>
                繰り返し
              </Text>
            )}
          </Box>
        </Box>
      )}

      {/* 選択ボタン（コンパクトモード） */}
      {compact && onSelect && (
        <Box sx={{ mt: 2 }}>
          <Button variant="primary" size="small" sx={{ width: '100%' }}>
            このテンプレートを使用
          </Button>
        </Box>
      )}
    </Box>
  );
});

TemplateCard.displayName = 'TemplateCard';

export default TemplateCard;
