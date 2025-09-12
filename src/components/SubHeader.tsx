import { PlusIcon } from '@primer/octicons-react';
import { Box } from '@primer/react';
import React from 'react';

import { useKanban } from '../contexts/KanbanContext';
import { useSubHeader } from '../hooks/useSubHeader';

import BoardActionMenu from './BoardActionMenu';
import BoardEditDialog from './BoardEditDialog';
import ColumnCreateDialog from './ColumnCreateDialog';
import ConfirmDialog from './ConfirmDialog';
import { DataImportDialog } from './DataImportDialog';
import SubHeaderButton from './SubHeaderButton';
import TaskSortSelector from './TaskSortSelector';
import TaskStatsDisplay from './TaskStatsDisplay';

const SubHeader: React.FC = () => {
  const { setSortOption } = useKanban();
  const {
    state,
    dialogState,
    taskStats,
    hasCompletedTasks,
    canDeleteBoard,
    handlers,
  } = useSubHeader();

  if (!state.currentBoard) {
    return null;
  }


  return (
    <Box
      sx={{
        bg: 'canvas.default',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        px: 6,
        py: 2,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <TaskStatsDisplay stats={taskStats} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TaskSortSelector
          currentSort={state.sortOption}
          onSortChange={setSortOption}
        />
        <Box
          sx={{
            width: '1px',
            height: '24px',
            bg: 'border.default',
          }}
        />
        <SubHeaderButton
          icon={PlusIcon}
          onClick={handlers.startCreateColumn}
        >
          新しいカラム
        </SubHeaderButton>
        
        <BoardActionMenu
          hasCompletedTasks={hasCompletedTasks}
          canDeleteBoard={canDeleteBoard}
          onEditBoard={handlers.openEditDialog}
          onDeleteBoard={handlers.openDeleteConfirm}
          onClearCompletedTasks={handlers.openClearCompletedConfirm}
          onExportData={handlers.exportAllData}
          onExportBoard={handlers.exportCurrentBoard}
          onImportData={handlers.openImportDialog}
        />
      </Box>

      <ConfirmDialog
        isOpen={dialogState.showDeleteConfirm}
        title="プロジェクトを削除"
        message={`「${state.currentBoard.title}」を削除しますか？この操作は元に戻せません。`}
        onConfirm={handlers.deleteBoard}
        onCancel={handlers.closeDeleteConfirm}
      />

      <ConfirmDialog
        isOpen={dialogState.showClearCompletedConfirm}
        title="完了したタスクをクリア"
        message="完了したタスクをすべて削除しますか？この操作は元に戻せません。"
        onConfirm={handlers.clearCompletedTasks}
        onCancel={handlers.closeClearCompletedConfirm}
      />

      <BoardEditDialog
        isOpen={dialogState.showEditDialog}
        currentTitle={state.currentBoard.title}
        onSave={handlers.editBoardTitle}
        onCancel={handlers.closeEditDialog}
      />

      <ColumnCreateDialog
        isOpen={dialogState.isCreatingColumn}
        onSave={handlers.createColumn}
        onCancel={handlers.cancelCreateColumn}
      />

      <DataImportDialog
        isOpen={dialogState.showImportDialog}
        onClose={handlers.closeImportDialog}
      />
    </Box>
  );
};

export default SubHeader;