import React from 'react';
import { TextInput, Select, Button } from '@primer/react';
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
  onFilterFavoriteChange
}) =>
  <div
    style={{
      display: 'flex',
      gap: "8px",
      flexWrap: 'wrap',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: 'var(--bgColor-muted)',
      borderRadius: 'var(--borderRadius-medium)',
      border: '1px solid',
      borderColor: 'var(--borderColor-default)'
    }}
  >
    {/* 検索 */}
    <div style={{ flex: 1, minWidth: '200px' }}>
      <TextInput
        leadingVisual={SearchIcon}
        placeholder="テンプレートを検索..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        sx={{ width: '100%' }}
      />
    </div>

    {/* カテゴリーフィルター */}
    <div>
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
    </div>

    {/* お気に入りフィルター */}
    <Button
      variant={filterFavorite ? 'primary' : 'default'}
      leadingVisual={filterFavorite ? StarFillIcon : StarIcon}
      onClick={() => onFilterFavoriteChange(!filterFavorite)}
    >
      お気に入り
    </Button>
  </div>

export default TemplateSearchFilter;