import {
  Plus,
  Calendar,
  Columns3,
  ChevronDown,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

import { useKanban } from "../contexts/KanbanContext";
import { useSubHeader } from "../hooks/useSubHeader";
import { useViewRoute } from "../hooks/useViewRoute";

import BoardActionMenu from "./BoardActionMenu";
import BoardCreateDialog from "./BoardCreateDialog";
import BoardEditDialog from "./BoardEditDialog";
import ColumnCreateDialog from "./ColumnCreateDialog";
import ConfirmDialog from "./ConfirmDialog";
import FilterSelector from "./FilterSelector";
import SubHeaderButton from "./SubHeaderButton";
import TaskSortSelector from "./TaskSortSelector";
import TaskStatsDisplay from "./TaskStatsDisplay";

const SubHeader: React.FC = () => {
  const { setSortOption, setTaskFilter } = useKanban();
  const { navigateToView } = useViewRoute();
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
    if (!state.currentBoard) {
      return [];
    }
    const labelMap = new Map();
    state.currentBoard.columns
      .filter(column => column.deletionState !== "deleted")
      .forEach((column) => {
        column.tasks.forEach((task) => {
          task.labels?.forEach((label) => {
            // ラベル名で重複を除去し、同じ名前のラベルは1つだけ表示
            if (!labelMap.has(label.name)) {
              labelMap.set(label.name, label);
            }
          });
        });
      });
    return Array.from(labelMap.values());
  }, [state.currentBoard]);

  // カラム情報を位置指定のために準備
  const currentColumns = React.useMemo(() => {
    if (!state.currentBoard) {
      return [];
    }
    return state.currentBoard.columns
      .filter(column => column.deletionState !== "deleted")
      .map((column) => ({
        id: column.id,
        title: column.title,
      }));
  }, [state.currentBoard]);

  if (!state.currentBoard) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-5 py-2 z-[999] flex items-center justify-between w-full overflow-hidden">
      <TaskStatsDisplay stats={taskStats} />

      <div className="flex items-center gap-1">
        <FilterSelector
          currentFilter={state.taskFilter}
          onFilterChange={setTaskFilter}
          availableLabels={availableLabels}
        />
        <TaskSortSelector
          currentSort={state.sortOption}
          onSortChange={setSortOption}
        />
        <div className="w-px h-6 bg-gray-200" />
        {state.viewMode === "kanban" && (
          <SubHeaderButton icon={Plus} onClick={handlers.startCreateColumn}>
            カラム追加
          </SubHeaderButton>
        )}

        <BoardActionMenu
          hasCompletedTasks={hasCompletedTasks}
          canDeleteBoard={canDeleteBoard}
          onCreateBoard={handlers.startCreateBoard}
          onEditBoard={handlers.openEditDialog}
          onDeleteBoard={handlers.openDeleteConfirm}
          onClearCompletedTasks={handlers.openClearCompletedConfirm}
        />

        <div className="w-px h-6 bg-gray-200" />

        {/* View Mode DropdownMenu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="ビューモードを選択"
              className="flex items-center gap-2"
            >
              {state.viewMode === "kanban" ? (
                <Columns3 size={16} />
              ) : state.viewMode === "calendar" ? (
                <Calendar size={16} />
              ) : (
                <Table size={16} />
              )}
              {state.viewMode === "kanban"
                ? "カンバン"
                : state.viewMode === "calendar"
                  ? "カレンダー"
                  : "テーブル"}
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigateToView("kanban")}
              className="flex items-center gap-2"
            >
              <Columns3 size={16} />
              カンバン
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigateToView("calendar")}
              className="flex items-center gap-2"
            >
              <Calendar size={16} />
              カレンダー
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigateToView("table")}
              className="flex items-center gap-2"
            >
              <Table size={16} />
              テーブル
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        isOpen={dialogState.showDeleteConfirm}
        title="プロジェクトを削除"
        message={`「${state.currentBoard.title}」を削除しますか？`}
        onConfirm={handlers.deleteBoard}
        onCancel={handlers.closeDeleteConfirm}
      />

      <ConfirmDialog
        isOpen={dialogState.showClearCompletedConfirm}
        title="完了したタスクをクリア"
        message="完了したタスクをすべて削除しますか？"
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
        columns={currentColumns}
      />

      <BoardCreateDialog
        isOpen={dialogState.isCreatingBoard}
        onSave={handlers.createBoard}
        onCancel={handlers.cancelCreateBoard}
      />
    </div>
  );
};

export default SubHeader;
