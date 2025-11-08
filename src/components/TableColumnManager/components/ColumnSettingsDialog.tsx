import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import UnifiedDialog from '@/components/shared/Dialog/UnifiedDialog';
import { InlineMessage } from '@/components/shared';
import { ColumnListItem } from './ColumnListItem';
import type { TableColumn } from '@/contexts/TableColumnsContext';

interface ColumnSettingsDialogProps {
  isOpen: boolean;
  tempColumns: TableColumn[];
  tempColumnOrder: string[];
  draggedColumnId: string | null;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onCancel: () => void;
  onToggleVisibility: (columnId: string) => void;
  onWidthChange: (columnId: string, value: string) => void;
  onMoveUp: (columnId: string) => void;
  onMoveDown: (columnId: string) => void;
  onRemove: (columnId: string) => void;
  onDragStart: (e: React.DragEvent, columnId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
  onDragEnd: () => void;
}

/**
 * カラム詳細設定ダイアログ
 */
export const ColumnSettingsDialog: React.FC<ColumnSettingsDialogProps> = ({
  isOpen,
  tempColumns,
  tempColumnOrder,
  draggedColumnId,
  hasUnsavedChanges,
  onSave,
  onCancel,
  onToggleVisibility,
  onWidthChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  const { t } = useTranslation();
  const isCustomColumn = useCallback(
    (columnId: string) => columnId.startsWith('custom-'),
    []
  );

  return (
    <UnifiedDialog
      isOpen={isOpen}
      onClose={onCancel}
      title={t('table.columnSettings.title')}
      variant='modal'
      size='large'
      actions={[
        {
          label: t('common.cancel'),
          onClick: onCancel,
          variant: 'outline',
        },
        {
          label: t('common.save'),
          onClick: onSave,
          variant: 'default',
          disabled: !hasUnsavedChanges,
        },
      ]}
    >
      <div className='mb-5 text-zinc-700 text-sm'>
        {t('table.columnSettings.description')}
        <br />
        {t('table.columnSettings.widthHelp')}
        {hasUnsavedChanges && (
          <InlineMessage
            variant='warning'
            message={t('table.columnSettings.unsavedChanges')}
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

          return (
            <ColumnListItem
              key={column.id}
              column={column}
              index={index}
              totalCount={tempColumnOrder.length}
              isDragging={draggedColumnId === column.id}
              isCustomColumn={isCustomColumn(column.id)}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
              onToggleVisibility={onToggleVisibility}
              onWidthChange={onWidthChange}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onRemove={onRemove}
            />
          );
        })}
      </div>
    </UnifiedDialog>
  );
};
