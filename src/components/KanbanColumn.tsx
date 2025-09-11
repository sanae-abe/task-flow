import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box } from '@primer/react';
import type { Column, Task } from '../types';
import TaskCard from './TaskCard';
import ColumnHeader from './ColumnHeader';
import AddTaskForm from './AddTaskForm';
import { useColumnState } from '../hooks/useColumnState';

interface KanbanColumnProps {
  column: Column;
  onTaskClick?: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onTaskClick }) => {
  const {
    isAddingTask,
    setIsAddingTask,
    isEditingTitle,
    editingTitle,
    setEditingTitle,
    handleTitleEdit,
    handleTitleSave,
    handleTitleCancel,
    handleDeleteColumn,
    handleAddTask,
    handleCancelTask
  } = useColumnState(column);
  
  const { setNodeRef } = useDroppable({
    id: column.id,
  });
  
  return (
    <Box 
      sx={{ 
        minWidth: '320px', 
        flexShrink: 0, 
        minHeight: '600px',
        backgroundColor: 'transparent',
        p: 0
      }}
    >
      <ColumnHeader
        column={column}
        isEditingTitle={isEditingTitle}
        editingTitle={editingTitle}
        setEditingTitle={setEditingTitle}
        onTitleSave={handleTitleSave}
        onTitleCancel={handleTitleCancel}
        onTitleEdit={handleTitleEdit}
        onDeleteColumn={handleDeleteColumn}
        onAddTask={() => setIsAddingTask(true)}
      />
      
      {isAddingTask && (
        <AddTaskForm
          onAdd={handleAddTask}
          onCancel={handleCancelTask}
        />
      )}
      
      <Box 
        ref={setNodeRef} 
        sx={{ 
          minHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              columnId={column.id}
              onTaskClick={onTaskClick}
            />
          ))}
        </SortableContext>
      </Box>
    </Box>
  );
};

export default KanbanColumn;