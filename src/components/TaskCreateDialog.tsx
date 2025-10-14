import { UnderlineNav } from "@primer/react";
import { useState, memo } from "react";

import type { TaskTemplate } from "../types/template";
import type { CreateMode } from "./TaskCreateDialog/types";
import { useKanban } from "../contexts/KanbanContext";
import { useBoard } from "../contexts/BoardContext";
import { useNotify } from "../contexts/NotificationContext";

import UnifiedDialog from "./shared/Dialog/UnifiedDialog";

// カスタムフック
import {
  useTaskForm,
  useTemplateSelection,
  useTaskSubmission,
} from "./TaskCreateDialog/hooks";

// コンポーネント
import {
  TemplateSelector,
  TaskFormFields,
} from "./TaskCreateDialog/components";

/**
 * タスク作成ダイアログコンポーネント
 *
 * タスクの新規作成機能を提供します：
 * - 通常作成モード：フォームから手動でタスクを作成
 * - テンプレート作成モード：事前定義されたテンプレートから作成
 *
 * モジュラー化により以下の責任分離を実現：
 * - useTaskForm：フォーム状態管理
 * - useTemplateSelection：テンプレート選択管理
 * - useTaskSubmission：保存・送信処理
 * - TemplateSelector：テンプレート選択UI
 * - TaskFormFields：フォームフィールド群
 */

const TaskCreateDialog = memo(() => {
  const { state, closeTaskForm, createTask } = useKanban();
  const { state: boardState, setCurrentBoard } = useBoard();
  const notify = useNotify();

  // 作成モード
  const [createMode, setCreateMode] = useState<CreateMode>("normal");

  // カスタムフック: フォーム状態管理
  const { formState, formActions, handleTimeChange, isFormValid } = useTaskForm(
    state.isTaskFormOpen,
    state.taskFormDefaultDate
      ? state.taskFormDefaultDate.toISOString().split("T")[0]
      : undefined,
    state.currentBoard?.id,
  );

  // カスタムフック: テンプレート選択管理
  const { templateState, templateActions, resetTemplateSelection } =
    useTemplateSelection(state.isTaskFormOpen, formActions);

  // カスタムフック: タスク保存・送信処理
  const { handleKeyPress, actions } = useTaskSubmission(
    formState,
    templateState.selectedTemplate,
    isFormValid,
    createTask,
    closeTaskForm,
    notify,
    state.currentBoard,
    state.taskFormDefaultStatus,
    boardState.boards,
    setCurrentBoard,
  );

  // テンプレート選択時の処理（モード切り替えを含む）
  const handleTemplateSelect = (template: TaskTemplate) => {
    templateActions.handleTemplateSelect(template);
    // テンプレート選択後は通常作成モードに切り替え
    setCreateMode("normal");
  };

  // ダイアログが閉じられた時の追加処理
  const handleDialogClose = () => {
    setCreateMode("normal");
    resetTemplateSelection();
    closeTaskForm();
  };

  // 早期リターン：ダイアログが開いていない場合
  if (!state.isTaskFormOpen || !state.currentBoard) {
    return null;
  }

  return (
    <UnifiedDialog
      variant="modal"
      isOpen={state.isTaskFormOpen}
      title="新しいタスクを作成"
      onClose={handleDialogClose}
      ariaLabelledBy="task-create-dialog-title"
      size="large"
      actions={actions}
    >
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "600px" }}
      >
        {/* タブナビゲーション */}
        <div style={{ marginBottom: "16px" }}>
          <UnderlineNav
            aria-label="タスク作成モード選択"
            sx={{ padding: 0, transform: "translateY(-8px)" }}
          >
            <UnderlineNav.Item
              aria-current={createMode === "normal" ? "page" : undefined}
              onSelect={() => setCreateMode("normal")}
            >
              通常作成
            </UnderlineNav.Item>
            <UnderlineNav.Item
              aria-current={createMode === "template" ? "page" : undefined}
              onSelect={() => setCreateMode("template")}
            >
              テンプレートから作成
            </UnderlineNav.Item>
          </UnderlineNav>
        </div>

        {/* テンプレート選択モード */}
        {createMode === "template" && (
          <div style={{ marginBottom: "24px", flex: 1, minHeight: "500px" }}>
            <TemplateSelector
              templates={templateState.templates}
              onSelect={handleTemplateSelect}
            />
          </div>
        )}

        {/* 通常作成フォーム */}
        {createMode === "normal" && (
          <TaskFormFields
            formState={formState}
            formActions={formActions}
            selectedTemplate={templateState.selectedTemplate}
            onTimeChange={handleTimeChange}
            onKeyPress={handleKeyPress}
            availableBoards={boardState.boards}
          />
        )}
      </div>
    </UnifiedDialog>
  );
});

TaskCreateDialog.displayName = "TaskCreateDialog";

export default TaskCreateDialog;
