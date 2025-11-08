import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import {
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { IconButton } from '@/components/shared';
import { cn } from '@/lib/utils';
import type { TableColumn } from '@/contexts/TableColumnsContext';

interface ColumnListItemProps {
  column: TableColumn;
  index: number;
  totalCount: number;
  isDragging: boolean;
  isCustomColumn: boolean;
  onDragStart: (e: React.DragEvent, columnId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
  onDragEnd: () => void;
  onToggleVisibility: (columnId: string) => void;
  onWidthChange: (columnId: string, value: string) => void;
  onMoveUp: (columnId: string) => void;
  onMoveDown: (columnId: string) => void;
  onRemove: (columnId: string) => void;
}

/**
 * カラム設定のリストアイテム
 */
export const ColumnListItem: React.FC<ColumnListItemProps> = ({
  column,
  index,
  totalCount,
  isDragging,
  isCustomColumn,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onToggleVisibility,
  onWidthChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}) => {
  const { t } = useTranslation();
  const isFirst = index === 0;
  const isLast = index === totalCount - 1;

  return (
    <div
      draggable
      onDragStart={(e: React.DragEvent) => onDragStart(e, column.id)}
      onDragOver={onDragOver}
      onDrop={(e: React.DragEvent) => onDrop(e, column.id)}
      onDragEnd={onDragEnd}
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
              ? t('table.columnSettings.hideColumn')
              : t('table.columnSettings.showColumn')
          }
          onClick={e => {
            e.stopPropagation();
            onToggleVisibility(column.id);
          }}
          className='p-2 hover:bg-gray-200'
        />
      </div>

      {/* カラム名 */}
      <div className='flex-1 min-w-0'>
        <span className='text-sm font-medium truncate'>{column.label}</span>
      </div>

      {/* 幅設定 */}
      <div className='flex items-center gap-1'>
        <label className='text-sm text-zinc-500 hidden sm:block'>
          {t('table.columnSettings.widthLabel')}
        </label>
        <Input
          value={column.width}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onWidthChange(column.id, e.target.value)
          }
          placeholder={t('table.columnSettings.width')}
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
            ariaLabel={t('table.columnSettings.moveUp')}
            onClick={e => {
              e.stopPropagation();
              onMoveUp(column.id);
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
            ariaLabel={t('table.columnSettings.moveDown')}
            onClick={e => {
              e.stopPropagation();
              onMoveDown(column.id);
            }}
            disabled={isLast}
            className={cn(
              'p-2 hover:bg-gray-200',
              isLast ? 'text-zinc-300' : 'text-foreground'
            )}
          />
        </div>

        {isCustomColumn && (
          <IconButton
            icon={Trash2}
            size='icon'
            ariaLabel={t('table.columnSettings.deleteColumn')}
            onClick={() => onRemove(column.id)}
            className='w-8 h-8 p-2 hover:bg-gray-200'
          />
        )}
      </div>
    </div>
  );
};
