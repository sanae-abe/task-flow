/**
 * Template Management Data Table Component
 *
 * shadcn/ui data-table ベースのテンプレート管理テーブル
 */

import React from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { Star, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { TaskTemplate, TemplateSortField, TemplateSortDirection } from "../../../types/template";

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
  const columns: ColumnDef<TaskTemplate>[] = [
    {
      accessorKey: "favorite",
      header: "★",
      cell: ({ row }) => {
        const template = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(template)}
            className="h-8 w-8 p-0"
            title={template.isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
          >
            <Star
              className={`h-4 w-4 ${template.isFavorite ? 'fill-yellow-400 text-yellow-500' : 'text-gray-400'}`}
              fill={template.isFavorite ? "currentColor" : "none"}
            />
          </Button>
        );
      },
    },
    {
      accessorKey: "name",
      header: "テンプレート名",
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{template.name}</span>
            {template.description && (
              <span className="text-xs text-muted-foreground line-clamp-1">
                {template.description}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "カテゴリー",
      cell: ({ row }) => {
        const categoryMap = {
          work: "仕事",
          personal: "個人",
          project: "プロジェクト",
          meeting: "会議",
          routine: "ルーティン",
          other: "その他"
        };
        const category = row.getValue("category") as string;
        return (
          <span className="text-sm text-muted-foreground">
            {categoryMap[category as keyof typeof categoryMap] || category}
          </span>
        );
      },
    },
    {
      accessorKey: "usageCount",
      header: "使用回数",
      cell: ({ row }) => {
        const count = row.getValue("usageCount") as number;
        return (
          <div className="text-center">
            <span className="text-sm">
              {count}回
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(template)}
              className="h-8 w-8 p-0"
              title="編集"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(template)}
              className="h-8 w-8 p-0"
              title="削除"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // 初期ソート状態を作成
  const initialSorting: SortingState = sortField && sortDirection ? [
    { id: sortField, desc: sortDirection === 'desc' }
  ] : [];

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
    ? '条件に一致するテンプレートが見つかりません'
    : 'まだテンプレートがありません';

  return (
    <DataTable
      columns={columns}
      data={templates}
      initialSorting={initialSorting}
      onSortingChange={handleSortingChange}
      emptyMessage={emptyMessage}
      className="border-border max-h-[500px] overflow-auto"
    />
  );
};