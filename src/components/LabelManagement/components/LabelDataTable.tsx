/**
 * Label Management Data Table Component
 *
 * shadcn/ui data-table ベースのラベル管理テーブル
 */

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import type { LabelWithInfo } from "../../../types/labelManagement";
import IconButton from "../../shared/IconButton";

interface LabelDataTableProps {
  labels: LabelWithInfo[];
  onEdit: (label: LabelWithInfo) => void;
  onDelete: (label: LabelWithInfo) => void;
}

export const LabelDataTable: React.FC<LabelDataTableProps> = ({
  labels,
  onEdit,
  onDelete,
}) => {
  const columns: ColumnDef<LabelWithInfo>[] = [
    {
      accessorKey: "name",
      header: "ラベル",
      cell: ({ row }) => {
        const label = row.original;
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: label.color }}
            />
            <span className="font-medium">{label.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "boardName",
      header: "所属ボード",
      cell: ({ row }) => {
        const boardName = row.getValue("boardName") as string;
        return (
          <>
            {boardName || "不明"}
          </>
        );
      },
    },
    {
      accessorKey: "usageCount",
      header: "使用数",
      cell: ({ row }) => {
        const count = row.getValue("usageCount") as number;
        return (
          <div className="text-center">
            <span className={`text-sm ${count > 0 ? 'font-bold text-foreground' : 'font-normal text-muted-foreground'}`}>
              {count}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const label = row.original;
        return (
          <div className="flex items-center justify-center gap-1">
            <IconButton
              icon={Edit}
              size="icon"
              onClick={() => onEdit(label)}
              className="h-8 w-8 p-0"
              ariaLabel="編集"
            />
            <IconButton
              icon={Trash2}
              size="icon"
              onClick={() => onDelete(label)}
              className="h-8 w-8 p-0"
              ariaLabel="削除"
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={labels}
      emptyMessage="ラベルがありません"
      className="border-border"
    />
  );
};