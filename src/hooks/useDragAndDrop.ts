import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';

import type { Task, KanbanBoard } from '../types';

import { useTaskFinder } from './useTaskFinder';

interface UseDragAndDropProps {
  board: KanbanBoard | null;
  onMoveTask: (taskId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => void;
}

interface UseDragAndDropReturn {
  activeTask: Task | null;
  sensors: ReturnType<typeof useSensors>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export const useDragAndDrop = ({ board, onMoveTask }: UseDragAndDropProps): UseDragAndDropReturn => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { findTaskById, findTaskColumnId } = useTaskFinder(board);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent): void => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !board) {return;}

    const activeTaskId = active.id as string;
    const overColumnId = over.id as string;

    const sourceColumnId = findTaskColumnId(activeTaskId);
    if (!sourceColumnId) {return;}

    const targetColumn = board.columns.find((col) => col.id === overColumnId);
    if (!targetColumn) {return;}

    let targetIndex = targetColumn.tasks.length;

    // 同じカラム内での並び替えの場合
    if (sourceColumnId === overColumnId) {
      const sourceColumn = board.columns.find((col) => col.id === sourceColumnId);
      if (!sourceColumn) {return;}

      const oldIndex = sourceColumn.tasks.findIndex((task: Task) => task.id === activeTaskId);
      const newIndex = targetColumn.tasks.findIndex((task: Task) => task.id === over.id);

      if (newIndex !== -1) {
        targetIndex = newIndex;
      }

      if (oldIndex !== newIndex) {
        onMoveTask(activeTaskId, sourceColumnId, overColumnId, targetIndex);
      }
    } else {
      // 異なるカラム間での移動
      onMoveTask(activeTaskId, sourceColumnId, overColumnId, targetIndex);
    }
  };

  return {
    activeTask,
    sensors,
    handleDragStart,
    handleDragEnd,
  };
};