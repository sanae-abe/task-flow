import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Settings,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

import { useTableColumns } from '../contexts/TableColumnsContext';
import UnifiedDialog from './shared/Dialog/UnifiedDialog';
import { IconButton, InlineMessage } from './shared';
import { cn } from '@/lib/utils';

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

  const handleTempWidthChange = useCallback(
    (columnId: string, newWidth: string) => {
      let formattedWidth = newWidth;

      // 空文字列でない場合はバリデーション
      if (newWidth !== '') {
        // pxを削除して数値のみを取得
        const numericValue = parseInt(newWidth.replace(/px$/, ''), 10);

        // 50px～1000pxの範囲内かチェック
        if (
          !isNaN(numericValue) &&
          numericValue >= 50 &&
          numericValue <= 1000
        ) {
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
    },
    []
  );

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
  const handleMoveUp = useCallback(
    (columnId: string) => {
      const currentIndex = tempColumnOrder.indexOf(columnId);
      if (currentIndex > 0 && currentIndex < tempColumnOrder.length) {
        const newOrder = [...tempColumnOrder];
        // 現在のアイテムと前のアイテムを入れ替え
        const prevItem = newOrder[currentIndex - 1];
        const currentItem = newOrder[currentIndex];
        if (prevItem !== undefined && currentItem !== undefined) {
          newOrder[currentIndex - 1] = currentItem;
          newOrder[currentIndex] = prevItem;
          handleTempReorderColumns(newOrder);
        }
      }
    },
    [tempColumnOrder, handleTempReorderColumns]
  );

  const handleMoveDown = useCallback(
    (columnId: string) => {
      const currentIndex = tempColumnOrder.indexOf(columnId);
      if (currentIndex >= 0 && currentIndex < tempColumnOrder.length - 1) {
        const newOrder = [...tempColumnOrder];
        // 現在のアイテムと次のアイテムを入れ替え
        const currentItem = newOrder[currentIndex];
        const nextItem = newOrder[currentIndex + 1];
        if (currentItem !== undefined && nextItem !== undefined) {
          newOrder[currentIndex] = nextItem;
          newOrder[currentIndex + 1] = currentItem;
          handleTempReorderColumns(newOrder);
        }
      }
    },
    [tempColumnOrder, handleTempReorderColumns]
  );

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
    const removedColumns = columns.filter(
      col => !tempColumns.some(tempCol => tempCol.id === col.id)
    );
    removedColumns.forEach(col => removeColumn(col.id));

    setHasUnsavedChanges(false);
    setIsSettingsOpen(false);
  }, [
    tempColumns,
    tempColumnOrder,
    columns,
    columnOrder,
    toggleColumnVisibility,
    updateColumnWidth,
    reorderColumns,
    removeColumn,
  ]);

  // キャンセル処理
  const handleCancel = useCallback(() => {
    setTempColumns([]);
    setTempColumnOrder([]);
    setHasUnsavedChanges(false);
    setIsSettingsOpen(false);
  }, []);

  const isCustomColumn = useCallback(
    (columnId: string) => columnId.startsWith('custom-'),
    []
  );

  // ドラッグ開始
  const handleDragStart = useCallback(
    (e: React.DragEvent, columnId: string) => {
      setDraggedColumnId(columnId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', columnId);
    },
    []
  );

  // ドラッグオーバー
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
    [draggedColumnId, tempColumnOrder, handleTempReorderColumns]
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
            variant='ghost'
            size='sm'
            aria-label='カラム詳細設定'
            className='p-1 h-auto min-w-0'
          >
            <Settings size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-64 max-h-80 overflow-y-auto'>
          <DropdownMenuGroup>
            <DropdownMenuLabel>表示カラム</DropdownMenuLabel>
            <div className='max-h-48 overflow-y-auto'>
              {(isSettingsOpen ? tempColumns : columns).map(column => (
                <DropdownMenuCheckboxItem
                  checked={column.visible}
                  key={column.id}
                  onCheckedChange={() => {
                    // e.preventDefault(); // メニューが閉じるのを防ぐ
                    if (isSettingsOpen) {
                      handleTempToggleVisibility(column.id);
                    } else {
                      toggleColumnVisibility(column.id);
                    }
                  }}
                  className='cursor-pointer hover:bg-gray-50'
                >
                  <span className='text-sm truncate'>{column.label}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsSettingsOpen(true)}
            className='cursor-pointer'
          >
            <Settings size={16} className='mr-2' />
            詳細設定
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={resetToDefaults}
            className='cursor-pointer'
          >
            デフォルトに戻す
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 詳細設定ダイアログ - UnifiedDialog版 */}
      <UnifiedDialog
        isOpen={isSettingsOpen}
        onClose={handleCancel}
        title='カラム詳細設定'
        variant='modal'
        size='large'
        actions={[
          {
            label: 'キャンセル',
            onClick: handleCancel,
            variant: 'outline',
          },
          {
            label: '保存',
            onClick: handleSave,
            variant: 'default',
            disabled: !hasUnsavedChanges,
          },
        ]}
      >
        <div className='mb-5 text-zinc-700 text-sm'>
          カラムをドラッグして並び替え、表示切り替え、幅の調整ができます。
          <br />
          幅は50px〜1000pxの範囲で入力してください。
          {hasUnsavedChanges && (
            <InlineMessage
              variant='warning'
              message='未保存の変更があります'
              className='mt-2'
            />
          )}
        </div>

        <div className='flex flex-col gap-3 max-h-96 overflow-y-auto'>
          {tempColumnOrder.map((columnId, index) => {
            const column = tempColumns.find(col => col.id === columnId);
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
                className={`flex flex-wrap items-center gap-1 p-2 border border-border rounded-lg transition-all duration-200 ease ${
                  isDragging
                    ? 'border-primary bg-blue-50 cursor-grabbing opacity-50'
                    : 'border-gray-300 bg-gray-50 cursor-grab hover:bg-gray-100'
                }`}
              >
                {/* ドラッグハンドルと表示切り替え */}
                <div className='flex items-center gap-2'>
                  <div className='flex items-center cursor-grab active:cursor-grabbing'>
                    <GripVertical size={16} />
                  </div>
                  <IconButton
                    icon={column.visible ? Eye : EyeOff}
                    size='icon'
                    ariaLabel={
                      column.visible
                        ? 'カラムを非表示にする'
                        : 'カラムを表示する'
                    }
                    onClick={e => {
                      e.stopPropagation();
                      handleTempToggleVisibility(column.id);
                    }}
                    className='p-2 hover:bg-gray-200'
                  />
                </div>

                {/* カラム名 */}
                <div className='flex-1 min-w-0'>
                  <span className='text-sm font-medium truncate'>
                    {column.label}
                  </span>
                </div>

                {/* 幅設定 */}
                <div className='flex items-center gap-1'>
                  <label className='text-sm text-zinc-500 hidden sm:block'>
                    幅:
                  </label>
                  <Input
                    value={column.width}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleTempWidthChange(column.id, e.target.value)
                    }
                    placeholder='幅'
                    className='w-20 h-8 text-xs'
                    aria-describedby={`width-help-${column.id}`}
                  />
                </div>

                {/* 上下移動と削除ボタン */}
                <div className='flex items-center gap-1'>
                  <div className='flex gap-0.5'>
                    <IconButton
                      icon={ChevronUp}
                      size='icon'
                      ariaLabel='カラムを上に移動'
                      onClick={e => {
                        e.stopPropagation();
                        handleMoveUp(column.id);
                      }}
                      disabled={isFirst}
                      className={cn(
                        'p-2 hover:bg-gray-200',
                        isFirst ? 'text-zinc-300' : 'text-foreground'
                      )}
                    />
                    <IconButton
                      icon={ChevronDown}
                      size='icon'
                      ariaLabel='カラムを下に移動'
                      onClick={e => {
                        e.stopPropagation();
                        handleMoveDown(column.id);
                      }}
                      disabled={isLast}
                      className={cn(
                        'p-2 hover:bg-gray-200',
                        isLast ? 'text-zinc-300' : 'text-foreground'
                      )}
                    />
                  </div>

                  {isCustomColumn(column.id) && (
                    <IconButton
                      icon={Trash2}
                      size='icon'
                      ariaLabel='カラムを削除'
                      onClick={() => handleTempRemoveColumn(column.id)}
                      className='w-8 h-8 p-2 hover:bg-gray-200'
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </UnifiedDialog>
    </>
  );
};

export default TableColumnManager;
