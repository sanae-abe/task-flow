import {
  PlusIcon,
  CalendarIcon,
  ProjectIcon,
  TriangleDownIcon,
  TableIcon,
} from "@primer/octicons-react";
import { ActionMenu, ActionList, Button } from "@primer/react";
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
    state.currentBoard.columns.forEach((column) => {
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
    return state.currentBoard.columns.map((column) => ({
      id: column.id,
      title: column.title,
    }));
  }, [state.currentBoard]);

  if (!state.currentBoard) {
    return null;
  }

  return (
    <div
      style={{
        background: "var(--bgColor-default)",
        borderBottom: "1px solid",
        borderColor: "var(--borderColor-default)",
        padding: "8px 20px",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <TaskStatsDisplay stats={taskStats} />

      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <FilterSelector
          currentFilter={state.taskFilter}
          onFilterChange={setTaskFilter}
          availableLabels={availableLabels}
        />
        <TaskSortSelector
          currentSort={state.sortOption}
          onSortChange={setSortOption}
        />
        <div
          style={{
            width: "1px",
            height: "24px",
            background: "var(--borderColor-default)",
          }}
        />
        {state.viewMode === "kanban" && (
          <SubHeaderButton icon={PlusIcon} onClick={handlers.startCreateColumn}>
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

        <div
          style={{
            width: "1px",
            height: "24px",
            background: "var(--borderColor-default)",
          }}
        />

        {/* View Mode ActionMenu */}
        <ActionMenu>
          <ActionMenu.Anchor>
            <Button
              variant="invisible"
              size="small"
              leadingVisual={
                state.viewMode === "kanban"
                  ? ProjectIcon
                  : state.viewMode === "calendar"
                    ? CalendarIcon
                    : TableIcon
              }
              trailingVisual={TriangleDownIcon}
              aria-label="ビューモードを選択"
            >
              {state.viewMode === "kanban"
                ? "カンバン"
                : state.viewMode === "calendar"
                  ? "カレンダー"
                  : "テーブル"}
            </Button>
          </ActionMenu.Anchor>
          <ActionMenu.Overlay>
            <ActionList selectionVariant="single">
              <ActionList.Item
                selected={state.viewMode === "kanban"}
                onSelect={() => navigateToView("kanban")}
              >
                <ActionList.LeadingVisual>
                  <ProjectIcon />
                </ActionList.LeadingVisual>
                カンバン
              </ActionList.Item>
              <ActionList.Item
                selected={state.viewMode === "calendar"}
                onSelect={() => navigateToView("calendar")}
              >
                <ActionList.LeadingVisual>
                  <CalendarIcon />
                </ActionList.LeadingVisual>
                カレンダー
              </ActionList.Item>
              <ActionList.Item
                selected={state.viewMode === "table"}
                onSelect={() => navigateToView("table")}
              >
                <ActionList.LeadingVisual>
                  <TableIcon />
                </ActionList.LeadingVisual>
                テーブル
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
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
