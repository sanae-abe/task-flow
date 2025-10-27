/**
 * Recycle Bin Data Table Component
 *
 * shadcn/ui data-table ベースのごみ箱テーブル
 */

import React from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  FolderKanban,
  List,
  Columns,
  Clock
} from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { RecycleBinItemActions } from "./RecycleBinItemActions";
import type { RecycleBinItemWithMeta } from "../../../types/recycleBin";
import type { RecycleBinSettings } from "../../../types/settings";
import type { SortField } from "../../../hooks/useRecycleBinSort";

interface RecycleBinDataTableProps {
  items: RecycleBinItemWithMeta[];
  recycleBinSettings: RecycleBinSettings;
  getItemLoadingState: (item: RecycleBinItemWithMeta) => { isLoading: boolean; loadingText: string };
  onRestore: (item: RecycleBinItemWithMeta) => void;
  onDelete: (item: RecycleBinItemWithMeta) => void;
  onShowDetail: (item: RecycleBinItemWithMeta) => void;
  sortField?: SortField;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: SortField) => void;
}

export const RecycleBinDataTable: React.FC<RecycleBinDataTableProps> = ({
  items,
  recycleBinSettings,
  getItemLoadingState,
  onRestore,
  onDelete,
  onShowDetail,
  sortField,
  sortDirection,
  onSort,
}) => {
  const columns: ColumnDef<RecycleBinItemWithMeta>[] = [
    {
      accessorKey: "type",
      header: "種別",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1">
            {item.type === 'board' ? (
              <FolderKanban size={16} />
            ) : item.type === 'column' ? (
              <Columns size={16} />
            ) : (
              <List size={16} />
            )}
            <span
              className={`text-sm px-2 py-1 rounded text-foreground whitespace-nowrap ${
                item.type === 'board'
                  ? 'bg-yellow-100'
                  : item.type === 'column'
                  ? 'bg-green-100'
                  : 'bg-blue-100'
              }`}
            >
              {item.type === 'board' ? 'ボード' : item.type === 'column' ? 'カラム' : 'タスク'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "タイトル",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <>
            {item.title}
          </>
        );
      },
    },
    {
      accessorKey: "timeUntilDeletion",
      header: "削除予定",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-center gap-1 text-sm whitespace-nowrap">
            {item.timeUntilDeletion ? (
              <>
                <Clock size={14} />
                <span
                  className={`${
                    recycleBinSettings.retentionDays === null ? 'text-gray-500' : 'text-foreground'
                  }`}
                >
                  {item.timeUntilDeletion}
                </span>
              </>
            ) : (
              <span className="text-gray-500 text-center">
                未設定
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-center">
            <RecycleBinItemActions
              item={item}
              isLoading={getItemLoadingState(item).isLoading}
              loadingText={getItemLoadingState(item).loadingText}
              onRestore={onRestore}
              onDelete={onDelete}
              onShowDetail={onShowDetail}
            />
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
        onSort(sort.id as SortField);
      }
    }
  };

  return (
    <DataTable
      columns={columns}
      data={items}
      initialSorting={initialSorting}
      onSortingChange={handleSortingChange}
      emptyMessage="ゴミ箱にアイテムはありません"
      className="border-border max-h-[500px] overflow-auto"
    />
  );
};