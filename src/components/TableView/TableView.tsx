import React, { useCallback, useState } from "react";
import type { TaskWithColumn } from "../../types/table";
import type { Task } from "../../types";

import { useKanban } from "../../contexts/KanbanContext";
import { useTableColumns } from "../../contexts/TableColumnsContext";
import DeleteConfirmDialog from "../DeleteConfirmDialog";
import TaskEditDialog from "../TaskEditDialog";

// カスタムフック
import { useTableData, useTableActions, useDeleteConfirm } from "./hooks";

// コンポーネント
import { TableCell, TableRow, TableHeader, EmptyState } from "./components";

// ユーティリティ
import { getCompletionRate } from "./utils/tableHelpers";

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
  const { state, moveTask, deleteTask, updateTask, setTaskFilter, openTaskDetail } =
    useKanban();
  const tableColumnsData = useTableColumns();

  // TaskEditDialog状態管理
  const [editingTask, setEditingTask] = useState<TaskWithColumn | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // カスタムフック: 削除確認ダイアログ管理
  const { deleteConfirmDialog, setDeleteConfirmDialog } = useDeleteConfirm();

  // カスタムフック: テーブルデータ管理
  const { filteredAndSortedTasks } = useTableData(
    state.currentBoard,
    state.taskFilter,
    state.sortOption,
  );

  // カスタムフック: テーブルアクション管理
  const tableActions = useTableActions(
    state.currentBoard,
    moveTask,
    deleteTask,
    openTaskDetail,
    deleteConfirmDialog,
    setDeleteConfirmDialog,
  );

  // タスク編集ハンドラー - TaskEditDialogを直接開く
  const handleTaskEdit = useCallback((task: TaskWithColumn) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  }, []);

  // TaskEditDialog: 保存ハンドラー
  const handleEditSave = useCallback((updatedTask: Task) => {
    updateTask(updatedTask.id, updatedTask);
    setIsEditDialogOpen(false);
    setEditingTask(null);
  }, [updateTask]);

  // TaskEditDialog: 削除ハンドラー
  const handleEditDelete = useCallback((taskId: string) => {
    if (editingTask) {
      deleteTask(taskId, editingTask.columnId);
      setIsEditDialogOpen(false);
      setEditingTask(null);
    }
  }, [deleteTask, editingTask]);

  // TaskEditDialog: キャンセルハンドラー
  const handleEditCancel = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingTask(null);
  }, []);

  // セル描画関数
  const renderCell = useCallback(
    (task: TaskWithColumn, columnId: string) => (
      <TableCell
        task={task}
        columnId={columnId}
        currentBoard={state.currentBoard}
        onStatusChange={tableActions.handleStatusChange}
        onDeleteClick={tableActions.handleTaskDeleteClick}
        onEditClick={handleTaskEdit}
        getCompletionRate={getCompletionRate}
      />
    ),
    [
      state.currentBoard,
      tableActions.handleStatusChange,
      tableActions.handleTaskDeleteClick,
      handleTaskEdit,
    ],
  );

  // フィルタクリア処理
  const handleClearFilter = useCallback(() => {
    setTaskFilter({ type: "all", label: "すべてのタスク" });
  }, [setTaskFilter]);

  // 早期リターン：ボードが選択されていない場合
  if (!state.currentBoard) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 112px)",
          color: "hsl(var(--foreground))",
        }}
      >
        <span className="text-foreground">ボードを選択してください</span>
      </div>
    );
  }

  return (
    <div
      key={`tableview-${tableColumnsData.forceRender}`}
      style={{
        backgroundColor: "hsl(var(--muted))"
      }}
      className="h-[calc(100vh-120px)] overflow-auto p-8"
    >
      {/* メインテーブル */}
      <div
        key={`table-${tableColumnsData.forceRender}`}
        style={{
          borderRadius: 2,
          overflow: "auto",
          backgroundColor: "hsl(var(--background))",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          minWidth: "fit-content",
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
      </div>

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
        taskTitle={deleteConfirmDialog.task?.title || ""}
      />

      {/* タスク編集ダイアログ */}
      <TaskEditDialog
        task={editingTask}
        isOpen={isEditDialogOpen}
        onSave={handleEditSave}
        onDelete={handleEditDelete}
        onCancel={handleEditCancel}
      />
    </div>
  );
};

export default TableView;
