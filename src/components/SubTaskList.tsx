import { Box } from '@primer/react';
import React, { useMemo, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

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
  onReorderSubTasks: (oldIndex: number, newIndex: number) => void;
}

const SubTaskList: React.FC<SubTaskListProps> = ({
  subTasks,
  onAddSubTask,
  onToggleSubTask,
  onEditSubTask,
  onDeleteSubTask,
  onReorderSubTasks
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

  // ドラッグ&ドロップセンサーの設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ドラッグエンドハンドラー
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = subTasks.findIndex((item) => item.id === active.id);
      const newIndex = subTasks.findIndex((item) => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderSubTasks(oldIndex, newIndex);
      }
    }
  }, [subTasks, onReorderSubTasks]);

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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={subTasks.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
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
        </SortableContext>
      </DndContext>
    </Box>
  );
};

export default SubTaskList;