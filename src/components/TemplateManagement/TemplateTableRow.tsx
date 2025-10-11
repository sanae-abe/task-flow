import React from 'react';
import { Box, Text, IconButton } from '@primer/react';
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
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 120px 80px 100px',
        gap: 2,
        p: 2,
        alignItems: 'center',
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: 'border.muted',
        '&:hover': {
          bg: 'canvas.subtle',
          '& .template-actions': {
            opacity: 1
          }
        }
      }}
    >
      {/* テンプレート名 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {template.isFavorite && (
            <Box sx={{ color: 'attention.fg' }}>
              <StarFillIcon size={14} />
            </Box>
          )}
          <Text sx={{ fontWeight: 'semibold', fontSize: 1 }}>
            {template.name}
          </Text>
        </Box>
        {template.description && (
          <Text
            sx={{
              fontSize: 0,
              color: 'fg.muted',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {template.description}
          </Text>
        )}
      </Box>

      {/* カテゴリー */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Text
          sx={{
            fontSize: 0,
            color: 'fg.muted',
            display: 'inline-block'
          }}
        >
          {categoryInfo?.label || template.category}
        </Text>
      </Box>

      {/* 使用数 */}
      <Box sx={{ textAlign: 'center' }}>
        <Text
          sx={{
            fontSize: 1,
            fontWeight: template.usageCount > 0 ? 'bold' : 'normal',
            color: template.usageCount > 0 ? 'fg.default' : 'fg.muted'
          }}
        >
          {template.usageCount}
        </Text>
      </Box>

      {/* アクションボタン */}
      <Box
        className="template-actions"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          opacity: 0.7,
          transition: 'opacity 0.2s ease'
        }}
      >
        <IconButton
          icon={template.isFavorite ? StarFillIcon : StarIcon}
          aria-label={template.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
          size="small"
          variant="invisible"
          onClick={() => onToggleFavorite(template)}
          sx={{
            color: template.isFavorite ? 'attention.fg' : 'fg.muted'
          }}
        />
        <IconButton
          icon={PencilIcon}
          aria-label={`テンプレート「${template.name}」を編集`}
          size="small"
          variant="invisible"
          onClick={() => onEdit(template)}
        />
        <IconButton
          icon={TrashIcon}
          aria-label={`テンプレート「${template.name}」を削除`}
          size="small"
          variant="invisible"
          onClick={() => onDelete(template)}
        />
      </Box>
    </Box>
  );
};

export default TemplateTableRow;