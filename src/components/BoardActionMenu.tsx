import { Plus, Edit, Trash2, CircleCheck, MoreHorizontal } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { MenuGroup, MenuTrigger } from '../types/unified-menu';
import UnifiedMenu from './shared/Menu/UnifiedMenu';

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
    const { t } = useTranslation();

    // トリガー設定
    const trigger: MenuTrigger = useMemo(
      () => ({
        type: 'button',
        label: t('board.boardSettings'),
        icon: MoreHorizontal,
        ariaLabel: t('board.boardSettingsMenu'),
        className:
          'justify-center whitespace-nowrap text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-foreground h-9 rounded-md px-2 flex items-center gap-1 text-zinc-700',
      }),
      [t]
    );

    // メニューグループ設定
    const menuGroups: MenuGroup[] = useMemo(
      () => [
        // ボード管理グループ
        {
          id: 'board-management',
          label: t('board.boardManagement'),
          items: [
            {
              id: 'create-board',
              type: 'action',
              label: t('board.createBoard'),
              icon: Plus,
              onSelect: onCreateBoard,
            },
            {
              id: 'edit-board',
              type: 'action',
              label: t('board.editBoardName'),
              icon: Edit,
              onSelect: onEditBoard,
            },
          ],
        },
        // タスク管理グループ（条件付き表示）
        {
          id: 'task-management',
          label: t('board.taskManagement'),
          condition: hasCompletedTasks,
          items: [
            {
              id: 'clear-completed',
              type: 'action',
              label: t('board.clearCompleted'),
              icon: CircleCheck,
              onSelect: onClearCompletedTasks,
            },
          ],
        },
        // 危険なアクショングループ（条件付き表示）
        {
          id: 'danger-actions',
          label: t('board.dangerActions'),
          condition: canDeleteBoard,
          items: [
            {
              id: 'delete-board',
              type: 'action',
              label: t('board.deleteBoard'),
              icon: Trash2,
              variant: 'danger',
              onSelect: onDeleteBoard,
            },
          ],
        },
      ],
      [
        t,
        hasCompletedTasks,
        canDeleteBoard,
        onCreateBoard,
        onEditBoard,
        onDeleteBoard,
        onClearCompletedTasks,
      ]
    );

    return <UnifiedMenu groups={menuGroups} trigger={trigger} />;
  }
);

BoardActionMenu.displayName = 'BoardActionMenu';

export default BoardActionMenu;
