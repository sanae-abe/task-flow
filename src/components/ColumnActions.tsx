import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useMemo } from "react";

import type { MenuGroup, MenuTrigger } from "../types/unified-menu";
import UnifiedMenu from "./shared/Menu/UnifiedMenu";

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
  // メニュートリガー設定
  const trigger: MenuTrigger = useMemo(() => ({
    type: 'custom',
    icon: MoreHorizontal,
    variant: 'invisible',
    size: 'icon',
    ariaLabel: 'カラム設定',
    className: 'w-6 h-6 p-0 hover:bg-transparent',
  }), []);

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
          label: '左に移動',
          icon: ChevronLeft,
          disabled: !canMoveLeft,
          onSelect: onMoveLeft
        });
      }

      if (onMoveRight) {
        moveItems.push({
          id: 'move-right',
          type: 'action' as const,
          label: '右に移動',
          icon: ChevronRight,
          disabled: !canMoveRight,
          onSelect: onMoveRight
        });
      }

      if (moveItems.length > 0) {
        groups.push({
          id: 'column-movement',
          label: 'カラム移動',
          items: moveItems
        });
      }
    }

    // カラム管理グループ
    groups.push({
      id: 'column-management',
      label: 'カラム管理',
      items: [
        {
          id: 'edit-title',
          type: 'action',
          label: 'カラム名を編集',
          icon: Edit,
          onSelect: onTitleEdit
        },
        {
          id: 'delete-column',
          type: 'action',
          label: 'カラムを削除',
          icon: Trash2,
          variant: 'danger',
          onSelect: onDeleteColumn
        }
      ]
    });

    return groups;
  }, [onMoveLeft, onMoveRight, canMoveLeft, canMoveRight, onTitleEdit, onDeleteColumn]);

  return (
    <div className="flex items-center">
      {/* タスク追加ボタン */}
      <Button
        onClick={onAddTask}
        variant="ghost"
        size="icon"
        aria-label="タスクを作成"
        className="hover:text-default w-6 h-6 p-0"
      >
        <Plus size={16} />
      </Button>

      {/* カラム設定メニュー */}
      <UnifiedMenu
        groups={menuGroups}
        trigger={trigger}
        zIndex={150}
      />
    </div>
  );
};

export default ColumnActions;
