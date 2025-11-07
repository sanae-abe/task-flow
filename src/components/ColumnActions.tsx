import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { MenuGroup, MenuTrigger } from '../types/unified-menu';
import UnifiedMenu from './shared/Menu/UnifiedMenu';
import IconButton from './shared/IconButton';

interface ColumnActionsProps {
  onAddTask: () => void;
  onTitleEdit: () => void;
  onDeleteColumn: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
}

const ColumnActions: React.FC<ColumnActionsProps> = ({
  onAddTask,
  onTitleEdit,
  onDeleteColumn,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = true,
  canMoveRight = true,
}) => {
  const { t } = useTranslation();

  // メニュートリガー設定
  const trigger: MenuTrigger = useMemo(
    () => ({
      type: 'custom',
      icon: MoreHorizontal,
      variant: 'invisible',
      size: 'icon',
      ariaLabel: t('column.columnSettings'),
      className: 'w-6 h-6 p-0 hover:bg-transparent justify-center',
    }),
    [t]
  );

  // メニューグループ設定
  const menuGroups: MenuGroup[] = useMemo(() => {
    const groups: MenuGroup[] = [];

    // カラム移動グループ（条件付き表示）
    const hasMovementOptions = onMoveLeft || onMoveRight;
    if (hasMovementOptions) {
      const moveItems = [];

      if (onMoveLeft) {
        moveItems.push({
          id: 'move-left',
          type: 'action' as const,
          label: t('column.moveLeft'),
          icon: ChevronLeft,
          disabled: !canMoveLeft,
          onSelect: onMoveLeft,
        });
      }

      if (onMoveRight) {
        moveItems.push({
          id: 'move-right',
          type: 'action' as const,
          label: t('column.moveRight'),
          icon: ChevronRight,
          disabled: !canMoveRight,
          onSelect: onMoveRight,
        });
      }

      if (moveItems.length > 0) {
        groups.push({
          id: 'column-movement',
          label: t('column.columnMovement'),
          items: moveItems,
        });
      }
    }

    // カラム管理グループ
    groups.push({
      id: 'column-management',
      label: t('column.columnManagement'),
      items: [
        {
          id: 'edit-title',
          type: 'action',
          label: t('column.editColumn'),
          icon: Edit,
          onSelect: onTitleEdit,
        },
        {
          id: 'delete-column',
          type: 'action',
          label: t('column.deleteColumn'),
          icon: Trash2,
          variant: 'danger',
          onSelect: onDeleteColumn,
        },
      ],
    });

    return groups;
  }, [
    onMoveLeft,
    onMoveRight,
    canMoveLeft,
    canMoveRight,
    onTitleEdit,
    onDeleteColumn,
    t,
  ]);

  return (
    <div className='flex items-center'>
      {/* タスク追加ボタン */}
      <IconButton
        icon={Plus}
        onClick={onAddTask}
        size='icon'
        ariaLabel={t('task.createTask')}
        className='text-foreground hover:text-foreground w-6 h-6 p-0'
      />

      {/* カラム設定メニュー */}
      <UnifiedMenu groups={menuGroups} trigger={trigger} zIndex={150} />
    </div>
  );
};

export default ColumnActions;
