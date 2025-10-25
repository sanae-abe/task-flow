import { useState, memo, useMemo } from "react";
import { cn } from '@/lib/utils';

import type { TaskTemplate } from "../types/template";
import type { CreateMode } from "./TaskCreateDialog/types";
import { useKanban } from "../contexts/KanbanContext";
import { useBoard } from "../contexts/BoardContext";
import { useSonnerNotify } from "../hooks/useSonnerNotify";
import { useFormChangeDetector } from "../hooks/useFormChangeDetector";

import UnifiedDialog from "./shared/Dialog/UnifiedDialog";
import ConfirmDialog from "./ConfirmDialog";

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
  const notify = useSonnerNotify();

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

  // フォーム変更検知のためのデータ
  const formDataForDetection = useMemo(() => ({
    ...formState,
    createMode,
    selectedTemplate: templateState.selectedTemplate,
  }), [formState, createMode, templateState.selectedTemplate]);

  // フォーム変更検知
  const {
    showCloseConfirm,
    handleClose,
    handleConfirmClose,
    handleCancelClose,
  } = useFormChangeDetector(formDataForDetection, state.isTaskFormOpen);

  // テンプレート選択時の処理（モード切り替えを含む）
  const handleTemplateSelect = (template: TaskTemplate) => {
    templateActions.handleTemplateSelect(template);
    // テンプレート選択後は通常作成モードに切り替え
    setCreateMode("normal");
  };

  // ダイアログが閉じられた時の処理（確認機能付き）
  const handleDialogClose = () => {
    const actualClose = () => {
      setCreateMode("normal");
      resetTemplateSelection();
      closeTaskForm();
    };

    handleClose(actualClose);
  };

  // 早期リターン：ダイアログが開いていない場合
  if (!state.isTaskFormOpen || !state.currentBoard) {
    return null;
  }

  return (
    <>
      <UnifiedDialog
        variant="modal"
        isOpen={state.isTaskFormOpen}
        title="新しいタスクを作成"
        onClose={handleDialogClose}
        ariaLabelledBy="task-create-dialog-title"
        size="large"
        actions={actions}
      >
        <div className="flex flex-col min-h-[600px]">
          {/* タブナビゲーション */}
          <div className="mb-4 -mt-2">
            <nav
              role="tablist"
              aria-label="タスク作成モード選択"
              className="flex border-b border-gray-200"
            >
              <button
                role="tab"
                aria-selected={createMode === "normal"}
                aria-current={createMode === "normal" ? "page" : undefined}
                onClick={() => setCreateMode("normal")}
                className={cn(
                  "px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors",
                  createMode === "normal"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                通常作成
              </button>
              <button
                role="tab"
                aria-selected={createMode === "template"}
                aria-current={createMode === "template" ? "page" : undefined}
                onClick={() => setCreateMode("template")}
                className={cn(
                  "px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors",
                  createMode === "template"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                テンプレートから作成
              </button>
            </nav>
          </div>

          {/* テンプレート選択モード */}
          {createMode === "template" && (
            <div className="mb-6 flex-1 min-h-[500px]">
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

      <ConfirmDialog
        isOpen={showCloseConfirm}
        title="変更を破棄しますか？"
        message="入力した内容が失われますが、よろしいですか？"
        confirmText="破棄する"
        cancelText="戻る"
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
      />
    </>
  );
});

TaskCreateDialog.displayName = "TaskCreateDialog";

export default TaskCreateDialog;
