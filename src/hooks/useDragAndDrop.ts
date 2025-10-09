import { PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent, type DragOverEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';

import type { Task, KanbanBoard } from '../types';
import { logger } from '../utils/logger';

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
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent): void => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    logger.debug('🎯 Drag Start:', { taskId: active.id, taskTitle: task?.title });
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent): void => {
    const { active, over } = event;
    logger.debug('👀 Drag Over:', {
      activeId: active.id,
      overId: over?.id,
      overType: over ? (board?.columns.find(col => col.id === over.id) ? 'column' : 'task') : 'none'
    });
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    
    // ドラッグ終了時は常にactiveTaskをクリア
    setActiveTask(null);

    logger.debug('🔄 Drag End Event:', { 
      activeId: active.id, 
      overId: over?.id,
      overData: over?.data,
      overRect: over?.rect
    });

    // 有効なドロップターゲットがない場合は@dnd-kitのデフォルト動作に任せる
    if (!over) {
      logger.debug('↩️ Drag cancelled: dropped outside valid targets - allowing @dnd-kit default behavior');
      return;
    }

    if (!board) {
      logger.debug('❌ Early return: no board available');
      return;
    }

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const sourceColumnId = findTaskColumnId(activeTaskId);
    logger.debug('📍 Source column found:', sourceColumnId);
    
    if (!sourceColumnId) {
      logger.debug('❌ Source column not found');
      return;
    }

    // ドロップターゲットがカラムかタスクかを判定
    let targetColumnId: string;
    let targetIndex: number;

    // カラムにドロップした場合
    const targetColumn = board.columns.find((col) => col.id === overId);
    if (targetColumn) {
      logger.debug('📂 Dropped on column:', overId);
      targetColumnId = overId;
      targetIndex = targetColumn.tasks.length; // カラムの最後に追加
    } else {
      // タスクにドロップした場合、そのタスクの位置を特定
      logger.debug('📋 Dropped on task:', overId);
      targetColumnId = findTaskColumnId(overId) ?? '';
      const targetCol = board.columns.find((col) => col.id === targetColumnId);
      
      logger.debug('📍 Target column found:', targetColumnId);
      
      if (!targetCol) {
        logger.debug('❌ Target column not found');
        return;
      }
      
      const targetTaskIndex = targetCol.tasks.findIndex((task: Task) => task.id === overId);
      logger.debug('📋 Target task index:', targetTaskIndex);
      
      if (targetTaskIndex === -1) {
        logger.debug('❌ Target task not found');
        return;
      }
      
      // 同じカラム内でドラッグした場合の位置調整
      if (sourceColumnId === targetColumnId) {
        logger.debug('🔄 Same column reorder');
        const sourceCol = board.columns.find((col) => col.id === sourceColumnId);
        if (!sourceCol) {
          logger.debug('❌ Source column not found for reorder');
          return;
        }
        
        const oldIndex = sourceCol.tasks.findIndex((task: Task) => task.id === activeTaskId);
        logger.debug('📋 Old index:', oldIndex, 'Target index:', targetTaskIndex);
        
        if (oldIndex === targetTaskIndex) {
          logger.debug('↔️ Same position, no move needed');
          return;
        }
        
        targetIndex = targetTaskIndex;
      } else {
        logger.debug('🔄 Cross-column move');
        targetIndex = targetTaskIndex;
      }
    }

    if (!targetColumnId) {
      logger.debug('❌ No target column ID');
      return;
    }

    logger.debug('✅ Moving task:', {
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
};;;;;