import React, { useState, useCallback, useEffect } from "react";
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
  Settings,
  Trash2,
  GripVertical,
  Check,
  Eye,
  EyeOff,
  X,
  ChevronUp,
  ChevronDown
} from "lucide-react";

import { useTableColumns } from "../contexts/TableColumnsContext";
import UnifiedDialog from "./shared/Dialog/UnifiedDialog";
import { InlineMessage } from "./shared";

interface TempColumn {
  id: string;
  label: string;
  visible: boolean;
  width: string;
}

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

  // 一時的な状態管理
  const [tempColumns, setTempColumns] = useState<TempColumn[]>([]);
  const [tempColumnOrder, setTempColumnOrder] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ダイアログが開かれた時に一時的な状態を初期化
  useEffect(() => {
    if (isSettingsOpen) {
      setTempColumns(columns.map(col => ({ ...col })));
      setTempColumnOrder([...columnOrder]);
      setHasUnsavedChanges(false);
    }
  }, [isSettingsOpen, columns, columnOrder]);

  // 一時的な状態を操作する関数群
  const handleTempToggleVisibility = useCallback((columnId: string) => {
    setTempColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
    setHasUnsavedChanges(true);
  }, []);

  const handleTempWidthChange = useCallback((columnId: string, newWidth: string) => {
    let formattedWidth = newWidth;

    // 空文字列でない場合はバリデーション
    if (newWidth !== "") {
      // pxを削除して数値のみを取得
      const numericValue = parseInt(newWidth.replace(/px$/, ""), 10);

      // 50px～1000pxの範囲内かチェック
      if (!isNaN(numericValue) && numericValue >= 50 && numericValue <= 1000) {
        formattedWidth = `${numericValue}px`;
      } else if (!isNaN(numericValue)) {
        // 範囲外の場合は最小値/最大値に調整
        const clampedValue = Math.max(50, Math.min(1000, numericValue));
        formattedWidth = `${clampedValue}px`;
      }
    }

    setTempColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, width: formattedWidth } : col
      )
    );
    setHasUnsavedChanges(true);
  }, []);

  const handleTempReorderColumns = useCallback((newOrder: string[]) => {
    setTempColumnOrder(newOrder);
    setHasUnsavedChanges(true);
  }, []);

  const handleTempRemoveColumn = useCallback((columnId: string) => {
    setTempColumns(prev => prev.filter(col => col.id !== columnId));
    setTempColumnOrder(prev => prev.filter(id => id !== columnId));
    setHasUnsavedChanges(true);
  }, []);

  // 上下移動のハンドラー関数
  const handleMoveUp = useCallback((columnId: string) => {
    const currentIndex = tempColumnOrder.indexOf(columnId);
    if (currentIndex > 0 && currentIndex < tempColumnOrder.length) {
      const newOrder = [...tempColumnOrder];
      // 現在のアイテムと前のアイテムを入れ替え
      const temp = newOrder[currentIndex - 1]!;
      newOrder[currentIndex - 1] = newOrder[currentIndex]!;
      newOrder[currentIndex] = temp;
      handleTempReorderColumns(newOrder);
    }
  }, [tempColumnOrder, handleTempReorderColumns]);

  const handleMoveDown = useCallback((columnId: string) => {
    const currentIndex = tempColumnOrder.indexOf(columnId);
    if (currentIndex >= 0 && currentIndex < tempColumnOrder.length - 1) {
      const newOrder = [...tempColumnOrder];
      // 現在のアイテムと次のアイテムを入れ替え
      const temp = newOrder[currentIndex]!;
      newOrder[currentIndex] = newOrder[currentIndex + 1]!;
      newOrder[currentIndex + 1] = temp;
      handleTempReorderColumns(newOrder);
    }
  }, [tempColumnOrder, handleTempReorderColumns]);

  // 保存処理
  const handleSave = useCallback(() => {
    // 表示状態の変更を適用
    tempColumns.forEach(tempCol => {
      const originalCol = columns.find(col => col.id === tempCol.id);
      if (originalCol && originalCol.visible !== tempCol.visible) {
        toggleColumnVisibility(tempCol.id);
      }
      if (originalCol && originalCol.width !== tempCol.width) {
        updateColumnWidth(tempCol.id, tempCol.width);
      }
    });

    // カラム順序の変更を適用
    if (JSON.stringify(columnOrder) !== JSON.stringify(tempColumnOrder)) {
      reorderColumns(tempColumnOrder);
    }

    // 削除されたカラムを処理
    const removedColumns = columns.filter(col =>
      !tempColumns.some(tempCol => tempCol.id === col.id)
    );
    removedColumns.forEach(col => removeColumn(col.id));

    setHasUnsavedChanges(false);
    setIsSettingsOpen(false);
  }, [tempColumns, tempColumnOrder, columns, columnOrder, toggleColumnVisibility, updateColumnWidth, reorderColumns, removeColumn]);

  // キャンセル処理
  const handleCancel = useCallback(() => {
    setTempColumns([]);
    setTempColumnOrder([]);
    setHasUnsavedChanges(false);
    setIsSettingsOpen(false);
  }, []);


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

  // ドロップ（詳細設定ダイアログ用）
  const handleDrop = useCallback(
    (e: React.DragEvent, targetColumnId: string) => {
      e.preventDefault();

      if (!draggedColumnId || draggedColumnId === targetColumnId) {
        setDraggedColumnId(null);
        return;
      }

      const currentOrder = [...tempColumnOrder];
      const draggedIndex = currentOrder.indexOf(draggedColumnId);
      const targetIndex = currentOrder.indexOf(targetColumnId);

      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedColumnId(null);
        return;
      }

      // 配列の要素を移動
      currentOrder.splice(draggedIndex, 1);
      currentOrder.splice(targetIndex, 0, draggedColumnId);

      handleTempReorderColumns(currentOrder);
      setDraggedColumnId(null);
    },
    [draggedColumnId, tempColumnOrder, handleTempReorderColumns],
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
            {(isSettingsOpen ? tempColumns : columns).map((column) => (
              <DropdownMenuItem
                key={column.id}
                onSelect={(e) => {
                  e.preventDefault(); // メニューが閉じるのを防ぐ
                  if (isSettingsOpen) {
                    handleTempToggleVisibility(column.id);
                  } else {
                    toggleColumnVisibility(column.id);
                  }
                }}
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

      {/* 詳細設定ダイアログ - UnifiedDialog版 */}
      <UnifiedDialog
        isOpen={isSettingsOpen}
        onClose={handleCancel}
        title="カラム詳細設定"
        variant="modal"
        size="large"
        actions={[
          {
            label: "キャンセル",
            onClick: handleCancel,
            variant: "outline",
            icon: X
          },
          {
            label: "保存",
            onClick: handleSave,
            variant: "default",
            icon: Check,
            disabled: !hasUnsavedChanges
          }
        ]}
      >
        <div className="mb-5 text-gray-600 text-sm">
          カラムをドラッグして並び替え、表示切り替え、幅の調整ができます。<br />
          幅は50px〜1000pxの範囲で入力してください。
          {hasUnsavedChanges && (
            <InlineMessage variant="warning" message="未保存の変更があります" className="mt-2" />
          )}
        </div>

        <div className="flex flex-col gap-3">
          {tempColumnOrder.map((columnId, index) => {
            const column = tempColumns.find((col) => col.id === columnId);
            if (!column) {
              return null;
            }

            const isDragging = draggedColumnId === column.id;
            const isFirst = index === 0;
            const isLast = index === tempColumnOrder.length - 1;

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
                className={`flex items-center gap-2 p-1 border rounded-lg transition-all duration-200 ease ${
                  isDragging
                    ? 'border-blue-600 bg-gray-100 cursor-grabbing opacity-50'
                    : column.visible
                    ? 'border-gray-300 bg-gray-50 cursor-grab hover:bg-gray-100'
                    : 'border-gray-200 bg-gray-100 cursor-grab hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center cursor-grab active:cursor-grabbing">
                  <GripVertical size={16} className="text-gray-500" />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={column.visible ? 'カラムを非表示にする' : 'カラムを表示する'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTempToggleVisibility(column.id);
                  }}
                  className="w-8 h-8 p-0"
                >
                  {column.visible ? (
                    <Eye size={16} className="text-green-600" />
                  ) : (
                    <EyeOff size={16} className="text-gray-400" />
                  )}
                </Button>

                <div className="flex-1">
                  <span className="text-sm">{column.label}</span>
                </div>

                <div>
                  <label className="sr-only">
                    {column.label}の幅を設定
                  </label>
                  <Input
                    value={column.width}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleTempWidthChange(column.id, e.target.value)
                    }
                    placeholder="幅 (50px〜1000px)"
                    className="w-30"
                    aria-describedby={`width-help-${column.id}`}
                  />
                </div>

                {/* 上下移動ボタン */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="カラムを上に移動"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveUp(column.id);
                    }}
                    disabled={isFirst}
                    className="w-6 h-6 p-0"
                  >
                    <ChevronUp size={12} className={isFirst ? "text-gray-300" : "text-gray-600"} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="カラムを下に移動"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveDown(column.id);
                    }}
                    disabled={isLast}
                    className="w-6 h-6 p-0"
                  >
                    <ChevronDown size={12} className={isLast ? "text-gray-300" : "text-gray-600"} />
                  </Button>
                </div>

                {isCustomColumn(column.id) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="カラムを削除"
                    onClick={() => handleTempRemoveColumn(column.id)}
                    className="w-8 h-8 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </UnifiedDialog>
    </>
  );
};

export default TableColumnManager;
