import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Search, Star } from 'lucide-react';
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
}) => (
  <div className='flex gap-2 flex-wrap items-center p-3 bg-gray-50 rounded-md border border-border border-gray-200'>
    {/* 検索 */}
    <div className='flex-1 min-w-[200px] relative'>
      <Search
        size={16}
        className='absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400'
      />
      <Input
        placeholder='テンプレートを検索...'
        value={searchQuery}
        onChange={e => onSearchQueryChange(e.target.value)}
        className='pl-10 w-full'
      />
    </div>

    {/* カテゴリーフィルター */}
    <div>
      <NativeSelect
        value={filterCategory}
        onChange={e =>
          onFilterCategoryChange(e.target.value as TemplateCategory | 'all')
        }
      >
        <NativeSelectOption value='all'>すべてのカテゴリー</NativeSelectOption>
        {TEMPLATE_CATEGORIES.map(cat => (
          <NativeSelectOption key={cat.id} value={cat.id}>
            {cat.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>

    {/* お気に入りフィルター */}
    <Button
      variant={filterFavorite ? 'default' : 'outline'}
      onClick={() => onFilterFavoriteChange(!filterFavorite)}
      className='flex items-center gap-2'
    >
      <Star size={16} fill={filterFavorite ? 'currentColor' : 'none'} />
      お気に入り
    </Button>
  </div>
);

export default TemplateSearchFilter;
