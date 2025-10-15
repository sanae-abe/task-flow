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
        gridTemplateColumns: '1fr 100px 80px 100px',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: "4px" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: "4px" }}>
          {template.isFavorite && (
            <div style={{ color: 'var(--fgColor-attention)' }}>
              <StarFillIcon size={14} />
            </div>
          )}
          <Text sx={{ fontWeight: 'semibold', fontSize: 1 }}>
            {template.name}
          </Text>
        </div>
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
      </div>

      {/* カテゴリー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Text
          sx={{
            fontSize: 1,
            color: 'fg.muted',
            display: 'inline-block'
          }}
        >
          {categoryInfo?.label || template.category}
        </Text>
      </div>

      {/* 使用数 */}
      <div style={{ textAlign: 'center' }}>
        <Text
          sx={{
            fontSize: 1,
            fontWeight: template.usageCount > 0 ? 'bold' : 'normal',
            color: template.usageCount > 0 ? 'fg.default' : 'fg.muted'
          }}
        >
          {template.usageCount}
        </Text>
      </div>

      {/* アクションボタン */}
      <div
        className="template-actions"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '4px',
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
      </div>
    </Box>
  );
};

export default TemplateTableRow;