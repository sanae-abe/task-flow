import { Trash2, X, Edit, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useCallback, memo, useRef } from "react";

import { useTaskActions } from "../hooks/useTaskActions";
import { useTaskColumn } from "../hooks/useTaskColumn";
import { useUI } from "../contexts/UIContext";
import type { Task } from "../types";

import ConfirmDialog from "./ConfirmDialog";
import SubTaskList from "./SubTaskList";
import TaskDisplayContent from "./TaskDisplayContent";
import TaskEditDialog from "./TaskEditDialog";
import TaskMetadata from "./TaskMetadata";
import TaskBoardMover from "./TaskBoardMover";

interface TaskDetailSidebarProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailSidebar = memo<TaskDetailSidebarProps>(
  ({ task, isOpen, onClose }) => {
    const { state } = useUI();
    const { columnName } = useTaskColumn(task);
    const {
      showDeleteConfirm,
      showEditDialog,
      setShowDeleteConfirm,
      setShowEditDialog,
      handleEdit,
      handleDelete,
      handleDuplicate,
      handleMoveToBoard,
      handleConfirmDelete,
      handleSaveEdit,
      handleDeleteFromDialog,
      handleAddSubTask,
      handleToggleSubTask,
      handleEditSubTask,
      handleDeleteSubTask,
      handleReorderSubTasks,
    } = useTaskActions(task, onClose);

    // スクロール位置をリセットするためのref
    const sidebarRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // イベントハンドラーをメモ化
    const handleEscapeKey = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      },
      [onClose],
    );

    const handleEditDialogCancel = useCallback(() => {
      setShowEditDialog(false);
    }, [setShowEditDialog]);

    const handleDeleteConfirmCancel = useCallback(() => {
      setShowDeleteConfirm(false);
    }, [setShowDeleteConfirm]);


    useEffect(() => {
      if (isOpen) {
        document.addEventListener("keydown", handleEscapeKey);
      }

      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }, [isOpen, handleEscapeKey]);

    // タスクが変更された時にスクロール位置をトップにリセット
    useEffect(() => {
      if (isOpen && task) {
        // サイドバー全体とコンテンツ部分の両方をリセット
        if (sidebarRef.current) {
          sidebarRef.current.scrollTop = 0;
        }
        if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
      }
    }, [task, isOpen]);

    if (!isOpen || !task) {
      return null;
    }

    return (
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 w-[440px] h-screen bg-white shadow-2xl border-l border-gray-200 z-300 overflow-y-auto animate-[sidebar-slide-in-right_250ms_cubic-bezier(0.33,1,0.68,1)]"
        role="dialog"
        aria-label="タスク詳細"
        aria-modal="true"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex p-5 items-start justify-between border-b border-border border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-bold m-0 pr-3 break-words">
              {task.title}
            </h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              aria-label="タスク詳細を閉じる"
              className="flex-shrink-0 p-1 h-auto min-w-0"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Content */}
          <div ref={contentRef} className="flex-1 p-5 overflow-y-auto">
            <TaskDisplayContent
              task={task}
              columnName={columnName}
              virtualTaskInfo={state.virtualTaskInfo}
            />
            <SubTaskList
              subTasks={task.subTasks ?? []}
              onAddSubTask={handleAddSubTask}
              onToggleSubTask={handleToggleSubTask}
              onEditSubTask={handleEditSubTask}
              onDeleteSubTask={handleDeleteSubTask}
              onReorderSubTasks={handleReorderSubTasks}
            />
            <TaskMetadata task={task} />
          </div>

          {/* Actions */}
          <div className="p-3 border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-2">
              <Button
                onClick={handleEdit}
                variant="default"
                size="default"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                編集
              </Button>
              <Button
                onClick={handleDuplicate}
                variant="outline"
                size="default"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Copy size={16} />
                複製
              </Button>
              <TaskBoardMover onMoveTask={handleMoveToBoard} />
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="default"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                削除
              </Button>
            </div>
          </div>
        </div>

        <TaskEditDialog
          task={task}
          isOpen={showEditDialog}
          onSave={handleSaveEdit}
          onDelete={handleDeleteFromDialog}
          onCancel={handleEditDialogCancel}
        />

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="タスクを削除"
          message={`「${task.title}」を削除しますか？`}
          onConfirm={handleConfirmDelete}
          onCancel={handleDeleteConfirmCancel}
        />
      </div>
    );
  },
);

export default TaskDetailSidebar;
