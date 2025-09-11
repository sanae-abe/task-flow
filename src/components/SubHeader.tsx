import React, { useState, useMemo } from 'react';
import { Box, Button, TextInput, ActionMenu, ActionList } from '@primer/react';
import { PencilIcon, PlusIcon, CheckIcon, XIcon, TrashIcon, KebabHorizontalIcon } from '@primer/octicons-react';
import { useKanban } from '../contexts/KanbanContext';
import { useTaskStats } from '../hooks/useTaskStats';
import ConfirmDialog from './ConfirmDialog';
import TaskStatsDisplay from './TaskStatsDisplay';
import BoardEditDialog from './BoardEditDialog';

const SubHeader: React.FC = () => {
  const { state, updateBoard, createColumn, deleteBoard } = useKanban();
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const allTasks = useMemo(() => {
    if (!state.currentBoard) {
      return [];
    }
    return state.currentBoard.columns.flatMap(column => column.tasks);
  }, [state.currentBoard]);

  const taskStats = useTaskStats(allTasks);

  if (!state.currentBoard) {
    return null;
  }

  const handleStartCreateColumn = () => {
    setIsCreatingColumn(true);
    setNewColumnTitle('');
  };

  const handleEditBoardTitle = (newTitle: string) => {
    if (state.currentBoard) {
      updateBoard(state.currentBoard.id, { title: newTitle });
      setShowEditDialog(false);
    }
  };

  const handleCreateColumn = () => {
    if (newColumnTitle.trim()) {
      createColumn(newColumnTitle.trim());
      setIsCreatingColumn(false);
      setNewColumnTitle('');
    }
  };

  const handleCancelCreateColumn = () => {
    setIsCreatingColumn(false);
    setNewColumnTitle('');
  };

  const handleDeleteBoard = () => {
    if (state.currentBoard && state.boards.length > 1) {
      deleteBoard(state.currentBoard.id);
      setShowDeleteConfirm(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCreateColumn();
    } else if (event.key === 'Escape') {
      handleCancelCreateColumn();
    }
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
        py: 3,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <TaskStatsDisplay stats={taskStats} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {isCreatingColumn ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextInput
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="カラム名を入力"
              autoFocus
              size="small"
            />
            <Button
              size="small"
              onClick={handleCreateColumn}
              disabled={!newColumnTitle.trim()}
              sx={{ color: 'fg.onEmphasis !important', bg: 'btn.primary.bg !important' }}
            >
              <CheckIcon size={16} />
            </Button>
            <Button
              size="small"
              onClick={handleCancelCreateColumn}
            >
              <XIcon size={16} />
            </Button>
          </Box>
        ) : (
          <Button
            size="small"
            variant="primary"
            onClick={handleStartCreateColumn}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: 'fg.onEmphasis !important'
            }}
          >
            <PlusIcon size={16} />
            カラムを追加
          </Button>
        )}
        
        <ActionMenu>
          <ActionMenu.Anchor>
            <Button
              size="small"
              variant="invisible"
              sx={{ p: 1 }}
            >
              <KebabHorizontalIcon size={16} />
            </Button>
          </ActionMenu.Anchor>
          <ActionMenu.Overlay>
            <ActionList>
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

      <BoardEditDialog
        isOpen={showEditDialog}
        currentTitle={state.currentBoard?.title || ''}
        onSave={handleEditBoardTitle}
        onCancel={() => setShowEditDialog(false)}
      />
    </Box>
  );
};

export default SubHeader;