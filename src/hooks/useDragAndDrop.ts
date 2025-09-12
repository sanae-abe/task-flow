import { PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent, type DragOverEvent } from '@dnd-kit/core';
import { useState } from 'react';

import type { Task, KanbanBoard } from '../types';

import { useTaskFinder } from './useTaskFinder';

interface UseDragAndDropProps {
  board: KanbanBoard | null;
  onMoveTask: (taskId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => void;
  onSortToManual?: () => void;
}

interface UseDragAndDropReturn {
  activeTask: Task | null;
  sensors: ReturnType<typeof useSensors>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export const useDragAndDrop = ({ board, onMoveTask, onSortToManual }: UseDragAndDropProps): UseDragAndDropReturn => {
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
    console.log('🎯 Drag Start:', { taskId: active.id, taskTitle: task?.title });
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent): void => {
    const { active, over } = event;
    console.log('👀 Drag Over:', { 
      activeId: active.id, 
      overId: over?.id,
      overType: over ? (board?.columns.find(col => col.id === over.id) ? 'column' : 'task') : 'none'
    });
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    setActiveTask(null);

    console.log('🔄 Drag End Event:', { 
      activeId: active.id, 
      overId: over?.id,
      overData: over?.data,
      overRect: over?.rect
    });

    if (!over) {
      console.log('❌ Early return: no over target detected');
      return;
    }

    if (!board) {
      console.log('❌ Early return: no board available');
      return;
    }

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const sourceColumnId = findTaskColumnId(activeTaskId);
    console.log('📍 Source column found:', sourceColumnId);
    
    if (!sourceColumnId) {
      console.log('❌ Source column not found');
      return;
    }

    // ドロップターゲットがカラムかタスクかを判定
    let targetColumnId: string;
    let targetIndex: number;

    // カラムにドロップした場合
    const targetColumn = board.columns.find((col) => col.id === overId);
    if (targetColumn) {
      console.log('📂 Dropped on column:', overId);
      targetColumnId = overId;
      targetIndex = targetColumn.tasks.length; // カラムの最後に追加
    } else {
      // タスクにドロップした場合、そのタスクの位置を特定
      console.log('📋 Dropped on task:', overId);
      targetColumnId = findTaskColumnId(overId) ?? '';
      const targetCol = board.columns.find((col) => col.id === targetColumnId);
      
      console.log('📍 Target column found:', targetColumnId);
      
      if (!targetCol) {
        console.log('❌ Target column not found');
        return;
      }
      
      const targetTaskIndex = targetCol.tasks.findIndex((task: Task) => task.id === overId);
      console.log('📋 Target task index:', targetTaskIndex);
      
      if (targetTaskIndex === -1) {
        console.log('❌ Target task not found');
        return;
      }
      
      // 同じカラム内でドラッグした場合の位置調整
      if (sourceColumnId === targetColumnId) {
        console.log('🔄 Same column reorder');
        const sourceCol = board.columns.find((col) => col.id === sourceColumnId);
        if (!sourceCol) {
          console.log('❌ Source column not found for reorder');
          return;
        }
        
        const oldIndex = sourceCol.tasks.findIndex((task: Task) => task.id === activeTaskId);
        console.log('📋 Old index:', oldIndex, 'Target index:', targetTaskIndex);
        
        if (oldIndex === targetTaskIndex) {
          console.log('↔️ Same position, no move needed');
          return;
        }
        
        targetIndex = targetTaskIndex;
      } else {
        console.log('🔄 Cross-column move');
        targetIndex = targetTaskIndex;
      }
    }

    if (!targetColumnId) {
      console.log('❌ No target column ID');
      return;
    }

    console.log('✅ Moving task:', {
      taskId: activeTaskId,
      from: sourceColumnId,
      to: targetColumnId,
      index: targetIndex
    });

    // ドラッグ&ドロップ時は手動ソートに切り替え
    if (onSortToManual) {
      onSortToManual();
    }

    onMoveTask(activeTaskId, sourceColumnId, targetColumnId, targetIndex);
  };

  return {
    activeTask,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};