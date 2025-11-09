/**
 * Template Management Data Table Component
 *
 * shadcn/ui data-table ベースのテンプレート管理テーブル
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import { Star, Edit, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type {
  TaskTemplate,
  TemplateSortField,
  TemplateSortDirection,
} from '../../../types/template';
import IconButton from '../../shared/IconButton';

interface TemplateDataTableProps {
  templates: TaskTemplate[];
  sortField: TemplateSortField;
  sortDirection: TemplateSortDirection;
  onSort: (field: TemplateSortField) => void;
  onEdit: (template: TaskTemplate) => void;
  onDelete: (template: TaskTemplate) => void;
  onToggleFavorite: (template: TaskTemplate) => void;
  hasActiveFilters: boolean;
}

export const TemplateDataTable: React.FC<TemplateDataTableProps> = ({
  templates,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  onToggleFavorite,
  hasActiveFilters,
}) => {
  const { t } = useTranslation();

  const columns: ColumnDef<TaskTemplate>[] = [
    {
      accessorKey: 'favorite',
      header: '★',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onToggleFavorite(template)}
            className='h-8 w-8 p-0'
            title={
              template.isFavorite
                ? t('template.removeFromFavorites')
                : t('template.addToFavorites')
            }
          >
            <Star
              className={`h-4 w-4 ${template.isFavorite ? 'fill-yellow-400 text-yellow-500' : 'text-zinc-400'}`}
              fill={template.isFavorite ? 'currentColor' : 'none'}
            />
          </Button>
        );
      },
    },
    {
      accessorKey: 'name',
      header: t('template.templateName'),
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className='flex flex-col'>
            <span className='font-medium text-foreground'>{template.name}</span>
            {template.description && (
              <span className='text-xs text-zinc-700 line-clamp-1'>
                {template.description}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: t('template.category'),
      cell: ({ row }) => {
        const category = row.getValue('category') as string;
        const categoryKey = `template.categories.${category}` as const;
        return (
          <span className='text-sm text-zinc-700'>
            {t(categoryKey, { defaultValue: category })}
          </span>
        );
      },
    },
    {
      accessorKey: 'usageCount',
      header: t('template.usageCount'),
      cell: ({ row }) => {
        const count = row.getValue('usageCount') as number;
        return (
          <div className='text-center'>
            <span className='text-sm'>
              {t('template.timesUsed', { count })}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className='flex items-center justify-center gap-1'>
            <IconButton
              icon={Edit}
              size='icon'
              ariaLabel={t('template.editTemplateAria', {
                name: template.name,
              })}
              onClick={() => onEdit(template)}
            />
            <IconButton
              icon={Trash2}
              size='icon'
              ariaLabel={t('template.deleteTemplateAria', {
                name: template.name,
              })}
              onClick={() => onDelete(template)}
            />
          </div>
        );
      },
    },
  ];

  // 初期ソート状態を作成
  const initialSorting: SortingState =
    sortField && sortDirection
      ? [{ id: sortField, desc: sortDirection === 'desc' }]
      : [];

  // ソート変更ハンドラー
  const handleSortingChange = (sorting: SortingState) => {
    if (onSort && sorting.length > 0) {
      const sort = sorting[0];
      if (sort) {
        onSort(sort.id as TemplateSortField);
      }
    }
  };

  const emptyMessage = hasActiveFilters
    ? t('template.noMatchingTemplates')
    : t('template.noTemplates');

  return (
    <DataTable
      columns={columns}
      data={templates}
      initialSorting={initialSorting}
      onSortingChange={handleSortingChange}
      emptyMessage={emptyMessage}
      className='border-border max-h-[500px] overflow-auto'
    />
  );
};
