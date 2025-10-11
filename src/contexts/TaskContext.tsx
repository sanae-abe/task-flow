import React, { createContext, useContext, useReducer, useMemo, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { Task, Label, SubTask, FileAttachment, RecurrenceConfig, Priority } from '../types';
import { useNotify } from './NotificationContext';
import { useBoard } from './BoardContext';
import { calculateNextDueDate, isRecurrenceComplete } from '../utils/recurrence';
import { logger } from '../utils/logger';

interface TaskState {
  // Task操作の一時的な状態をここに追加可能
  isProcessing: boolean;
}

type TaskAction =
  | { type: 'SET_PROCESSING'; payload: boolean };

interface TaskContextType {
  state: TaskState;
  createTask: (columnId: string, title: string, description: string, dueDate?: Date, labels?: Label[], attachments?: FileAttachment[], recurrence?: RecurrenceConfig, priority?: Priority) => void;
  moveTask: (taskId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string, columnId: string) => void;
  duplicateTask: (taskId: string) => void;
  clearCompletedTasks: () => void;
  addSubTask: (taskId: string, title: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  updateSubTask: (taskId: string, subTaskId: string, title: string) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
  reorderSubTasks: (taskId: string, oldIndex: number, newIndex: number) => void;
  checkOverdueRecurringTasks: () => void;
  findTaskById: (taskId: string) => Task | null;
  findTaskColumnId: (taskId: string) => string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
      };
    default:
      return state;
  }
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const notify = useNotify();
  const { state: boardState, dispatch: boardDispatch } = useBoard();

  const [state] = useReducer(taskReducer, {
    isProcessing: false,
  });

  // ヘルパー関数: タスクをIDで検索
  const findTaskById = useCallback((taskId: string): Task | null => {
    if (!boardState.currentBoard) {
      return null;
    }

    for (const column of boardState.currentBoard.columns) {
      const task = column.tasks.find(task => task.id === taskId);
      if (task) {
        return task;
      }
    }
    return null;
  }, [boardState.currentBoard]);

  // ヘルパー関数: タスクのカラムIDを取得
  const findTaskColumnId = useCallback((taskId: string): string | null => {
    if (!boardState.currentBoard) {
      return null;
    }

    for (const column of boardState.currentBoard.columns) {
      if (column.tasks.some(task => task.id === taskId)) {
        return column.id;
      }
    }
    return null;
  }, [boardState.currentBoard]);

  // タスク作成
  const createTask = useCallback((
    columnId: string,
    title: string,
    description: string,
    dueDate?: Date,
    labels?: Label[],
    attachments?: FileAttachment[],
    recurrence?: RecurrenceConfig,
    priority?: Priority
  ) => {
    if (!boardState.currentBoard) {
      notify.error('ボードが選択されていません');
      return;
    }

    const newTask: Task = {
      id: uuidv4(),
      title,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: dueDate?.toISOString() ?? null,
      priority, // undefinedの場合はundefinedのまま保持
      labels: labels ?? [],
      files: attachments ?? [],
      subTasks: [],
      completedAt: null,
      recurrence,
      recurrenceId: recurrence ? uuidv4() : undefined,
      occurrenceCount: recurrence ? 1 : undefined,
    };

    // ボードのタスクを更新
    const updatedBoard = {
      ...boardState.currentBoard,
      columns: boardState.currentBoard.columns.map(column =>
        column.id === columnId
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      ),
      updatedAt: new Date().toISOString(),
    };

    boardDispatch({
      type: 'UPDATE_BOARD',
      payload: { boardId: boardState.currentBoard.id, updates: updatedBoard }
    });

    notify.success(`タスク「${title}」を作成しました`);
  }, [boardState.currentBoard, boardDispatch, notify]);

  // タスク移動
  const moveTask = useCallback((
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    targetIndex: number
  ) => {
    if (!boardState.currentBoard) {
      notify.error('ボードが選択されていません');
      return;
    }

    const taskToMove = findTaskById(taskId);
    if (!taskToMove) {
      logger.warn('Task to move not found:', taskId);
      return;
    }

    // ソースカラムとターゲットカラムの存在確認
    const sourceColumn = boardState.currentBoard.columns.find(col => col.id === sourceColumnId);
    const targetColumn = boardState.currentBoard.columns.find(col => col.id === targetColumnId);
    
    if (!sourceColumn || !targetColumn) {
      logger.warn('Source or target column not found:', { sourceColumnId, targetColumnId });
      return;
    }

    // 最右のカラム（完了カラム）への移動をチェック
    const rightmostColumnIndex = boardState.currentBoard.columns.length - 1;
    const targetColumnIndex = boardState.currentBoard.columns.findIndex(col => col.id === targetColumnId);
    const sourceColumnIndex = boardState.currentBoard.columns.findIndex(col => col.id === sourceColumnId);
    const isMovingToCompleted = targetColumnIndex === rightmostColumnIndex;
    const isMovingFromCompleted = sourceColumnIndex === rightmostColumnIndex;

    // タスクを更新（updatedAtとcompletedAtを設定）
    const updatedTask = {
      ...taskToMove,
      updatedAt: new Date().toISOString(),
      completedAt: isMovingToCompleted ? new Date().toISOString() :
                   isMovingFromCompleted ? null : taskToMove.completedAt,
    };

    // 繰り返しタスクの処理
    let recurringTask: Task | null = null;
    if (isMovingToCompleted && updatedTask.recurrence && updatedTask.dueDate) {
      if (!isRecurrenceComplete(updatedTask.recurrence, updatedTask.occurrenceCount || 1)) {
        const nextDueDate = calculateNextDueDate(updatedTask.dueDate, updatedTask.recurrence);
        const currentCount = (updatedTask.occurrenceCount || 1) + 1;

        if (nextDueDate) {
          recurringTask = {
            ...updatedTask,
            id: uuidv4(),
            dueDate: nextDueDate,
            completedAt: null,
            occurrenceCount: currentCount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      }
    }

    // 同じカラム内での移動の場合は、特別な処理を行う
    if (sourceColumnId === targetColumnId) {
      const newTasks = [...sourceColumn.tasks];
      const oldIndex = newTasks.findIndex(task => task.id === taskId);
      
      if (oldIndex === -1) {
        logger.warn('Task not found in source column for same-column move:', taskId);
        return;
      }
      
      // タスクを削除
      newTasks.splice(oldIndex, 1);
      
      // 安全なターゲットインデックスを計算
      const safeTargetIndex = Math.max(0, Math.min(targetIndex, newTasks.length));
      
      // 新しい位置に挿入
      newTasks.splice(safeTargetIndex, 0, updatedTask);
      
      const updatedColumns = boardState.currentBoard.columns.map(column => {
        if (column.id === sourceColumnId) {
          return {
            ...column,
            tasks: newTasks,
          };
        }
        return column;
      });
      
      const updatedBoard = {
        ...boardState.currentBoard,
        columns: updatedColumns,
        updatedAt: new Date().toISOString(),
      };

      boardDispatch({
        type: 'UPDATE_BOARD',
        payload: { boardId: boardState.currentBoard.id, updates: updatedBoard }
      });
      
    } else {
      // 異なるカラム間での移動
      const updatedColumns = boardState.currentBoard.columns.map(column => {
        if (column.id === sourceColumnId) {
          // ソースカラムからタスクを削除
          return {
            ...column,
            tasks: column.tasks.filter(task => task.id !== taskId),
          };
        } else if (column.id === targetColumnId) {
          // ターゲットカラムにタスクを追加
          const newTasks = [...column.tasks];
          const safeTargetIndex = Math.max(0, Math.min(targetIndex, newTasks.length));
          
          newTasks.splice(safeTargetIndex, 0, updatedTask);

          // 繰り返しタスクがある場合は追加（完了カラムに移動していない場合）
          if (recurringTask && !isMovingToCompleted) {
            newTasks.push(recurringTask);
          }

          return {
            ...column,
            tasks: newTasks,
          };
        }
        return column;
      });

      // 繰り返しタスクを最初のカラムに追加（完了カラムに移動した場合）
      if (recurringTask && isMovingToCompleted && updatedColumns.length > 0) {
        const firstColumn = updatedColumns[0];
        if (firstColumn) {
          updatedColumns[0] = {
            ...firstColumn,
            tasks: [...firstColumn.tasks, recurringTask],
          };
        }
      }

      const updatedBoard = {
        ...boardState.currentBoard,
        columns: updatedColumns,
        updatedAt: new Date().toISOString(),
      };

      boardDispatch({
        type: 'UPDATE_BOARD',
        payload: { boardId: boardState.currentBoard.id, updates: updatedBoard }
      });
    }

    logger.debug('Task moved successfully:', { taskId, sourceColumnId, targetColumnId, targetIndex });
  }, [boardState.currentBoard, findTaskById, boardDispatch, notify]);;;;;;

  // タスク更新
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    if (!boardState.currentBoard) {
      notify.error('ボードが選択されていません');
      return;
    }

    const updatedBoard = {
      ...boardState.currentBoard,
      columns: boardState.currentBoard.columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        ),
      })),
      updatedAt: new Date().toISOString(),
    };

    boardDispatch({
      type: 'UPDATE_BOARD',
      payload: { boardId: boardState.currentBoard.id, updates: updatedBoard }
    });

    notify.success('タスクを更新しました');
  }, [boardState.currentBoard, boardDispatch, notify]);

  // タスク削除
  const deleteTask = useCallback((taskId: string, columnId: string) => {
    if (!boardState.currentBoard) {
      notify.error('ボードが選択されていません');
      return;
    }

    const updatedBoard = {
      ...boardState.currentBoard,
      columns: boardState.currentBoard.columns.map(column =>
        column.id === columnId
          ? { ...column, tasks: column.tasks.filter(task => task.id !== taskId) }
          : column
      ),
      updatedAt: new Date().toISOString(),
    };

    boardDispatch({
      type: 'UPDATE_BOARD',
      payload: { boardId: boardState.currentBoard.id, updates: updatedBoard }
    });

    notify.success('タスクを削除しました');
  }, [boardState.currentBoard, boardDispatch, notify]);
  // タスク複製
  const duplicateTask = useCallback((taskId: string) => {
    if (!boardState.currentBoard) {
      notify.error('ボードが選択されていません');
      return;
    }

    const originalTask = findTaskById(taskId);
    if (!originalTask) {
      notify.error('複製するタスクが見つかりません');
      return;
    }

    const sourceColumnId = findTaskColumnId(taskId);
    if (!sourceColumnId) {
      notify.error('タスクのカラムが見つかりません');
      return;
    }

    // 新しいタスクを作成（IDとタイムスタンプを新規生成）
    const duplicatedTask: Task = {
      ...originalTask,
      id: uuidv4(),
      title: `${originalTask.title} (コピー)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null, // 複製時は未完了状態にリセット
      recurrenceId: originalTask.recurrence ? uuidv4() : undefined, // 繰り返しIDも新規生成
      occurrenceCount: originalTask.recurrence ? 1 : undefined, // 繰り返し回数をリセット
      // サブタスクも新しいIDで複製
      subTasks: originalTask.subTasks?.map(subTask => ({
        ...subTask,
        id: uuidv4(),
        completed: false, // サブタスクも未完了状態にリセット
        createdAt: new Date().toISOString(),
      })) || [],
    };

    // 元のタスクと同じカラムに追加
    const updatedBoard = {
      ...boardState.currentBoard,
      columns: boardState.currentBoard.columns.map(column =>
        column.id === sourceColumnId
          ? { ...column, tasks: [...column.tasks, duplicatedTask] }
          : column
      ),
      updatedAt: new Date().toISOString(),
    };

    boardDispatch({
      type: 'UPDATE_BOARD',
      payload: { boardId: boardState.currentBoard.id, updates: updatedBoard }
    });

    notify.success(`タスク「${originalTask.title}」を複製しました`);
  }, [boardState.currentBoard, findTaskById, findTaskColumnId, boardDispatch, notify]);

  // 完了済みタスクのクリア
  const clearCompletedTasks = useCallback(() => {
    if (!boardState.currentBoard) {
      notify.error('ボードが選択されていません');
      return;
    }

    const rightmostColumnId = boardState.currentBoard.columns[boardState.currentBoard.columns.length - 1]?.id;
    if (!rightmostColumnId) {
      return;
    }

    const updatedBoard = {
      ...boardState.currentBoard,
      columns: boardState.currentBoard.columns.map(column =>
        column.id === rightmostColumnId
          ? { ...column, tasks: [] }
          : column
      ),
      updatedAt: new Date().toISOString(),
    };

    boardDispatch({
      type: 'UPDATE_BOARD',
      payload: { boardId: boardState.currentBoard.id, updates: updatedBoard }
    });

    notify.success('完了済みタスクをクリアしました');
  }, [boardState.currentBoard, boardDispatch, notify]);

  // サブタスク追加
  const addSubTask = useCallback((taskId: string, title: string) => {
    const newSubTask: SubTask = {
      id: uuidv4(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const task = findTaskById(taskId);
    if (!task) {
      notify.error('タスクが見つかりません');
      return;
    }

    updateTask(taskId, {
      subTasks: [...(task.subTasks || []), newSubTask],
    });
  }, [findTaskById, updateTask, notify]);

  // サブタスク切り替え
  const toggleSubTask = useCallback((taskId: string, subTaskId: string) => {
    const task = findTaskById(taskId);
    if (!task || !task.subTasks) {
      notify.error('タスクまたはサブタスクが見つかりません');
      return;
    }

    const updatedSubTasks = task.subTasks.map(subTask =>
      subTask.id === subTaskId
        ? { ...subTask, completed: !subTask.completed }
        : subTask
    );

    updateTask(taskId, { subTasks: updatedSubTasks });
  }, [findTaskById, updateTask, notify]);

  // サブタスク削除
  const deleteSubTask = useCallback((taskId: string, subTaskId: string) => {
    const task = findTaskById(taskId);
    if (!task || !task.subTasks) {
      notify.error('タスクまたはサブタスクが見つかりません');
      return;
    }

    const updatedSubTasks = task.subTasks.filter(subTask => subTask.id !== subTaskId);
    updateTask(taskId, { subTasks: updatedSubTasks });
  }, [findTaskById, updateTask, notify]);
  const updateSubTask = useCallback((taskId: string, subTaskId: string, title: string) => {
    const task = findTaskById(taskId);
    if (!task || !task.subTasks) {
      notify.error('タスクまたはサブタスクが見つかりません');
      return;
    }

    const updatedSubTasks = task.subTasks.map(subTask =>
      subTask.id === subTaskId ? { ...subTask, title: title.trim() } : subTask
    );
    updateTask(taskId, { subTasks: updatedSubTasks });
  }, [findTaskById, updateTask, notify]);

  // サブタスクの順序変更
  const reorderSubTasks = useCallback((taskId: string, oldIndex: number, newIndex: number) => {
    const task = findTaskById(taskId);
    if (!task || !task.subTasks) {
      notify.error('タスクまたはサブタスクが見つかりません');
      return;
    }

    // 配列の順序変更
    const updatedSubTasks = [...task.subTasks];
    const removed = updatedSubTasks.splice(oldIndex, 1)[0];
    if (removed) {
      updatedSubTasks.splice(newIndex, 0, removed);
    }

    updateTask(taskId, { subTasks: updatedSubTasks });
  }, [findTaskById, updateTask, notify]);

  // 期限切れ繰り返しタスクのチェック
  const checkOverdueRecurringTasks = useCallback(() => {
    if (!boardState.currentBoard) {
      return;
    }

    let hasUpdates = false;
    const updatedColumns = boardState.currentBoard.columns.map((column, columnIndex) => {
      if (columnIndex === boardState.currentBoard!.columns.length - 1) {
        // 最後のカラム（完了カラム）はスキップ
        return column;
      }

      const newTasks: Task[] = [];

      column.tasks.forEach(task => {
        if (task.recurrence && task.dueDate && task.completedAt) {
          // 完了済みの繰り返しタスクで期限切れかチェック
          const dueDate = new Date(task.dueDate);
          const completedDate = new Date(task.completedAt);

          if (dueDate < completedDate) {
            // 期限切れなので新しいタスクを作成
            if (!isRecurrenceComplete(task.recurrence, task.occurrenceCount || 1)) {
              const nextDueDate = calculateNextDueDate(task.dueDate, task.recurrence);
              const currentCount = (task.occurrenceCount || 1) + 1;

              if (nextDueDate) {
                const newRecurringTask: Task = {
                  ...task,
                  id: uuidv4(),
                  dueDate: nextDueDate,
                  completedAt: null,
                  occurrenceCount: currentCount,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };

                newTasks.push(newRecurringTask);
                hasUpdates = true;
              }
            }
          }
        }
        newTasks.push(task);
      });

      return {
        ...column,
        tasks: newTasks,
      };
    });

    if (hasUpdates) {
      const updatedBoard = {
        ...boardState.currentBoard,
        columns: updatedColumns,
        updatedAt: new Date().toISOString(),
      };

      boardDispatch({
        type: 'UPDATE_BOARD',
        payload: { boardId: boardState.currentBoard.id, updates: updatedBoard }
      });

      notify.info('期限切れの繰り返しタスクを更新しました');
    }
  }, [boardState.currentBoard, boardDispatch, notify]);

  // メモ化されたコンテキスト値
  const contextValue = useMemo(() => ({
    state,
    createTask,
    moveTask,
    updateTask,
    deleteTask,
    duplicateTask,
    clearCompletedTasks,
    addSubTask,
    toggleSubTask,
    updateSubTask,
    deleteSubTask,
    reorderSubTasks,
    checkOverdueRecurringTasks,
    findTaskById,
    findTaskColumnId,
  }), [
    state,
    createTask,
    moveTask,
    updateTask,
    deleteTask,
    duplicateTask,
    clearCompletedTasks,
    addSubTask,
    toggleSubTask,
    updateSubTask,
    deleteSubTask,
    reorderSubTasks,
    checkOverdueRecurringTasks,
    findTaskById,
    findTaskColumnId,
  ]);

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext;