import { v4 as uuidv4 } from "uuid";
import type { KanbanState, KanbanAction, Task } from "../types";
import logger from "../utils/logger";

export const handleTaskActions = (
  state: KanbanState,
  action: KanbanAction,
): KanbanState => {
  switch (action.type) {
    case "ADD_TASK": {
      if (!state.currentBoard) {
        logger.warn("ADD_TASK: No current board");
        return state;
      }

      const {
        columnId,
        title,
        description,
        dueDate,
        priority = "medium",
        labels = [],
        files = [],
      } = action.payload;
      const newTask: Task = {
        id: uuidv4(),
        title,
        description: description || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: dueDate?.toISOString() || null,
        priority,
        labels,
        files,
        subTasks: [],
        completedAt: null,
      };

      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map((column) =>
          column.id === columnId
            ? { ...column, tasks: [...column.tasks, newTask] }
            : column,
        ),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        currentBoard: updatedBoard,
        boards: state.boards.map((board) =>
          board.id === state.currentBoard?.id ? updatedBoard : board,
        ),
      };
    }

    case "UPDATE_TASK": {
      if (!state.currentBoard) {
        logger.warn("UPDATE_TASK: No current board");
        return state;
      }

      const { taskId, updates } = action.payload;
      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map((column) => ({
          ...column,
          tasks: column.tasks.map((task) =>
            task.id === taskId
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task,
          ),
        })),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        currentBoard: updatedBoard,
        boards: state.boards.map((board) =>
          board.id === state.currentBoard?.id ? updatedBoard : board,
        ),
      };
    }

    case "DELETE_TASK": {
      if (!state.currentBoard) {
        logger.warn("DELETE_TASK: No current board");
        return state;
      }

      const { taskId } = action.payload;
      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => task.id !== taskId),
        })),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        currentBoard: updatedBoard,
        boards: state.boards.map((board) =>
          board.id === state.currentBoard?.id ? updatedBoard : board,
        ),
      };
    }

    case "MOVE_TASK": {
      if (!state.currentBoard) {
        logger.debug("❌ MOVE_TASK: No current board");
        return state;
      }

      const { taskId, sourceColumnId, targetColumnId, targetIndex } =
        action.payload;
      logger.debug("🚀 MOVE_TASK Action:", {
        taskId,
        sourceColumnId,
        targetColumnId,
        targetIndex,
      });

      // 移動するタスクを取得
      let taskToMove: Task | undefined;
      for (const column of state.currentBoard.columns) {
        if (column.id === sourceColumnId) {
          taskToMove = column.tasks.find((task) => task.id === taskId);
          logger.debug("📋 Task to move found:", taskToMove?.title);
          break;
        }
      }

      if (!taskToMove) {
        logger.debug("❌ MOVE_TASK: Task to move not found");
        return state;
      }

      // 最右端のカラムかどうかを判定
      const isTargetRightmost =
        targetColumnId ===
        state.currentBoard.columns[state.currentBoard.columns.length - 1]?.id;
      const isSourceRightmost =
        sourceColumnId ===
        state.currentBoard.columns[state.currentBoard.columns.length - 1]?.id;

      // completedAtを設定
      const updatedTask = { ...taskToMove };
      if (isTargetRightmost && !isSourceRightmost) {
        logger.debug("✅ Setting completedAt for task completion");
        updatedTask.completedAt = new Date().toISOString();
        updatedTask.updatedAt = new Date().toISOString();
      } else if (!isTargetRightmost && isSourceRightmost) {
        logger.debug("🔄 Clearing completedAt for task reopening");
        updatedTask.completedAt = null;
        updatedTask.updatedAt = new Date().toISOString();
      }

      // 各カラムを更新
      const updatedColumns = state.currentBoard.columns.map((column) => {
        logger.debug(
          `🔍 Processing column '${column.title}' (ID: ${column.id})`,
        );

        if (column.id === sourceColumnId && column.id === targetColumnId) {
          // 同じカラム内での並び替え
          logger.debug(`🔄 Same column reorder in '${column.title}'`);
          const newTasks = [...column.tasks];
          const taskIndex = newTasks.findIndex((task) => task.id === taskId);

          if (taskIndex !== -1) {
            const [movedTask] = newTasks.splice(taskIndex, 1);
            logger.debug(`📤 Removed task from index ${taskIndex}`);

            const safeTargetIndex = Math.max(
              0,
              Math.min(targetIndex, newTasks.length),
            );
            newTasks.splice(safeTargetIndex, 0, {
              ...movedTask,
              ...updatedTask,
            });
            logger.debug(
              `📥 Added task at index ${safeTargetIndex}: ${column.tasks.length} → ${newTasks.length}`,
            );
          }

          return {
            ...column,
            tasks: newTasks,
          };
        } else if (column.id === sourceColumnId) {
          // ソースカラムからタスクを削除
          const filteredTasks = column.tasks.filter(
            (task) => task.id !== taskId,
          );
          logger.debug(
            `📤 Removing from source column '${column.title}': ${column.tasks.length} → ${filteredTasks.length}`,
          );
          return {
            ...column,
            tasks: filteredTasks,
          };
        } else if (column.id === targetColumnId) {
          // ターゲットカラムにタスクを作成
          const newTasks = [...column.tasks];
          const safeTargetIndex = Math.max(
            0,
            Math.min(targetIndex, newTasks.length),
          );
          newTasks.splice(safeTargetIndex, 0, updatedTask);
          logger.debug(
            `📥 Adding to target column '${column.title}' at index ${safeTargetIndex}: ${newTasks.length} → ${newTasks.length + 1}`,
          );
          return {
            ...column,
            tasks: newTasks,
          };
        }

        // 関係のないカラムはそのまま
        logger.debug(
          `⏭️ Skipping column '${column.title}' (not source or target)`,
        );
        return column;
      });

      logger.debug("✅ MOVE_TASK: Board updated successfully");

      const updatedBoard = {
        ...state.currentBoard,
        columns: updatedColumns,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        currentBoard: updatedBoard,
        boards: state.boards.map((board) =>
          board.id === state.currentBoard?.id ? updatedBoard : board,
        ),
      };
    }

    default:
      return state;
  }
};
