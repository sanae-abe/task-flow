import { useState, useCallback } from 'react';
import {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import type { Task } from '../types';
import type { VirtualRecurringTask } from '../utils/calendarRecurrence';

// 型ガード関数: タスクオブジェクトの妥当性をチェック
function isValidTask(obj: unknown): obj is Task | VirtualRecurringTask {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    typeof (obj as { id: unknown }).id === 'string'
  );
}

interface UseCalendarDragAndDropProps {
  onTaskDateChange: (taskId: string, newDate: Date) => void;
}

interface UseCalendarDragAndDropReturn {
  activeTask: Task | VirtualRecurringTask | null;
  sensors: ReturnType<typeof useSensors>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export const useCalendarDragAndDrop = ({
  onTaskDateChange,
}: UseCalendarDragAndDropProps): UseCalendarDragAndDropReturn => {
  const [activeTask, setActiveTask] = useState<Task | VirtualRecurringTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動してからドラッグ開始
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;

    // active.dataからタスク情報を取得
    if (active.data.current?.['type'] === 'calendar-task') {
      const task = active.data.current['task'];
      if (isValidTask(task)) {
        // 仮想タスクの場合はドラッグ無効だが、型の安全性のため設定
        setActiveTask(task);
      }
    }
  }, []);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // ドラッグオーバー時の処理（視覚的フィードバック用）
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) {
      return;
    }

    // ドロップターゲットが日付セルの場合
    if (over.data.current?.['type'] === 'calendar-date') {
      const taskId = active.id as string;
      const targetDate = over.data.current['date'] as Date;

      // タスクの期限を新しい日付に更新
      onTaskDateChange(taskId, targetDate);
    }
  }, [onTaskDateChange]);

  return {
    activeTask,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};