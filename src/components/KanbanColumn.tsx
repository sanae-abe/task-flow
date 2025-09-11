import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box } from '@primer/react';
import type { Column, Task } from '../types';
import TaskCard from './TaskCard';
import ColumnHeader from './ColumnHeader';
import TaskCreateDialog from './TaskCreateDialog';
import ConfirmDialog from './ConfirmDialog';
import ColumnEditDialog from './ColumnEditDialog';
import { useColumnState } from '../hooks/useColumnState';

interface KanbanColumnProps {
  column: Column;
  onTaskClick?: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onTaskClick }) => {
  const {
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    showDeleteConfirm,
    handleTitleEdit,
    handleTitleSave,
    handleTitleCancel,
    handleDeleteColumn,
    handleConfirmDeleteColumn,
    handleCancelDeleteColumn,
    handleAddTask,
    handleCancelCreateTask
  } = useColumnState(column);
  
  const { setNodeRef } = useDroppable({
    id: column.id,
  });
  
  return (
    <Box 
      sx={{ 
        minWidth: '320px',
        maxWidth: '320px',
        width: '320px',
        flexShrink: 0, 
        minHeight: '600px',
        backgroundColor: 'transparent',
        py: 0,
        px: 2,
        overflow: 'hidden'
      }}
    >
      <ColumnHeader
        column={column}
        onTitleEdit={handleTitleEdit}
        onDeleteColumn={handleDeleteColumn}
        onAddTask={() => setShowCreateDialog(true)}
      />
      
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

      <TaskCreateDialog
        isOpen={showCreateDialog}
        onSave={handleAddTask}
        onCancel={handleCancelCreateTask}
      />

      <ColumnEditDialog
        isOpen={showEditDialog}
        currentTitle={column.title}
        onSave={handleTitleSave}
        onCancel={handleTitleCancel}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="カラムを削除"
        message={`「${column.title}」カラムを削除しますか？このカラム内のすべてのタスクも削除されます。`}
        onConfirm={handleConfirmDeleteColumn}
        onCancel={handleCancelDeleteColumn}
      />
    </Box>
  );
};

export default KanbanColumn;