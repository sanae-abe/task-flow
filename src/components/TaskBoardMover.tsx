import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, FolderKanban } from 'lucide-react';
import { useBoard } from '../contexts/BoardContext';

import type { MenuGroup, MenuTrigger } from '../types/unified-menu';
import UnifiedMenu from './shared/Menu/UnifiedMenu';

interface TaskBoardMoverProps {
  onMoveTask: (targetBoardId: string) => void;
  disabled?: boolean;
}

export const TaskBoardMover: React.FC<TaskBoardMoverProps> = ({
  onMoveTask,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const { state, currentBoard } = useBoard();

  // 現在のボード以外のボード（削除されたボードを除く）を取得
  const availableBoards = useMemo(
    () =>
      state.boards.filter(
        board =>
          board.id !== currentBoard?.id && board.deletionState !== 'deleted'
      ),
    [state.boards, currentBoard?.id]
  );

  const handleBoardSelect = useCallback(
    (boardId: string) => {
      onMoveTask(boardId);
    },
    [onMoveTask]
  );

  // メニュートリガー設定
  const trigger: MenuTrigger = useMemo(
    () => ({
      type: 'custom',
      customTrigger: (
        <Button
          variant='outline'
          size='default'
          disabled={disabled}
          className='flex-1 flex items-center justify-center gap-2'
        >
          <ArrowRight size={16} />
          {t('task.move')}
        </Button>
      ),
    }),
    [disabled, t]
  );

  // メニューグループ設定
  const menuGroups: MenuGroup[] = useMemo(() => {
    const groups: MenuGroup[] = [];

    // 移動先ボードグループ
    if (availableBoards.length > 0) {
      groups.push({
        id: 'available-boards',
        label: t('task.selectTargetBoard'),
        items: availableBoards.map(board => {
          const taskCount = board.columns.reduce(
            (sum, col) => sum + col.tasks.length,
            0
          );
          return {
            id: board.id,
            type: 'selectable',
            label: board.title,
            icon: FolderKanban,
            selected: false,
            description: t('task.boardInfo', {
              columns: board.columns.length,
              tasks: taskCount,
            }),
            onSelect: () => handleBoardSelect(board.id),
          };
        }),
      });
    }

    // 現在のボードグループ（情報表示のみ）
    if (currentBoard) {
      groups.push({
        id: 'current-board',
        label: t('board.currentBoard'),
        items: [
          {
            id: 'current',
            type: 'selectable',
            label: currentBoard.title,
            icon: FolderKanban,
            selected: true,
            disabled: true,
            description: t('board.currentBoard'),
            onSelect: () => {}, // 何もしない
          },
        ],
      });
    }

    return groups;
  }, [availableBoards, currentBoard, handleBoardSelect, t]);

  // 移動可能なボードがない場合は表示しない
  if (availableBoards.length === 0) {
    return null;
  }

  return <UnifiedMenu groups={menuGroups} trigger={trigger} />;
};

export default TaskBoardMover;
