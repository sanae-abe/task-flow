import {
  Plus,
  Edit,
  Trash2,
  CircleCheck,
  MoreHorizontal,
} from "lucide-react";
import { memo, useMemo } from "react";

import type { MenuGroup, MenuTrigger } from "../types/unified-menu";
import UnifiedMenu from "./shared/Menu/UnifiedMenu";

/**
 * ボード設定用のアクションメニューコンポーネント
 * ボード管理とタスク管理の機能を提供
 */
interface BoardActionMenuProps {
  /** 完了したタスクが存在するかどうか */
  hasCompletedTasks: boolean;
  /** ボードを削除可能かどうか（複数ボードがある場合のみ可能） */
  canDeleteBoard: boolean;
  /** ボード作成時のコールバック */
  onCreateBoard: () => void;
  /** ボード名編集時のコールバック */
  onEditBoard: () => void;
  /** ボード削除時のコールバック */
  onDeleteBoard: () => void;
  /** 完了タスククリア時のコールバック */
  onClearCompletedTasks: () => void;
}

const BoardActionMenu = memo<BoardActionMenuProps>(
  ({
    hasCompletedTasks,
    canDeleteBoard,
    onCreateBoard,
    onEditBoard,
    onDeleteBoard,
    onClearCompletedTasks,
  }) => {
    // トリガー設定
    const trigger: MenuTrigger = useMemo(() => ({
      type: 'button',
      label: 'ボード設定',
      icon: MoreHorizontal,
      ariaLabel: 'ボード設定メニューを開く',
      className: 'text-sm text-muted-default'
    }), []);

    // メニューグループ設定
    const menuGroups: MenuGroup[] = useMemo(() => [
      // ボード管理グループ
      {
        id: 'board-management',
        label: 'ボード管理',
        items: [
          {
            id: 'create-board',
            type: 'action',
            label: 'ボード作成',
            icon: Plus,
            onSelect: onCreateBoard
          },
          {
            id: 'edit-board',
            type: 'action',
            label: 'ボード名を編集',
            icon: Edit,
            onSelect: onEditBoard
          }
        ]
      },
      // タスク管理グループ（条件付き表示）
      {
        id: 'task-management',
        label: 'タスク管理',
        condition: hasCompletedTasks,
        items: [
          {
            id: 'clear-completed',
            type: 'action',
            label: '完了したタスクをクリア',
            icon: CircleCheck,
            onSelect: onClearCompletedTasks
          }
        ]
      },
      // 危険なアクショングループ（条件付き表示）
      {
        id: 'danger-actions',
        label: '危険なアクション',
        condition: canDeleteBoard,
        items: [
          {
            id: 'delete-board',
            type: 'action',
            label: 'ボードを削除',
            icon: Trash2,
            variant: 'danger',
            onSelect: onDeleteBoard
          }
        ]
      }
    ], [hasCompletedTasks, canDeleteBoard, onCreateBoard, onEditBoard, onDeleteBoard, onClearCompletedTasks]);

    return (
      <UnifiedMenu
        groups={menuGroups}
        trigger={trigger}
      />
    );
  }
);

BoardActionMenu.displayName = "BoardActionMenu";

export default BoardActionMenu;
