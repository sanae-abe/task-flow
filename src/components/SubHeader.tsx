import React, { useState, useMemo } from 'react';
import { Box, Button, ActionMenu, ActionList } from '@primer/react';
import { PencilIcon, PlusIcon, TrashIcon, KebabHorizontalIcon, CheckCircleIcon } from '@primer/octicons-react';
import { useKanban } from '../contexts/KanbanContext';
import { useTaskStats } from '../hooks/useTaskStats';
import ConfirmDialog from './ConfirmDialog';
import TaskStatsDisplay from './TaskStatsDisplay';
import BoardEditDialog from './BoardEditDialog';
import ColumnCreateDialog from './ColumnCreateDialog';

const SubHeader: React.FC = () => {
  const { state, updateBoard, createColumn, deleteBoard, clearCompletedTasks } = useKanban();
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showClearCompletedConfirm, setShowClearCompletedConfirm] = useState(false);

  const allTasks = useMemo(() => {
    if (!state.currentBoard) {
      return [];
    }
    // 右端のカラム（完了カラム）を除いた未完了タスクのみを取得
    const incompleteTasks = state.currentBoard.columns
      .slice(0, -1) // 右端のカラムを除外
      .flatMap(column => column.tasks);
    return incompleteTasks;
  }, [state.currentBoard]);

  const taskStats = useTaskStats(allTasks);

  // 完了したタスクがあるかどうかを確認
  const hasCompletedTasks = useMemo(() => {
    if (!state.currentBoard || state.currentBoard.columns.length === 0) {
      return false;
    }
    const rightmostColumn = state.currentBoard.columns[state.currentBoard.columns.length - 1];
    return rightmostColumn ? rightmostColumn.tasks.length > 0 : false;
  }, [state.currentBoard]);

  if (!state.currentBoard) {
    return null;
  }

  const handleStartCreateColumn = () => {
    setIsCreatingColumn(true);
  };

  const handleEditBoardTitle = (newTitle: string) => {
    if (state.currentBoard) {
      updateBoard(state.currentBoard.id, { title: newTitle });
      setShowEditDialog(false);
    }
  };

  const handleCreateColumn = (title: string) => {
    createColumn(title);
    setIsCreatingColumn(false);
  };

  const handleCancelCreateColumn = () => {
    setIsCreatingColumn(false);
  };

  const handleDeleteBoard = () => {
    if (state.currentBoard && state.boards.length > 1) {
      deleteBoard(state.currentBoard.id);
      setShowDeleteConfirm(false);
    }
  };

  const handleClearCompletedTasks = () => {
    clearCompletedTasks();
    setShowClearCompletedConfirm(false);
  };


  return (
    <Box
      sx={{
        position: 'fixed',
        top: '67px',
        left: 0,
        right: 0,
        bg: 'canvas.default',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        px: 6,
        py: 2,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <TaskStatsDisplay stats={taskStats} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          size="small"
          variant="invisible"
          onClick={handleStartCreateColumn}
        >
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
          }}>
            <PlusIcon size={16} />
            新しいカラム
          </span>
        </Button> 
        <ActionMenu>
          <ActionMenu.Anchor>
            <Button
              size="small"
              variant="invisible"
            >
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
              }}>
                <KebabHorizontalIcon size={16} />
                ボード設定
              </span>
            </Button>
          </ActionMenu.Anchor>
          <ActionMenu.Overlay>
            <ActionList>
              {hasCompletedTasks && (
                <ActionList.Item onSelect={() => setShowClearCompletedConfirm(true)}>
                  <ActionList.LeadingVisual>
                    <CheckCircleIcon size={16} />
                  </ActionList.LeadingVisual>
                  完了したタスクをクリア
                </ActionList.Item>
              )}
              <ActionList.Item onSelect={() => setShowEditDialog(true)}>
                <ActionList.LeadingVisual>
                  <PencilIcon size={16} />
                </ActionList.LeadingVisual>
                ボード名を編集
              </ActionList.Item>
              {state.boards.length > 1 && (
                <ActionList.Item
                  variant="danger"
                  onSelect={() => setShowDeleteConfirm(true)}
                >
                  <ActionList.LeadingVisual>
                    <TrashIcon size={16} />
                  </ActionList.LeadingVisual>
                  ボードを削除
                </ActionList.Item>
              )}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>

      </Box>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="プロジェクトを削除"
        message={`「${state.currentBoard?.title}」を削除しますか？この操作は元に戻せません。`}
        onConfirm={handleDeleteBoard}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showClearCompletedConfirm}
        title="完了したタスクをクリア"
        message="完了したタスクをすべて削除しますか？この操作は元に戻せません。"
        onConfirm={handleClearCompletedTasks}
        onCancel={() => setShowClearCompletedConfirm(false)}
      />

      <BoardEditDialog
        isOpen={showEditDialog}
        currentTitle={state.currentBoard?.title || ''}
        onSave={handleEditBoardTitle}
        onCancel={() => setShowEditDialog(false)}
      />

      <ColumnCreateDialog
        isOpen={isCreatingColumn}
        onSave={handleCreateColumn}
        onCancel={handleCancelCreateColumn}
      />
    </Box>
  );
};

export default SubHeader;