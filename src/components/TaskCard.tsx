import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useCallback } from "react";
import { cn } from "@/lib/utils";

import { useTaskCard } from "../hooks/useTaskCard";
import type { Task } from "../types";
import { formatDueDate } from "../utils/dateHelpers";

import ConfirmDialog from "./ConfirmDialog";
import DropIndicator from "./DropIndicator";
import TaskCardContent from "./TaskCardContent";
import TaskEditDialog from "./TaskEditDialog";

interface TaskCardProps {
  task: Task;
  columnId: string;
  onTaskClick?: (task: Task) => void;
  keyboardDragAndDrop?: {
    selectedTaskId: string | null;
    isDragMode: boolean;
    handleKeyDown: (event: React.KeyboardEvent, taskId: string) => void;
  };
}

const getCardDynamicStyles = (
  isRightmostColumn: boolean,
  isDragging: boolean,
  transform: { x: number; y: number; scaleX: number; scaleY: number } | null,
  transition: string | undefined,
) => ({
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.5 : isRightmostColumn ? 0.6 : 1,
});

const TaskCard: React.FC<TaskCardProps> = React.memo(
  ({ task, columnId, onTaskClick, keyboardDragAndDrop }) => {
    const taskCardData = useTaskCard(task, columnId);

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
      isOver,
    } = useSortable({ id: task.id });

    const handleTaskClick = useCallback(() => {
      if (onTaskClick) {
        onTaskClick(task);
      }
    }, [onTaskClick, task]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (keyboardDragAndDrop) {
          keyboardDragAndDrop.handleKeyDown(event, task.id);
        }
      },
      [keyboardDragAndDrop, task.id],
    );

    // キーボードドラッグ&ドロップ用のスタイル
    const isKeyboardSelected = keyboardDragAndDrop?.selectedTaskId === task.id;
    const isInDragMode = keyboardDragAndDrop?.isDragMode;

    const keyboardDragStyles =
      isKeyboardSelected && isInDragMode
        ? {
            outline: "2px solid #0969da",
            outlineOffset: "2px",
            boxShadow: "0 0 0 4px rgba(9, 105, 218, 0.3)",
          }
        : {};

    return (
      <>
        {/* タスクの上にドロップインジケーターを表示 */}
        <DropIndicator isVisible={isOver && !isDragging} />

        <div
          ref={setNodeRef}
          className={cn(
            "bg-white p-3 rounded-md cursor-grab shadow-[0px_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out",
            "w-full max-w-full min-w-0 min-h-fit h-auto",
            "break-words overflow-wrap-break-word flex flex-col",
            "hover:shadow-[0px_1px_8px_rgba(0,0,0,0.15)] active:cursor-grabbing"
          )}
          style={{
            ...getCardDynamicStyles(
              taskCardData.isRightmostColumn,
              isDragging,
              transform,
              transition,
            ),
            ...keyboardDragStyles,
          }}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...attributes}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...listeners}
          onClick={handleTaskClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`タスク: ${task.title}. キーボードでの移動にはSpaceキーまたはEnterキーを押してください。`}
          aria-pressed={isKeyboardSelected}
          data-task-id={task.id}
        >
          <TaskCardContent
            task={task}
            isOverdue={taskCardData.isOverdue}
            isDueToday={taskCardData.isDueToday}
            isDueTomorrow={taskCardData.isDueTomorrow}
            formatDueDate={formatDueDate}
            onEdit={(e: React.MouseEvent) => {
              e.stopPropagation();
              taskCardData.handleEdit();
            }}
            onDelete={(e: React.MouseEvent) => {
              e.stopPropagation();
              taskCardData.handleDelete();
            }}
            onComplete={(e: React.MouseEvent) => {
              e.stopPropagation();
              taskCardData.handleComplete();
            }}
            isRightmostColumn={taskCardData.isRightmostColumn}
          />
        </div>

        <TaskEditDialog
          task={task}
          isOpen={taskCardData.showEditDialog}
          onSave={taskCardData.handleSave}
          onDelete={taskCardData.handleDeleteFromDialog}
          onCancel={taskCardData.handleCancel}
        />

        <ConfirmDialog
          isOpen={taskCardData.showDeleteConfirm}
          title="タスクを削除"
          message={`「${task.title}」を削除しますか？`}
          onConfirm={taskCardData.handleConfirmDelete}
          onCancel={taskCardData.handleCancelDelete}
        />
      </>
    );
  },
);

TaskCard.displayName = "TaskCard";

export default TaskCard;
