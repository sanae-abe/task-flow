import {
  DndContext,
  DragOverlay,
  pointerWithin,
  type CollisionDetection,
} from "@dnd-kit/core";
import { Text } from "@primer/react";
import React from "react";

import { useBoard } from "../contexts/BoardContext";
import { useTask } from "../contexts/TaskContext";
import { useUI } from "../contexts/UIContext";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useKeyboardDragAndDrop } from "../hooks/useKeyboardDragAndDrop";
import { KANBAN_BOARD_STYLES } from "../styles/kanbanBoardStyles";
import type { Task } from "../types";

import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";

const KanbanBoard: React.FC = () => {
  const { currentBoard } = useBoard();
  const { moveTask } = useTask();
  const { setSortOption, openTaskDetail } = useUI();

  const {
    activeTask,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDragAndDrop({
    board: currentBoard,
    onMoveTask: moveTask,
    onSortToManual: () => setSortOption("manual"),
  });

  const keyboardDragAndDrop = useKeyboardDragAndDrop({
    board: currentBoard,
    onMoveTask: moveTask,
    onSortToManual: () => setSortOption("manual"),
  });

  if (!currentBoard) {
    return (
      <div style={KANBAN_BOARD_STYLES.emptyState}>
        <Text sx={KANBAN_BOARD_STYLES.emptyStateText}>
          Please select a board
        </Text>
      </div>
    );
  }

  const handleTaskClick = (task: Task) => {
    openTaskDetail(task.id);
  };

  // 厳密な衝突検出 - pointerWithinのみ使用で範囲外ドロップを正確に検出
  const collisionDetectionStrategy: CollisionDetection = (args) => {
    // pointerWithinのみを使用して最も厳密な検出
    const pointerIntersections = pointerWithin(args);

    if (pointerIntersections.length > 0) {
      // タスクとカラムが重なっている場合、タスクを優先（削除済みカラムは除外）
      const taskIntersections = pointerIntersections.filter((intersection) =>
        currentBoard?.columns
          .filter(column => column.deletionState !== "deleted")
          .some((column) =>
            column.tasks.some((task) => task.id === intersection.id),
          ),
      );

      if (taskIntersections.length > 0) {
        return taskIntersections.slice(0, 1); // 最初のタスクを返す
      }

      return pointerIntersections.slice(0, 1); // カラムを返す
    }

    // 範囲外ドロップの場合は空配列を返す
    return [];
  };

  return (
    <div style={KANBAN_BOARD_STYLES.container}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div style={KANBAN_BOARD_STYLES.columnsContainer}>
          {currentBoard.columns
            .filter(column => column.deletionState !== "deleted")
            .map((column, index) => (
              <KanbanColumn
                key={column.id}
                column={column}
                columnIndex={index}
                totalColumns={currentBoard.columns.filter(col => col.deletionState !== "deleted").length}
                onTaskClick={handleTaskClick}
                keyboardDragAndDrop={keyboardDragAndDrop}
              />
            ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} columnId="" /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
