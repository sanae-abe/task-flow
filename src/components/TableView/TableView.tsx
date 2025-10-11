import React, { useCallback } from 'react';
import { Text, Box } from '@primer/react';
import type { TaskWithColumn } from '../../types/table';

import { useKanban } from '../../contexts/KanbanContext';
import { useTableColumns } from '../../contexts/TableColumnsContext';
import DeleteConfirmDialog from '../DeleteConfirmDialog';

// カスタムフック
import { useTableData, useTableActions, useDeleteConfirm } from './hooks';

// コンポーネント
import { TableCell, TableRow, TableHeader, EmptyState } from './components';

// ユーティリティ
import { getCompletionRate } from './utils/tableHelpers';

/**
 * テーブルビューコンポーネント
 *
 * タスクをテーブル形式で表示します。
 * モジュラー化により以下の責任分離を実現：
 * - useTableData：データの取得と変換
 * - useTableActions：テーブル操作の管理
 * - useDeleteConfirm：削除確認ダイアログの管理
 * - TableHeader：ヘッダー行の表示
 * - TableRow：データ行の表示
 * - TableCell：各セルの表示
 * - EmptyState：空状態の表示
 */
const TableView: React.FC = () => {
  const { state, moveTask, deleteTask, setTaskFilter, openTaskDetail } = useKanban();
  const tableColumnsData = useTableColumns();

  // カスタムフック: 削除確認ダイアログ管理
  const { deleteConfirmDialog, setDeleteConfirmDialog } = useDeleteConfirm();

  // カスタムフック: テーブルデータ管理
  const { filteredAndSortedTasks } = useTableData(
    state.currentBoard,
    state.taskFilter,
    state.sortOption
  );

  // カスタムフック: テーブルアクション管理
  const tableActions = useTableActions(
    state.currentBoard,
    moveTask,
    deleteTask,
    openTaskDetail,
    deleteConfirmDialog,
    setDeleteConfirmDialog
  );

  // セル描画関数
  const renderCell = useCallback((task: TaskWithColumn, columnId: string) => (
      <TableCell
        task={task}
        columnId={columnId}
        currentBoard={state.currentBoard}
        onStatusChange={tableActions.handleStatusChange}
        onDeleteClick={tableActions.handleTaskDeleteClick}
        getCompletionRate={getCompletionRate}
      />
    ), [state.currentBoard, tableActions.handleStatusChange, tableActions.handleTaskDeleteClick]);

  // フィルタクリア処理
  const handleClearFilter = useCallback(() => {
    setTaskFilter({ type: 'all', label: 'すべてのタスク' });
  }, [setTaskFilter]);

  // 早期リターン：ボードが選択されていない場合
  if (!state.currentBoard) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 120px)',
          color: 'fg.default',
        }}
      >
        <Text>ボードを選択してください</Text>
      </Box>
    );
  }

  return (
    <Box
      key={`tableview-${tableColumnsData.forceRender}`}
      sx={{
        height: 'calc(100vh - 120px)',
        overflow: 'auto',
        bg: 'canvas.subtle',
        p: '32px',
      }}
    >
      {/* メインテーブル */}
      <Box
        key={`table-${tableColumnsData.forceRender}`}
        sx={{
          borderRadius: 2,
          overflow: 'auto',
          bg: 'canvas.default',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          minWidth: 'fit-content',
        }}
      >
        {/* ヘッダー行 */}
        <TableHeader
          visibleColumns={tableColumnsData.visibleColumns}
          gridTemplateColumns={tableColumnsData.gridTemplateColumns}
          taskCount={filteredAndSortedTasks.length}
        />

        {/* データ行 */}
        {filteredAndSortedTasks.map((task, index) => (
          <TableRow
            key={task.id}
            task={task}
            index={index}
            totalTasks={filteredAndSortedTasks.length}
            visibleColumns={tableColumnsData.visibleColumns}
            gridTemplateColumns={tableColumnsData.gridTemplateColumns}
            onTaskClick={tableActions.handleTaskClick}
            renderCell={renderCell}
          />
        ))}
      </Box>

      {/* 空状態 */}
      {filteredAndSortedTasks.length === 0 && (
        <EmptyState
          taskFilter={state.taskFilter}
          onClearFilter={handleClearFilter}
        />
      )}

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        isOpen={deleteConfirmDialog.isOpen}
        onClose={tableActions.handleDeleteDialogClose}
        onConfirm={tableActions.handleTaskDelete}
        taskTitle={deleteConfirmDialog.task?.title || ''}
      />
    </Box>
  );
};

export default TableView;