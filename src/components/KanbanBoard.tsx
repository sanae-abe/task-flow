import { DndContext, DragOverlay } from '@dnd-kit/core';
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
  const { state, moveTask } = useKanban();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  
  const { findTaskById } = useTaskFinder(state.currentBoard);
  const selectedTask = selectedTaskId ? findTaskById(selectedTaskId) : null;
  
  const { activeTask, sensors, handleDragStart, handleDragEnd } = useDragAndDrop({
    board: state.currentBoard,
    onMoveTask: moveTask,
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
  
  return (
    <Box sx={KANBAN_BOARD_STYLES.container}>
      <SubHeader />
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
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