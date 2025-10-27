import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";

import type {
  Task,
  Label,
  SubTask,
  FileAttachment,
  RecurrenceConfig,
  Priority,
} from "../types";
import { useSonnerNotify } from "../hooks/useSonnerNotify";
import { useBoard } from "./BoardContext";
import {
  calculateNextDueDate,
  calculateNextCreationDate,
  isRecurrenceComplete,
} from "../utils/recurrence";
import { logger } from "../utils/logger";

interface TaskState {
  // Task操作の一時的な状態をここに追加可能
  isProcessing: boolean;
}

type TaskAction = { type: "SET_PROCESSING"; payload: boolean };

interface TaskContextType {
  state: TaskState;
  createTask: (
    columnId: string,
    title: string,
    description: string,
    dueDate?: Date,
    labels?: Label[],
    attachments?: FileAttachment[],
    recurrence?: RecurrenceConfig,
    priority?: Priority,
  ) => void;
  moveTask: (
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    targetIndex: number,
  ) => void;
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
    case "SET_PROCESSING":
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
  const notify = useSonnerNotify();
  const { state: boardState, dispatch: boardDispatch } = useBoard();

  const [state] = useReducer(taskReducer, {
    isProcessing: false,
  });

  // 重複実行防止のためのRef
  const processingTasksRef = useRef<Set<string>>(new Set());

  // ヘルパー関数: タスクをIDで検索
  const findTaskById = useCallback(
    (taskId: string): Task | null => {
      if (!boardState.currentBoard) {
        return null;
      }

      for (const column of boardState.currentBoard.columns) {
        const task = column.tasks.find((task) => task.id === taskId);
        if (task) {
          return task;
        }
      }
      return null;
    },
    [boardState.currentBoard],
  );

  // ヘルパー関数: タスクのカラムIDを取得
  const findTaskColumnId = useCallback(
    (taskId: string): string | null => {
      if (!boardState.currentBoard) {
        return null;
      }

      for (const column of boardState.currentBoard.columns) {
        if (column.tasks.some((task) => task.id === taskId)) {
          return column.id;
        }
      }
      return null;
    },
    [boardState.currentBoard],
  );

  // タスク作成
  const createTask = useCallback(
    (
      columnId: string,
      title: string,
      description: string,
      dueDate?: Date,
      labels?: Label[],
      attachments?: FileAttachment[],
      recurrence?: RecurrenceConfig,
      priority?: Priority,
    ) => {
      if (!boardState.currentBoard) {
        notify._error("ボードが選択されていません");
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
        columns: boardState.currentBoard.columns.map((column) =>
          column.id === columnId
            ? { ...column, tasks: [...column.tasks, newTask] }
            : column,
        ),
        updatedAt: new Date().toISOString(),
      };

      boardDispatch({
        type: "UPDATE_BOARD",
        payload: { boardId: boardState.currentBoard.id, updates: updatedBoard },
      });
    },
    [boardState.currentBoard, boardDispatch, notify],
  );

  // タスク移動
  const moveTask = useCallback(
    (
      taskId: string,
      sourceColumnId: string,
      targetColumnId: string,
      targetIndex: number,
    ) => {
      if (!boardState.currentBoard) {
        notify._error("ボードが選択されていません");
        return;
      }

      // 🔧 ULTIMATE FIX: より強力な重複実行防止
      const operationKey = `${taskId}:${sourceColumnId}:${targetColumnId}`;
      
      // 重複実行防止チェック
      if (processingTasksRef.current.has(operationKey)) {
        return;
      }

      // 処理開始をマーク
      processingTasksRef.current.add(operationKey);

      // 🔧 CRITICAL FIX: 1つのタイムスタンプを使い回す
      const now = new Date();
      const currentTimestamp = now.toISOString();

      // 2秒後に自動的にロックを解除（React Strict Mode対策強化）
      const lockTimer = setTimeout(() => {
        processingTasksRef.current.delete(operationKey);
      }, 2000); // より長い時間

      try {
        // 早期リターンで不要な処理を回避
        if (sourceColumnId === targetColumnId) {
          // 同じカラム内での移動は位置変更のみ
          const column = boardState.currentBoard.columns.find(
            (col) => col.id === sourceColumnId,
          );
          if (!column) {
            logger._error("Column not found for same column move", { sourceColumnId, taskId });
            return;
          }

          const taskIndex = column.tasks.findIndex((task) => task.id === taskId);
          if (taskIndex === -1 || taskIndex === targetIndex) {
            return;
          }

          const newTasks = [...column.tasks];
          const [movedTask] = newTasks.splice(taskIndex, 1);
          const safeTargetIndex = Math.max(0, Math.min(targetIndex, newTasks.length));
          newTasks.splice(safeTargetIndex, 0, {
            ...movedTask,
            updatedAt: currentTimestamp, // 🔧 統一されたタイムスタンプ使用
          } as Task);

          // 該当カラムのみを更新
          const updatedColumns = boardState.currentBoard.columns.map((col) =>
            col.id === sourceColumnId ? { ...col, tasks: newTasks } : col
          );

          boardDispatch({
            type: "UPDATE_BOARD",
            payload: {
              boardId: boardState.currentBoard.id,
              updates: {
                ...boardState.currentBoard,
                columns: updatedColumns,
                updatedAt: currentTimestamp, // 🔧 統一されたタイムスタンプ使用
              },
            },
          });
          return;
        }

        // 異なるカラム間での移動
        const taskToMove = findTaskById(taskId);
        if (!taskToMove) {
          logger._error("Task not found for different column move", { taskId, sourceColumnId, targetColumnId });
          return;
        }

        const sourceColumn = boardState.currentBoard.columns.find(
          (col) => col.id === sourceColumnId,
        );
        const targetColumn = boardState.currentBoard.columns.find(
          (col) => col.id === targetColumnId,
        );

        if (!sourceColumn || !targetColumn) {
          return;
        }

        // 完了状態の判定（最適化）
        const rightmostColumnIndex = boardState.currentBoard.columns.length - 1;
        const targetColumnIndex = boardState.currentBoard.columns.findIndex(
          (col) => col.id === targetColumnId,
        );
        const sourceColumnIndex = boardState.currentBoard.columns.findIndex(
          (col) => col.id === sourceColumnId,
        );

        const isMovingToCompleted = targetColumnIndex === rightmostColumnIndex;
        const isMovingFromCompleted = sourceColumnIndex === rightmostColumnIndex;

        const updatedTask = {
          ...taskToMove,
          updatedAt: currentTimestamp, // 🔧 統一されたタイムスタンプ使用
          completedAt: isMovingToCompleted
            ? currentTimestamp // 🔧 統一されたタイムスタンプ使用
            : isMovingFromCompleted
              ? null
              : taskToMove.completedAt,
        };

        // 最小限の更新：影響を受けるカラムのみを変更
        const updatedColumns = boardState.currentBoard.columns.map((column) => {
          if (column.id === sourceColumnId) {
            return {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== taskId),
            };
          }
          if (column.id === targetColumnId) {
            const newTasks = [...column.tasks];
            const safeTargetIndex = Math.max(0, Math.min(targetIndex, newTasks.length));
            newTasks.splice(safeTargetIndex, 0, updatedTask);
            return {
              ...column,
              tasks: newTasks,
            };
          }
          return column; // 変更なしのカラムはそのまま返す
        });

        boardDispatch({
          type: "UPDATE_BOARD",
          payload: {
            boardId: boardState.currentBoard.id,
            updates: {
              ...boardState.currentBoard,
              columns: updatedColumns,
              updatedAt: currentTimestamp, // 🔧 統一されたタイムスタンプ使用
            },
          },
        });

        logger.debug("Task moved successfully:", {
          taskId,
          sourceColumnId,
          targetColumnId,
          targetIndex,
          operationKey,
        });
      } finally {
        // タイマーをクリア
        clearTimeout(lockTimer);
        // 処理完了をマーク（成功・失敗に関わらず）
        processingTasksRef.current.delete(operationKey);
      }
    },
    [boardState.currentBoard, findTaskById, boardDispatch, notify],
  );;;;;

  // タスク更新
  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      if (!boardState.currentBoard) {
        notify._error("ボードが選択されていません");
        return;
      }

      const updatedBoard = {
        ...boardState.currentBoard,
        columns: boardState.currentBoard.columns.map((column) => ({
          ...column,
          tasks: column.tasks.map((task) =>
            task.id === taskId
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task,
          ),
        })),
        updatedAt: new Date().toISOString(),
      };

      boardDispatch({
        type: "UPDATE_BOARD",
        payload: { boardId: boardState.currentBoard.id, updates: updatedBoard },
      });

      notify.success("タスクを更新しました");
    },
    [boardState.currentBoard, boardDispatch, notify],
  );

  // タスク削除
  const deleteTask = useCallback(
    (taskId: string, columnId: string) => {
      if (!boardState.currentBoard) {
        notify._error("ボードが選択されていません");
        return;
      }

      const updatedBoard = {
        ...boardState.currentBoard,
        columns: boardState.currentBoard.columns.map((column) =>
          column.id === columnId
            ? {
                ...column,
                tasks: column.tasks.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        deletionState: "deleted" as const,
                        deletedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      }
                    : task,
                ),
              }
            : column,
        ),
        updatedAt: new Date().toISOString(),
      };

      boardDispatch({
        type: "UPDATE_BOARD",
        payload: { boardId: boardState.currentBoard.id, updates: updatedBoard },
      });

      notify.success("タスクをゴミ箱に移動しました");
    },
    [boardState.currentBoard, boardDispatch, notify],
  );
  // タスク複製
  const duplicateTask = useCallback(
    (taskId: string) => {
      if (!boardState.currentBoard) {
        notify._error("ボードが選択されていません");
        return;
      }

      const originalTask = findTaskById(taskId);
      if (!originalTask) {
        notify._error("複製するタスクが見つかりません");
        return;
      }

      const sourceColumnId = findTaskColumnId(taskId);
      if (!sourceColumnId) {
        notify._error("タスクのカラムが見つかりません");
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
        subTasks:
          originalTask.subTasks?.map((subTask) => ({
            ...subTask,
            id: uuidv4(),
            completed: false, // サブタスクも未完了状態にリセット
            createdAt: new Date().toISOString(),
          })) || [],
      };

      // 元のタスクと同じカラムに追加
      const updatedBoard = {
        ...boardState.currentBoard,
        columns: boardState.currentBoard.columns.map((column) =>
          column.id === sourceColumnId
            ? { ...column, tasks: [...column.tasks, duplicatedTask] }
            : column,
        ),
        updatedAt: new Date().toISOString(),
      };

      boardDispatch({
        type: "UPDATE_BOARD",
        payload: { boardId: boardState.currentBoard.id, updates: updatedBoard },
      });

      notify.success(`タスク「${originalTask.title}」を複製しました`);
    },
    [
      boardState.currentBoard,
      findTaskById,
      findTaskColumnId,
      boardDispatch,
      notify,
    ],
  );

  // 完了済みタスクのクリア
  const clearCompletedTasks = useCallback(() => {
    if (!boardState.currentBoard) {
      notify._error("ボードが選択されていません");
      return;
    }

    // 最右カラム（完了カラム）のタスクを取得
    const rightmostColumnIndex = boardState.currentBoard.columns.length - 1;
    const rightmostColumn =
      boardState.currentBoard.columns[rightmostColumnIndex];

    if (!rightmostColumn) {
      notify._error("完了カラムが見つかりません");
      return;
    }

    const completedTaskCount = rightmostColumn.tasks.length;

    if (completedTaskCount === 0) {
      notify.info("削除対象の完了タスクがありません");
      return;
    }

    // 🔧 修正: ソフトデリートを適用
    const updatedBoard = {
      ...boardState.currentBoard,
      columns: boardState.currentBoard.columns.map((column, index) =>
        index === rightmostColumnIndex
          ? {
              ...column,
              tasks: column.tasks.map((task) => ({
                ...task,
                deletionState: "deleted" as const,
                deletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })),
            }
          : column,
      ),
      updatedAt: new Date().toISOString(),
    };

    boardDispatch({
      type: "UPDATE_BOARD",
      payload: { boardId: boardState.currentBoard.id, updates: updatedBoard },
    });

    notify.success(`${completedTaskCount}件の完了済みタスクをゴミ箱に移動しました`);

    logger.info("Completed tasks moved to recycle bin:", {
      deletedCount: completedTaskCount,
      boardId: boardState.currentBoard.id,
    });
  }, [boardState.currentBoard, boardDispatch, notify]);

  // サブタスク追加
  const addSubTask = useCallback(
    (taskId: string, title: string) => {
      const newSubTask: SubTask = {
        id: uuidv4(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      const task = findTaskById(taskId);
      if (!task) {
        notify._error("タスクが見つかりません");
        return;
      }

      updateTask(taskId, {
        subTasks: [...(task.subTasks || []), newSubTask],
      });
    },
    [findTaskById, updateTask, notify],
  );

  // サブタスク切り替え
  const toggleSubTask = useCallback(
    (taskId: string, subTaskId: string) => {
      const task = findTaskById(taskId);
      if (!task || !task.subTasks) {
        notify._error("タスクまたはサブタスクが見つかりません");
        return;
      }

      const updatedSubTasks = task.subTasks.map((subTask) =>
        subTask.id === subTaskId
          ? { ...subTask, completed: !subTask.completed }
          : subTask,
      );

      updateTask(taskId, { subTasks: updatedSubTasks });
    },
    [findTaskById, updateTask, notify],
  );

  // サブタスク削除
  const deleteSubTask = useCallback(
    (taskId: string, subTaskId: string) => {
      const task = findTaskById(taskId);
      if (!task || !task.subTasks) {
        notify._error("タスクまたはサブタスクが見つかりません");
        return;
      }

      const updatedSubTasks = task.subTasks.filter(
        (subTask) => subTask.id !== subTaskId,
      );
      updateTask(taskId, { subTasks: updatedSubTasks });
    },
    [findTaskById, updateTask, notify],
  );
  const updateSubTask = useCallback(
    (taskId: string, subTaskId: string, title: string) => {
      const task = findTaskById(taskId);
      if (!task || !task.subTasks) {
        notify._error("タスクまたはサブタスクが見つかりません");
        return;
      }

      const updatedSubTasks = task.subTasks.map((subTask) =>
        subTask.id === subTaskId
          ? { ...subTask, title: title.trim() }
          : subTask,
      );
      updateTask(taskId, { subTasks: updatedSubTasks });
    },
    [findTaskById, updateTask, notify],
  );

  // サブタスクの順序変更
  const reorderSubTasks = useCallback(
    (taskId: string, oldIndex: number, newIndex: number) => {
      const task = findTaskById(taskId);
      if (!task || !task.subTasks) {
        notify._error("タスクまたはサブタスクが見つかりません");
        return;
      }

      // 配列の順序変更
      const updatedSubTasks = [...task.subTasks];
      const removed = updatedSubTasks.splice(oldIndex, 1)[0];
      if (removed) {
        updatedSubTasks.splice(newIndex, 0, removed);
      }

      updateTask(taskId, { subTasks: updatedSubTasks });
    },
    [findTaskById, updateTask, notify],
  );

  // 期限切れ繰り返しタスクのチェック
  const checkOverdueRecurringTasks = useCallback(() => {
    if (!boardState.currentBoard) {
      return;
    }

    let hasUpdates = false;
    const currentBoard = boardState.currentBoard; // ローカル変数として保持
    const updatedColumns = currentBoard.columns.map((column, columnIndex) => {
      if (columnIndex === currentBoard.columns.length - 1) {
        // 最後のカラム（完了カラム）はスキップ
        return column;
      }

      const newTasks: Task[] = [];

      column.tasks.forEach((task) => {
        if (task.recurrence && task.completedAt) {
          if (
            !isRecurrenceComplete(task.recurrence, task.occurrenceCount || 1)
          ) {
            const currentCount = (task.occurrenceCount || 1) + 1;
            let shouldCreateNext = false;
            let nextDate: string | null = null;

            if (task.dueDate) {
              // 期限ありタスクの場合：期限切れかチェック
              const dueDate = new Date(task.dueDate);
              const completedDate = new Date(task.completedAt);

              if (dueDate < completedDate) {
                // 期限切れなので新しいタスクを作成
                nextDate = calculateNextDueDate(task.dueDate, task.recurrence);
                shouldCreateNext = true;
              }
            } else {
              // 期限なしタスクの場合：作成日から次回作成日を計算
              const nextCreationDate = calculateNextCreationDate(
                task.createdAt,
                task.recurrence,
              );
              const now = new Date();
              const nextCreation = nextCreationDate
                ? new Date(nextCreationDate)
                : null;

              // 次回作成日が現在時刻を過ぎている場合は新しいタスクを作成
              if (nextCreation && nextCreation <= now) {
                nextDate = nextCreationDate;
                shouldCreateNext = true;
              }
            }

            if (shouldCreateNext && nextDate) {
              const newRecurringTask: Task = {
                ...task,
                id: uuidv4(),
                dueDate: task.dueDate ? nextDate : null,
                completedAt: null,
                occurrenceCount: currentCount,
                createdAt: task.dueDate ? new Date().toISOString() : nextDate,
                updatedAt: new Date().toISOString(),
              };

              newTasks.push(newRecurringTask);
              hasUpdates = true;
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
        type: "UPDATE_BOARD",
        payload: { boardId: boardState.currentBoard.id, updates: updatedBoard },
      });

      notify.info("期限切れの繰り返しタスクを更新しました");
    }
  }, [boardState.currentBoard, boardDispatch, notify]);

  // メモ化されたコンテキスト値
  const contextValue = useMemo(
    () => ({
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
    }),
    [
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
    ],
  );

  return (
    <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>
  );
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};

export default TaskContext;
