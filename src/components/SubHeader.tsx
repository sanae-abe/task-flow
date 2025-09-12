import { PlusIcon, CalendarIcon, ProjectIcon } from '@primer/octicons-react';
import { Box, Button, ButtonGroup } from '@primer/react';
import React from 'react';

import { useKanban } from '../contexts/KanbanContext';
import { useSubHeader } from '../hooks/useSubHeader';

import BoardActionMenu from './BoardActionMenu';
import BoardEditDialog from './BoardEditDialog';
import ColumnCreateDialog from './ColumnCreateDialog';
import ConfirmDialog from './ConfirmDialog';
import { DataImportDialog } from './DataImportDialog';
import FilterSelector from './FilterSelector';
import SubHeaderButton from './SubHeaderButton';
import TaskSortSelector from './TaskSortSelector';
import TaskStatsDisplay from './TaskStatsDisplay';

const SubHeader: React.FC = () => {
  const { setSortOption, setTaskFilter, setViewMode } = useKanban();
  const {
    state,
    dialogState,
    taskStats,
    hasCompletedTasks,
    canDeleteBoard,
    handlers,
  } = useSubHeader();

  // 利用可能なラベル一覧を取得（名前で重複除去）
  const availableLabels = React.useMemo(() => {
    if (!state.currentBoard) {return [];}
    const labelMap = new Map();
    state.currentBoard.columns.forEach(column => {
      column.tasks.forEach(task => {
        task.labels?.forEach(label => {
          // ラベル名で重複を除去し、同じ名前のラベルは1つだけ表示
          if (!labelMap.has(label.name)) {
            labelMap.set(label.name, label);
          }
        });
      });
    });
    return Array.from(labelMap.values());
  }, [state.currentBoard]);

  if (!state.currentBoard) {
    return null;
  }


  return (
    <Box
      sx={{
        bg: 'canvas.default',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        px: 5,
        py: 2,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <TaskStatsDisplay stats={taskStats} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ButtonGroup>
          <Button
            variant={state.viewMode === 'kanban' ? 'primary' : 'default'}
            size="small"
            leadingVisual={ProjectIcon}
            onClick={() => setViewMode('kanban')}
          >
            カンバン
          </Button>
          <Button
            variant={state.viewMode === 'calendar' ? 'primary' : 'default'}
            size="small"
            leadingVisual={CalendarIcon}
            onClick={() => setViewMode('calendar')}
          >
            カレンダー
          </Button>
        </ButtonGroup>
        
        <Box
          sx={{
            width: '1px',
            height: '24px',
            bg: 'border.default',
          }}
        />
        
        <FilterSelector
          currentFilter={state.taskFilter}
          onFilterChange={setTaskFilter}
          availableLabels={availableLabels}
        />
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
        {state.viewMode === 'kanban' && (
          <SubHeaderButton
            icon={PlusIcon}
            onClick={handlers.startCreateColumn}
          >
            新しいカラム
          </SubHeaderButton>
        )}
        
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