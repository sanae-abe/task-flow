import React from 'react';
import { Box, Text, TextInput, Select, Button } from '@primer/react';
import { SearchIcon, StarIcon, StarFillIcon } from '@primer/octicons-react';
import type { TemplateCategory } from '../../types/template';
import { TEMPLATE_CATEGORIES } from './TemplateCategorySelector';

interface TemplateSearchFilterProps {
  searchQuery: string;
  filterCategory: TemplateCategory | 'all';
  filterFavorite: boolean;
  onSearchQueryChange: (query: string) => void;
  onFilterCategoryChange: (category: TemplateCategory | 'all') => void;
  onFilterFavoriteChange: (favorite: boolean) => void;
  onClearFilters?: () => void;
}

/**
 * テンプレート検索・フィルターコンポーネント
 * 検索、カテゴリーフィルター、お気に入りフィルターを提供
 */
const TemplateSearchFilter: React.FC<TemplateSearchFilterProps> = ({
  searchQuery,
  filterCategory,
  filterFavorite,
  onSearchQueryChange,
  onFilterCategoryChange,
  onFilterFavoriteChange,
  onClearFilters
}) => {
  // フィルターが適用されているかチェック
  const hasActiveFilters = searchQuery.trim() !== '' || filterCategory !== 'all' || filterFavorite;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        alignItems: 'center',
        p: 3,
        bg: 'canvas.subtle',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'border.default'
      }}
    >
      {/* 検索 */}
      <Box sx={{ flex: 1, minWidth: '200px' }}>
        <TextInput
          leadingVisual={SearchIcon}
          placeholder="テンプレートを検索..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          sx={{ width: '100%' }}
        />
      </Box>

      {/* カテゴリーフィルター */}
      <Box>
        <Select
          value={filterCategory}
          onChange={(e) => onFilterCategoryChange(e.target.value as TemplateCategory | 'all')}
        >
          <Select.Option value="all">すべてのカテゴリー</Select.Option>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <Select.Option key={cat.id} value={cat.id}>
              {cat.label}
            </Select.Option>
          ))}
        </Select>
      </Box>

      {/* お気に入りフィルター */}
      <Button
        variant={filterFavorite ? 'primary' : 'default'}
        leadingVisual={filterFavorite ? StarFillIcon : StarIcon}
        onClick={() => onFilterFavoriteChange(!filterFavorite)}
      >
        お気に入り
      </Button>

      {/* フィルタークリア */}
      {hasActiveFilters && onClearFilters && (
        <Button
          variant="default"
          onClick={onClearFilters}
          sx={{ color: 'fg.muted' }}
        >
          フィルターをクリア
        </Button>
      )}

      {/* フィルター状態表示 */}
      {hasActiveFilters && (
        <Text sx={{ fontSize: 0, color: 'fg.muted', ml: 'auto' }}>
          {[
            searchQuery.trim() && `検索: "${searchQuery}"`,
            filterCategory !== 'all' && `カテゴリー: ${TEMPLATE_CATEGORIES.find(cat => cat.id === filterCategory)?.label}`,
            filterFavorite && 'お気に入りのみ'
          ].filter(Boolean).join(' | ')}
        </Text>
      )}
    </Box>
  );
};

export default TemplateSearchFilter;