import { DndContext, DragOverlay, closestCenter, pointerWithin, rectIntersection, type CollisionDetection } from '@dnd-kit/core';
import { Text, Box } from '@primer/react';
import React from 'react';

import { useBoard } from '../contexts/BoardContext';
import { useTask } from '../contexts/TaskContext';
import { useUI } from '../contexts/UIContext';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useKeyboardDragAndDrop } from '../hooks/useKeyboardDragAndDrop';
import { KANBAN_BOARD_STYLES } from '../styles/kanbanBoardStyles';
import type { Task } from '../types';

import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';

const KanbanBoard: React.FC = () => {
  const { currentBoard } = useBoard();
  const { moveTask } = useTask();
  const { setSortOption, openTaskDetail } = useUI();
  
  const { activeTask, sensors, handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop({
    board: currentBoard,
    onMoveTask: moveTask,
    onSortToManual: () => setSortOption('manual'),
  });

  const keyboardDragAndDrop = useKeyboardDragAndDrop({
    board: currentBoard,
    onMoveTask: moveTask,
    onSortToManual: () => setSortOption('manual'),
  });
  
  if (!currentBoard) {
    return (
      <Box sx={KANBAN_BOARD_STYLES.emptyState}>
        <Text sx={KANBAN_BOARD_STYLES.emptyStateText}>Please select a board</Text>
      </Box>
    );
  }

  const handleTaskClick = (task: Task) => {
    openTaskDetail(task.id);
  };

  // カスタム衝突検出アルゴリズム
  const collisionDetectionStrategy: CollisionDetection = (args) => {
    // まずpointerWithinで正確な位置を検出
    const pointerIntersections = pointerWithin(args);
    
    if (pointerIntersections.length > 0) {
      return pointerIntersections;
    }

    // フォールバックとしてrectIntersectionを使用
    const rectIntersections = rectIntersection(args);
    
    if (rectIntersections.length > 0) {
      // タスクとカラムが重なっている場合、タスクを優先
      const taskIntersections = rectIntersections.filter(intersection =>
        currentBoard?.columns.some(column =>
          column.tasks.some(task => task.id === intersection.id)
        )
      );
      
      if (taskIntersections.length > 0) {
        return taskIntersections.slice(0, 1); // 最初のタスクを返す
      }
      
      return rectIntersections.slice(0, 1); // カラムを返す
    }

    // 最後の手段としてclosestCenterを使用
    const closestIntersections = closestCenter(args);
    return closestIntersections || [];
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
          {currentBoard.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onTaskClick={handleTaskClick}
              keyboardDragAndDrop={keyboardDragAndDrop}
            />
          ))}
        </Box>
        
        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} columnId="" />
          ) : null}
        </DragOverlay>
      </DndContext>
    </Box>
  );
};

export default KanbanBoard;