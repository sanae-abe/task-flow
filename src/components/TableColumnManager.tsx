import React, { useState, useCallback } from "react";
import {
  Text,
  IconButton,
  ActionMenu,
  ActionList,
  Button,
  FormControl,
  TextInput,
  Dialog,
} from "@primer/react";
import {
  GearIcon,
  TrashIcon,
  GrabberIcon,
  CheckIcon,
} from "@primer/octicons-react";

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
      <ActionMenu>
        <ActionMenu.Anchor>
          <IconButton
            aria-label="カラム詳細設定"
            icon={GearIcon}
            variant="invisible"
            size="small"
          />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList>
            <ActionList.Group title="表示カラム">
              {columns.map((column) => (
                <ActionList.Item
                  key={column.id}
                  onSelect={() => toggleColumnVisibility(column.id)}
                >
                  <ActionList.LeadingVisual>
                    <div
                      style={{
                        color: column.visible ? "inherit" : "white",
                      }}
                    >
                      <CheckIcon />
                    </div>
                  </ActionList.LeadingVisual>
                  {column.label}
                </ActionList.Item>
              ))}
            </ActionList.Group>
            <ActionList.Divider />
            <ActionList.Item onSelect={() => setIsSettingsOpen(true)}>
              <ActionList.LeadingVisual>
                <GearIcon />
              </ActionList.LeadingVisual>
              詳細設定
            </ActionList.Item>
            <ActionList.Divider />
            <ActionList.Item onSelect={resetToDefaults} variant="danger">
              デフォルトに戻す
            </ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>

      {/* 詳細設定ダイアログ */}
      {isSettingsOpen && (
        <Dialog
          title="カラム詳細設定"
          onClose={() => setIsSettingsOpen(false)}
          aria-labelledby="column-settings-title"
        >
          <div style={{ marginBottom: "20px", color: "fg.muted" }}>
            カラムをドラッグして並び替え、幅の調整ができます。幅は50px〜1000pxの範囲で入力してください。
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                    display: "flex",
                    padding: "4px 0",
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: isDragging
                      ? "var(--borderColor-accent-emphasis)"
                      : "var(--borderColor-default)",
                    borderRadius: "var(--borderRadius-medium)",
                    background: column.visible ? "var(--bgColor-default)" : "var(--bgColor-muted)",
                    opacity: isDragging ? 0.5 : 1,
                    cursor: "move",
                    transition: "all 0.2s ease",
                  }}
                >
                  <IconButton
                    aria-label="並び替え"
                    icon={GrabberIcon}
                    variant="invisible"
                    size="small"
                    sx={{
                      cursor: "grab",
                      "&:active": { cursor: "grabbing" },
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <Text sx={{ fontWeight: "semibold" }}>{column.label}</Text>
                  </div>

                  <FormControl>
                    <FormControl.Label visuallyHidden>
                      {column.label}の幅を設定
                    </FormControl.Label>
                    <TextInput
                      value={column.width}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleWidthChange(column.id, e.target.value)
                      }
                      placeholder="幅 (50px〜1000px)"
                      size="small"
                      sx={{ width: "120px", mr: 1 }}
                      aria-describedby={`width-help-${column.id}`}
                    />
                  </FormControl>

                  {isCustomColumn(column.id) && (
                    <IconButton
                      aria-label="カラムを削除"
                      icon={TrashIcon}
                      variant="invisible"
                      size="small"
                      onClick={() => removeColumn(column.id)}
                      sx={{ color: "danger.emphasis" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div
            style={{ display: "flex", gap: "8px", marginTop: "16px", justifyContent: "flex-end" }}
          >
            <Button onClick={() => setIsSettingsOpen(false)}>閉じる</Button>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default TableColumnManager;
