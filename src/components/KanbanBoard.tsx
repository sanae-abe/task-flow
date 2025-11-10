import {
  DndContext,
  DragOverlay,
  pointerWithin,
  type CollisionDetection,
} from '@dnd-kit/core';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useBoard } from '../contexts/BoardContext';
import { useTask } from '../contexts/TaskContext';
import { useUI } from '../contexts/UIContext';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useKeyboardDragAndDrop } from '../hooks/useKeyboardDragAndDrop';
import type { Task } from '../types';

import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';

const KanbanBoard: React.FC = () => {
  const { t } = useTranslation();
  const { currentBoard } = useBoard();
  const { moveTask } = useTask();
  const { setSortOption, openTaskDetail } = useUI();

  // ドラッグ状態のライブアナウンス用
  const [dragAnnouncement, setDragAnnouncement] = useState<string>('');

  const {
    activeTask,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDragAndDrop({
    board: currentBoard,
    onMoveTask: moveTask,
    onSortToManual: () => setSortOption('manual'),
  });

  const keyboardDragAndDrop = useKeyboardDragAndDrop({
    board: currentBoard,
    onMoveTask: moveTask,
    onSortToManual: () => setSortOption('manual'),
  });

  // ドラッグ開始時のアナウンス
  useEffect(() => {
    if (activeTask) {
      setDragAnnouncement(
        `${activeTask.title}をドラッグ中です。移動先のカラムにドロップしてください。`
      );
    } else {
      setDragAnnouncement('');
    }
  }, [activeTask]);

  if (!currentBoard) {
    return (
      <div className='flex items-center justify-center h-96'>
        <p className='text-base text-zinc-500'>{t('board.selectBoard')}</p>
      </div>
    );
  }

  const handleTaskClick = (task: Task) => {
    openTaskDetail(task.id);
  };

  // 厳密な衝突検出 - pointerWithinのみ使用で範囲外ドロップを正確に検出
  const collisionDetectionStrategy: CollisionDetection = args => {
    // pointerWithinのみを使用して最も厳密な検出
    const pointerIntersections = pointerWithin(args);

    if (pointerIntersections.length > 0) {
      // タスクとカラムが重なっている場合、タスクを優先（削除済みカラムは除外）
      const taskIntersections = pointerIntersections.filter(intersection =>
        currentBoard?.columns
          .filter(column => column.deletionState !== 'deleted')
          .some(column =>
            column.tasks.some(task => task.id === intersection.id)
          )
      );

      if (taskIntersections.length > 0) {
        return taskIntersections.slice(0, 1); // 最初のタスクを返す
      }

      return pointerIntersections.slice(0, 1); // カラムを返す
    }

    // 範囲外ドロップの場合は空配列を返す
    return [];
  };

  return (
    <div className='bg-neutral-100 w-screen'>
      {/* アクセシビリティ: ドラッグ操作のライブリージョン */}
      <div
        role='status'
        aria-live='assertive'
        aria-atomic='true'
        className='sr-only'
      >
        {dragAnnouncement}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          role='region'
          aria-label='カンバンボード'
          className='flex overflow-auto gap-4 p-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'
          style={{
            willChange: 'scroll-position',
            contain: 'layout style paint',
          }}
        >
          {currentBoard.columns
            .filter(column => column.deletionState !== 'deleted')
            .map((column, index) => (
              <KanbanColumn
                key={column.id}
                column={column}
                columnIndex={index}
                totalColumns={
                  currentBoard.columns.filter(
                    col => col.deletionState !== 'deleted'
                  ).length
                }
                onTaskClick={handleTaskClick}
                keyboardDragAndDrop={keyboardDragAndDrop}
              />
            ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} columnId='' /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
