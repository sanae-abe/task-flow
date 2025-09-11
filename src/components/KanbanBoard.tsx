import React, { useState } from 'react';
import { Text, Box } from '@primer/react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useKanban } from '../contexts/KanbanContext';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskDetailSidebar from './TaskDetailSidebar';
import type { Task } from '../types';

const KanbanBoard: React.FC = () => {
  const { state, moveTask } = useKanban();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  if (!state.currentBoard) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px" }}>
        <Text sx={{ fontSize: 2, color: "fg.muted" }}>Please select a board</Text>
      </Box>
    );
  }
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (!state.currentBoard) {
      return;
    }
    for (const column of state.currentBoard.columns) {
      const task = column.tasks.find(task => task.id === active.id);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    
    if (!over || !state.currentBoard) {
      return;
    }
    
    const activeTaskId = active.id as string;
    const overColumnId = over.id as string;
    
    let sourceColumnId = '';
    
    for (const column of state.currentBoard.columns) {
      const taskIndex = column.tasks.findIndex(task => task.id === activeTaskId);
      if (taskIndex !== -1) {
        sourceColumnId = column.id;
        break;
      }
    }
    
    if (!sourceColumnId) {
      return;
    }
    
    const targetColumn = state.currentBoard.columns.find(col => col.id === overColumnId);
    if (!targetColumn) {
      return;
    }
    
    let targetIndex = targetColumn.tasks.length;
    
    if (sourceColumnId === overColumnId) {
      const sourceColumn = state.currentBoard.columns.find(col => col.id === sourceColumnId);
      if (!sourceColumn) {
        return;
      }
      const oldIndex = sourceColumn.tasks.findIndex(task => task.id === activeTaskId);
      const newIndex = targetColumn.tasks.findIndex(task => task.id === over.id);
      
      if (newIndex !== -1) {
        targetIndex = newIndex;
      }
      
      if (oldIndex !== newIndex) {
        moveTask(activeTaskId, sourceColumnId, overColumnId, targetIndex);
      }
    } else {
      moveTask(activeTaskId, sourceColumnId, overColumnId, targetIndex);
    }
  };
  


  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleCloseTaskDetail = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  };
  
  return (
    <Box 
      width="100%" 
      height="100vh" 
      bg="canvas.subtle"
      sx={{ overflow: 'hidden' }}
    >
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box 
          display="flex" 
          sx={{ 
            overflowX: 'auto', 
            gap: 6, 
            px: 6,
            py: 5,
            height: 'calc(100vh - 56px)',
            '&::-webkit-scrollbar': {
              height: '8px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'canvas.subtle'
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'border.muted',
              borderRadius: '4px'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'border.default'
            }
          }}
        >
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