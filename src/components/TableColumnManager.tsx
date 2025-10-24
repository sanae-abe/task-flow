import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings,
  Trash2,
  GripVertical,
  Check,
} from "lucide-react";

import { useTableColumns } from "../contexts/TableColumnsContext";

const TableColumnManager: React.FC = () => {
  const {
    columns,
    columnOrder,
    toggleColumnVisibility,
    updateColumnWidth,
    reorderColumns,
    removeColumn,
    resetToDefaults,
  } = useTableColumns();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

  const handleWidthChange = useCallback(
    (columnId: string, newWidth: string) => {
      // 空文字列は許可
      if (newWidth === "") {
        updateColumnWidth(columnId, newWidth);
        return;
      }

      // pxを削除して数値のみを取得
      const numericValue = parseInt(newWidth.replace(/px$/, ""), 10);

      // 50px～1000pxの範囲内かチェック
      if (!isNaN(numericValue) && numericValue >= 50 && numericValue <= 1000) {
        // px単位で保存
        const formattedWidth = `${numericValue}px`;
        updateColumnWidth(columnId, formattedWidth);
      } else if (!isNaN(numericValue)) {
        // 範囲外の場合は最小値/最大値に調整
        const clampedValue = Math.max(50, Math.min(1000, numericValue));
        const formattedWidth = `${clampedValue}px`;
        updateColumnWidth(columnId, formattedWidth);
      }
    },
    [updateColumnWidth],
  );

  const isCustomColumn = useCallback(
    (columnId: string) => columnId.startsWith("custom-"),
    [],
  );

  // ドラッグ開始
  const handleDragStart = useCallback(
    (e: React.DragEvent, columnId: string) => {
      setDraggedColumnId(columnId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", columnId);
    },
    [],
  );

  // ドラッグオーバー
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  // ドロップ
  const handleDrop = useCallback(
    (e: React.DragEvent, targetColumnId: string) => {
      e.preventDefault();

      if (!draggedColumnId || draggedColumnId === targetColumnId) {
        setDraggedColumnId(null);
        return;
      }

      const currentOrder = [...columnOrder];
      const draggedIndex = currentOrder.indexOf(draggedColumnId);
      const targetIndex = currentOrder.indexOf(targetColumnId);

      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedColumnId(null);
        return;
      }

      // 配列の要素を移動
      currentOrder.splice(draggedIndex, 1);
      currentOrder.splice(targetIndex, 0, draggedColumnId);

      reorderColumns(currentOrder);
      setDraggedColumnId(null);
    },
    [draggedColumnId, columnOrder, reorderColumns],
  );

  // ドラッグ終了
  const handleDragEnd = useCallback(() => {
    setDraggedColumnId(null);
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="カラム詳細設定"
            className="p-1 h-auto min-w-0"
          >
            <Settings size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">表示カラム</div>
            {columns.map((column) => (
              <DropdownMenuItem
                key={column.id}
                onClick={() => toggleColumnVisibility(column.id)}
              >
                <div
                  className={`mr-2 ${
                    column.visible ? 'text-gray-900' : 'text-transparent'
                  }`}
                >
                  <Check size={16} />
                </div>
                {column.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
            <Settings size={16} className="mr-2" />
            詳細設定
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={resetToDefaults}>
            デフォルトに戻す
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 詳細設定ダイアログ */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カラム詳細設定</DialogTitle>
          </DialogHeader>
          <div className="mb-5 text-gray-600">
            カラムをドラッグして並び替え、幅の調整ができます。幅は50px〜1000pxの範囲で入力してください。
          </div>

          <div className="flex flex-colum gap-2">
            {columnOrder.map((columnId) => {
              const column = columns.find((col) => col.id === columnId);
              if (!column) {
                return null;
              }

              const isDragging = draggedColumnId === column.id;

              return (
                <div
                  key={column.id}
                  draggable
                  onDragStart={(e: React.DragEvent) =>
                    handleDragStart(e, column.id)
                  }
                  onDragOver={handleDragOver}
                  onDrop={(e: React.DragEvent) => handleDrop(e, column.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    border: "1px solid",
                    borderColor: isDragging
                      ? "rgb(37 99 235)"
                      : "hsl(var(--border))",
                    background: column.visible
                      ? "hsl(var(--background))"
                      : "rgb(245 245 245)",
                    opacity: isDragging ? 0.5 : 1,
                  }}
                  className="flex items-center py-1 px-0 rounded-md cursor-move transition-all duration-200 ease"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="並び替え"
                    className="cursor-grab active:cursor-grabbing p-1 h-auto min-w-0"
                  >
                    <GripVertical size={16} />
                  </Button>

                  <div className="flex-1">
                    <span className="font-semibold text-gray-900">{column.label}</span>
                  </div>

                  <div className="mr-2">
                    <label className="sr-only">
                      {column.label}の幅を設定
                    </label>
                    <Input
                      value={column.width}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleWidthChange(column.id, e.target.value)
                      }
                      placeholder="幅 (50px〜1000px)"
                      className="w-30"
                      aria-describedby={`width-help-${column.id}`}
                    />
                  </div>

                  {isCustomColumn(column.id) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="カラムを削除"
                      onClick={() => removeColumn(column.id)}
                      className="text-red-600 hover:text-red-700 p-1 h-auto min-w-0"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 mt-4 justify-end">
            <Button onClick={() => setIsSettingsOpen(false)}>閉じる</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TableColumnManager;
