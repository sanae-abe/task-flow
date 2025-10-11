import { useState, useMemo, useCallback } from 'react';
import type { TaskTemplate, TemplateSortField, TemplateSortDirection, TemplateCategory } from '../types/template';
import { TEMPLATE_CATEGORIES } from '../components/TemplateManagement/TemplateCategorySelector';

interface UseTemplateFilteringReturn {
  // フィルター状態
  searchQuery: string;
  filterCategory: TemplateCategory | 'all';
  filterFavorite: boolean;
  sortField: TemplateSortField;
  sortDirection: TemplateSortDirection;

  // フィルター結果
  filteredTemplates: TaskTemplate[];

  // フィルター制御
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: TemplateCategory | 'all') => void;
  setFilterFavorite: (favorite: boolean) => void;
  setSortField: (field: TemplateSortField) => void;
  setSortDirection: (direction: TemplateSortDirection) => void;
  handleSort: (field: TemplateSortField) => void;
  clearFilters: () => void;
}

/**
 * テンプレートの検索・フィルター・ソート機能を提供するカスタムフック
 */
export const useTemplateFiltering = (templates: TaskTemplate[]): UseTemplateFilteringReturn => {
  // フィルター状態
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<TemplateCategory | 'all'>('all');
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [sortField, setSortField] = useState<TemplateSortField>('favorite');
  const [sortDirection, setSortDirection] = useState<TemplateSortDirection>('asc');

  // ソートハンドラー
  const handleSort = useCallback(
    (field: TemplateSortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField]
  );

  // フィルターリセット
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterFavorite(false);
    setSortField('favorite');
    setSortDirection('asc');
  }, []);

  // フィルタリング・ソートされたテンプレート
  const filteredTemplates = useMemo(() => {
    let filtered = [...templates];

    // 検索フィルター
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.taskTitle.toLowerCase().includes(query)
      );
    }

    // カテゴリーフィルター
    if (filterCategory !== 'all') {
      filtered = filtered.filter((template) => template.category === filterCategory);
    }

    // お気に入りフィルター
    if (filterFavorite) {
      filtered = filtered.filter((template) => template.isFavorite);
    }

    // ソート
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category': {
          const catA =
            TEMPLATE_CATEGORIES.find((cat) => cat.id === a.category)?.label || a.category;
          const catB =
            TEMPLATE_CATEGORIES.find((cat) => cat.id === b.category)?.label || b.category;
          comparison = catA.localeCompare(catB);
          break;
        }
        case 'usageCount':
          comparison = a.usageCount - b.usageCount;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'favorite':
          // お気に入り優先ソート: お気に入り → 使用回数順
          if (a.isFavorite && !b.isFavorite) {
            comparison = -1;
          } else if (!a.isFavorite && b.isFavorite) {
            comparison = 1;
          } else {
            comparison = b.usageCount - a.usageCount; // 使用回数の多い順
          }
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [templates, searchQuery, filterCategory, filterFavorite, sortField, sortDirection]);

  return {
    searchQuery,
    filterCategory,
    filterFavorite,
    sortField,
    sortDirection,
    filteredTemplates,
    setSearchQuery,
    setFilterCategory,
    setFilterFavorite,
    setSortField,
    setSortDirection,
    handleSort,
    clearFilters
  };
};