import { useState, useCallback, useRef } from 'react';
import type { Task, KanbanBoard } from '../types';
import { logger } from '../utils/logger';

interface UseKeyboardDragAndDropProps {
  board: KanbanBoard | null;
  onMoveTask: (taskId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => void;
  onSortToManual?: () => void;
}

interface UseKeyboardDragAndDropReturn {
  selectedTaskId: string | null;
  isDragMode: boolean;
  handleKeyDown: (event: React.KeyboardEvent, taskId: string) => void;
  announceToScreenReader: (message: string) => void;
  resetDragState: () => void;
}

/**
 * キーボードドラッグ&ドロップのカスタムフック
 * WCAG 2.1 AA準拠のアクセシブルなドラッグ&ドロップ機能を提供
 */
export const useKeyboardDragAndDrop = ({
  board,
  onMoveTask,
  onSortToManual
}: UseKeyboardDragAndDropProps): UseKeyboardDragAndDropReturn => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDragMode, setIsDragMode] = useState(false);
  const announcementRef = useRef<HTMLDivElement | null>(null);

  // スクリーンリーダー用アナウンス機能
  const announceToScreenReader = useCallback((message: string) => {
    // ライブリージョンが存在しない場合は作成
    if (!announcementRef.current) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';
      document.body.appendChild(announcement);
      announcementRef.current = announcement;
    }

    // メッセージをアナウンス
    announcementRef.current.textContent = message;
    logger.debug('Screen reader announcement:', message);

    // 3秒後にクリア
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = '';
      }
    }, 3000);
  }, []);

  // タスクを探す
  const findTaskById = useCallback((taskId: string): Task | null => {
    if (!board) {
      return null;
    }
    for (const column of board.columns) {
      const task = column.tasks.find(t => t.id === taskId);
      if (task) {
        return task;
      }
    }
    return null;
  }, [board]);


  // 現在のタスクの位置情報を取得
  const getTaskPosition = useCallback((taskId: string) => {
    if (!board) {
      return null;
    }

    for (let columnIndex = 0; columnIndex < board.columns.length; columnIndex++) {
      const column = board.columns[columnIndex];
      if (!column) {
        continue;
      }
      const taskIndex = column.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        return {
          columnIndex,
          taskIndex,
          columnId: column.id,
          columnTitle: column.title,
          totalColumns: board.columns.length,
          totalTasksInColumn: column.tasks.length
        };
      }
    }
    return null;
  }, [board]);

  // 矢印キーによるナビゲーション
  const navigateTask = useCallback((
    currentTaskId: string,
    direction: 'up' | 'down' | 'left' | 'right'
  ): string | null => {
    if (!board) {
      return null;
    }

    const position = getTaskPosition(currentTaskId);
    if (!position) {
      return null;
    }

    const { columnIndex, taskIndex } = position;

    switch (direction) {
      case 'up':
        // 同じカラムの上のタスク
        if (taskIndex > 0) {
          const currentColumn = board.columns[columnIndex];
          return currentColumn?.tasks[taskIndex - 1]?.id || null;
        }
        break;

      case 'down':
        // 同じカラムの下のタスク
        const currentColumn = board.columns[columnIndex];
        if (currentColumn && taskIndex < currentColumn.tasks.length - 1) {
          return currentColumn.tasks[taskIndex + 1]?.id || null;
        }
        break;

      case 'left':
        // 左のカラムの同じ位置（またはなければ最後）のタスク
        if (columnIndex > 0) {
          const leftColumn = board.columns[columnIndex - 1];
          if (leftColumn && leftColumn.tasks.length > 0) {
            const targetIndex = Math.min(taskIndex, leftColumn.tasks.length - 1);
            return leftColumn.tasks[targetIndex]?.id || null;
          }
        }
        break;

      case 'right':
        // 右のカラムの同じ位置（またはなければ最後）のタスク
        if (columnIndex < board.columns.length - 1) {
          const rightColumn = board.columns[columnIndex + 1];
          if (rightColumn && rightColumn.tasks.length > 0) {
            const targetIndex = Math.min(taskIndex, rightColumn.tasks.length - 1);
            return rightColumn.tasks[targetIndex]?.id || null;
          }
        }
        break;
    }

    return null;
  }, [board, getTaskPosition]);

  // タスクの移動実行
  const moveSelectedTask = useCallback((
    direction: 'up' | 'down' | 'left' | 'right'
  ) => {
    if (!selectedTaskId || !board) {
      return;
    }

    const position = getTaskPosition(selectedTaskId);
    if (!position) {
      return;
    }

    const { columnIndex, taskIndex, columnId } = position;
    let targetColumnIndex = columnIndex;
    let targetTaskIndex = taskIndex;

    // 移動先を計算
    switch (direction) {
      case 'up':
        targetTaskIndex = Math.max(0, taskIndex - 1);
        break;
      case 'down':
        {
          const currentCol = board.columns[columnIndex];
          if (currentCol) {
            targetTaskIndex = Math.min(
              currentCol.tasks.length - 1,
              taskIndex + 1
            );
          }
        }
        break;
      case 'left':
        targetColumnIndex = Math.max(0, columnIndex - 1);
        {
          const targetCol = board.columns[targetColumnIndex];
          if (targetCol) {
            targetTaskIndex = Math.min(
              taskIndex,
              targetCol.tasks.length
            );
          }
        }
        break;
      case 'right':
        targetColumnIndex = Math.min(
          board.columns.length - 1,
          columnIndex + 1
        );
        {
          const targetCol = board.columns[targetColumnIndex];
          if (targetCol) {
            targetTaskIndex = Math.min(
              taskIndex,
              targetCol.tasks.length
            );
          }
        }
        break;
    }

    // 移動が発生する場合のみ実行
    if (targetColumnIndex !== columnIndex || targetTaskIndex !== taskIndex) {
      const targetColumn = board.columns[targetColumnIndex];
      if (!targetColumn) {
        return;
      }

      const targetColumnId = targetColumn.id;
      const targetColumnTitle = targetColumn.title;

      // ドラッグ&ドロップ時は手動ソートに切り替え
      if (onSortToManual) {
        onSortToManual();
      }

      onMoveTask(selectedTaskId, columnId, targetColumnId, targetTaskIndex);

      const task = findTaskById(selectedTaskId);
      announceToScreenReader(
        `タスク「${task?.title || 'タスク'}」を${targetColumnTitle}の${targetTaskIndex + 1}番目に移動しました`
      );

      logger.debug('Keyboard move task:', {
        taskId: selectedTaskId,
        from: { columnIndex, taskIndex },
        to: { columnIndex: targetColumnIndex, taskIndex: targetTaskIndex }
      });
    }
  }, [selectedTaskId, board, getTaskPosition, onMoveTask, onSortToManual, findTaskById, announceToScreenReader]);

  // ドラッグ状態のリセット
  const resetDragState = useCallback(() => {
    setSelectedTaskId(null);
    setIsDragMode(false);
    announceToScreenReader('ドラッグ操作を終了しました');
  }, [announceToScreenReader]);

  // キーボードイベントハンドラー
  const handleKeyDown = useCallback((
    event: React.KeyboardEvent,
    taskId: string
  ) => {
    const task = findTaskById(taskId);
    if (!task) {
      return;
    }

    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (selectedTaskId === taskId) {
          // 選択解除
          resetDragState();
        } else {
          // 新しいタスクを選択
          setSelectedTaskId(taskId);
          setIsDragMode(true);
          announceToScreenReader(
            `タスク「${task.title}」を選択しました。矢印キーで移動位置を選択し、SpaceキーまたはEnterキーで移動を確定してください。Escapeキーで操作をキャンセルできます。`
          );
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (isDragMode && selectedTaskId === taskId) {
          moveSelectedTask('up');
        } else {
          // ナビゲーションモード
          const nextTaskId = navigateTask(taskId, 'up');
          if (nextTaskId) {
            const nextElement = document.querySelector(`[data-task-id="${nextTaskId}"]`);
            if (nextElement instanceof HTMLElement) {
              nextElement.focus();
            }
          }
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (isDragMode && selectedTaskId === taskId) {
          moveSelectedTask('down');
        } else {
          // ナビゲーションモード
          const nextTaskId = navigateTask(taskId, 'down');
          if (nextTaskId) {
            const nextElement = document.querySelector(`[data-task-id="${nextTaskId}"]`);
            if (nextElement instanceof HTMLElement) {
              nextElement.focus();
            }
          }
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (isDragMode && selectedTaskId === taskId) {
          moveSelectedTask('left');
        } else {
          // ナビゲーションモード
          const nextTaskId = navigateTask(taskId, 'left');
          if (nextTaskId) {
            const nextElement = document.querySelector(`[data-task-id="${nextTaskId}"]`);
            if (nextElement instanceof HTMLElement) {
              nextElement.focus();
            }
          }
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (isDragMode && selectedTaskId === taskId) {
          moveSelectedTask('right');
        } else {
          // ナビゲーションモード
          const nextTaskId = navigateTask(taskId, 'right');
          if (nextTaskId) {
            const nextElement = document.querySelector(`[data-task-id="${nextTaskId}"]`);
            if (nextElement instanceof HTMLElement) {
              nextElement.focus();
            }
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        if (isDragMode) {
          resetDragState();
        }
        break;

      default:
        break;
    }
  }, [
    findTaskById,
    selectedTaskId,
    isDragMode,
    moveSelectedTask,
    navigateTask,
    resetDragState,
    announceToScreenReader
  ]);

  return {
    selectedTaskId,
    isDragMode,
    handleKeyDown,
    announceToScreenReader,
    resetDragState,
  };
};