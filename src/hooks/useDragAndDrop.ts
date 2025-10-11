import { PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent, type DragOverEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
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
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent): void => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    setActiveTask(task);
  };

  const handleDragOver = (_event: DragOverEvent): void => {
    // ドラッグオーバー処理（ログなし）
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    
    // ドラッグ終了時は常にactiveTaskをクリア
    setActiveTask(null);

    // 有効なドロップターゲットがない場合は@dnd-kitのデフォルト動作に任せる
    if (!over) {
      return;
    }

    if (!board) {
      return;
    }

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // 同じタスクの場合は何もしない
    if (activeTaskId === overId) {
      return;
    }

    const sourceColumnId = findTaskColumnId(activeTaskId);
    
    if (!sourceColumnId) {
      return;
    }

    // ドロップターゲットがカラムかタスクかを判定
    let targetColumnId: string;
    let targetIndex: number;

    // カラムにドロップした場合
    const targetColumn = board.columns.find((col) => col.id === overId);
    if (targetColumn) {
      targetColumnId = overId;
      targetIndex = targetColumn.tasks.length; // カラムの最後に追加
    } else {
      // タスクにドロップした場合、そのタスクの位置を特定
      targetColumnId = findTaskColumnId(overId) ?? '';
      const targetCol = board.columns.find((col) => col.id === targetColumnId);
      
      if (!targetCol) {
        return;
      }
      
      const targetTaskIndex = targetCol.tasks.findIndex((task: Task) => task.id === overId);
      
      if (targetTaskIndex === -1) {
        return;
      }
      
      // 同じカラム内でドラッグした場合の位置調整
      if (sourceColumnId === targetColumnId) {
        const sourceCol = board.columns.find((col) => col.id === sourceColumnId);
        if (!sourceCol) {
          return;
        }
        
        const oldIndex = sourceCol.tasks.findIndex((task: Task) => task.id === activeTaskId);
        
        if (oldIndex === -1) {
          return;
        }
        
        // 同じ位置の場合は何もしない
        if (oldIndex === targetTaskIndex) {
          return;
        }
        
        // 下から上に移動する場合は、targetIndexをそのまま使用
        // 上から下に移動する場合は、targetIndex + 1 を使用（元のタスクが削除されるため）
        targetIndex = oldIndex < targetTaskIndex ? targetTaskIndex : targetTaskIndex;
      } else {
        // 異なるカラム間での移動の場合は、targetTaskIndexをそのまま使用
        targetIndex = targetTaskIndex;
      }
    }

    if (!targetColumnId) {
      return;
    }

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
};;