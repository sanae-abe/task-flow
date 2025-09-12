import { DndContext, DragOverlay, closestCenter, pointerWithin, rectIntersection, type CollisionDetection } from '@dnd-kit/core';
import { Text, Box } from '@primer/react';
import React, { useState, useEffect } from 'react';

import { useKanban } from '../contexts/KanbanContext';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useTaskFinder } from '../hooks/useTaskFinder';
import { KANBAN_BOARD_STYLES } from '../styles/kanbanBoardStyles';
import type { Task } from '../types';

import KanbanColumn from './KanbanColumn';
import SubHeader from './SubHeader';
import TaskCard from './TaskCard';
import TaskDetailSidebar from './TaskDetailSidebar';

const KanbanBoard: React.FC = () => {
  const { state, moveTask, setSortOption } = useKanban();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  
  const { findTaskById } = useTaskFinder(state.currentBoard);
  const selectedTask = selectedTaskId ? findTaskById(selectedTaskId) : null;
  
  const { activeTask, sensors, handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop({
    board: state.currentBoard,
    onMoveTask: moveTask,
    onSortToManual: () => setSortOption('manual'),
  });

  // 選択されたタスクが削除された場合の処理
  useEffect(() => {
    if (selectedTaskId && !selectedTask && isTaskDetailOpen) {
      handleCloseTaskDetail();
    }
  }, [selectedTaskId, selectedTask, isTaskDetailOpen]);
  
  if (!state.currentBoard) {
    return (
      <Box sx={KANBAN_BOARD_STYLES.emptyState}>
        <Text sx={KANBAN_BOARD_STYLES.emptyStateText}>Please select a board</Text>
      </Box>
    );
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
    setIsTaskDetailOpen(true);
  };

  const handleCloseTaskDetail = () => {
    setIsTaskDetailOpen(false);
    setSelectedTaskId(null);
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
        state.currentBoard?.columns.some(column => 
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
      <SubHeader />
      
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box sx={KANBAN_BOARD_STYLES.columnsContainer}>
          {state.currentBoard.columns.map((column) => (
            <KanbanColumn 
              key={column.id} 
              column={column} 
              onTaskClick={handleTaskClick}
            />
          ))}
        </Box>
        
        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} columnId="" />
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <TaskDetailSidebar
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={handleCloseTaskDetail}
      />
    </Box>
  );
};

export default KanbanBoard;