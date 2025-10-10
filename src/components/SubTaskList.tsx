import { Box } from '@primer/react';
import React, { useMemo } from 'react';

import { useSubTaskForm } from '../hooks/useSubTaskForm';
import type { SubTask } from '../types';

import SubTaskForm from './SubTaskForm';
import SubTaskHeader from './SubTaskHeader';
import SubTaskItem from './SubTaskItem';
import SubTaskProgressBar from './SubTaskProgressBar';

interface SubTaskListProps {
  subTasks: SubTask[];
  onAddSubTask: (title: string) => void;
  onToggleSubTask: (subTaskId: string) => void;
  onEditSubTask: (subTaskId: string, newTitle: string) => void;
  onDeleteSubTask: (subTaskId: string) => void;
}

const SubTaskList: React.FC<SubTaskListProps> = ({
  subTasks,
  onAddSubTask,
  onToggleSubTask,
  onEditSubTask,
  onDeleteSubTask
}) => {
  const { 
    isAdding, 
    title, 
    setIsAdding, 
    setTitle, 
    handleSubmit, 
    resetForm, 
    handleKeyPress 
  } = useSubTaskForm();

  const { completedCount, totalCount } = useMemo(() => ({
    completedCount: subTasks.filter(task => task.completed).length,
    totalCount: subTasks.length
  }), [subTasks]);

  const handleFormSubmit = () => handleSubmit(onAddSubTask);
  
  const handleFormKeyDown = (event: React.KeyboardEvent) => 
    handleKeyPress(event, onAddSubTask);

  return (
    <Box sx={{ mb: 4 }}>
      <SubTaskHeader
        completedCount={completedCount}
        totalCount={totalCount}
        isAdding={isAdding}
        onStartAdding={() => setIsAdding(true)}
      />

      <SubTaskProgressBar
        completedCount={completedCount}
        totalCount={totalCount}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {subTasks.map((subTask) => (
          <SubTaskItem
            key={subTask.id}
            subTask={subTask}
            onToggle={onToggleSubTask}
            onEdit={onEditSubTask}
            onDelete={onDeleteSubTask}
          />
        ))}

        {isAdding && (
          <SubTaskForm
            title={title}
            onTitleChange={setTitle}
            onSubmit={handleFormSubmit}
            onCancel={resetForm}
            onKeyDown={handleFormKeyDown}
          />
        )}
      </Box>
    </Box>
  );
};

export default SubTaskList;