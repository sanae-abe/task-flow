import {
  DndContext,
  DragOverlay,
  pointerWithin,
  type CollisionDetection,
} from "@dnd-kit/core";
import { Text, Box } from "@primer/react";
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
      <Box sx={KANBAN_BOARD_STYLES.emptyState}>
        <Text sx={KANBAN_BOARD_STYLES.emptyStateText}>
          Please select a board
        </Text>
      </Box>
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
      // タスクとカラムが重なっている場合、タスクを優先
      const taskIntersections = pointerIntersections.filter((intersection) =>
        currentBoard?.columns.some((column) =>
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
    <Box sx={KANBAN_BOARD_STYLES.container}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box sx={KANBAN_BOARD_STYLES.columnsContainer}>
          {currentBoard.columns.map((column, index) => (
            <KanbanColumn
              key={column.id}
              column={column}
              columnIndex={index}
              totalColumns={currentBoard.columns.length}
              onTaskClick={handleTaskClick}
              keyboardDragAndDrop={keyboardDragAndDrop}
            />
          ))}
        </Box>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} columnId="" /> : null}
        </DragOverlay>
      </DndContext>
    </Box>
  );
};

export default KanbanBoard;
