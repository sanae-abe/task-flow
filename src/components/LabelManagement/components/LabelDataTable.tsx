/**
 * Label Management Data Table Component
 *
 * shadcn/ui data-table ベースのラベル管理テーブル
 */

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { LabelWithInfo } from "../../../types/labelManagement";

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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(label)}
              className="h-8 w-8 p-0"
              title="編集"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(label)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="削除"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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