import type {
  KanbanBoard,
  Priority,
  Label,
  SubTask,
  FileAttachment,
} from "../types";
import { logger } from "./logger";

const STORAGE_KEY = "kanban-boards";

interface StoredTask {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority?: Priority;
  files?: FileAttachment[];
  subTasks?: SubTask[];
  completedAt?: string | null;
  labels?: Label[];
}

interface StoredColumn {
  id: string;
  title: string;
  tasks: StoredTask[];
}

interface StoredBoard {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  columns: StoredColumn[];
  labels?: Label[];
}

export const saveBoards = (
  boards: KanbanBoard[],
  currentBoardId?: string,
): void => {
  try {
    logger.debug("💾 Saving boards to localStorage:", boards.length, "boards");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    if (currentBoardId) {
      localStorage.setItem("current-board-id", currentBoardId);
    }
  } catch (error) {
    logger.warn("Failed to save boards to localStorage:", error);
  }
};

export const loadBoards = (): KanbanBoard[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    logger.debug(
      "📖 Loading boards from localStorage:",
      stored ? "found data" : "no data",
    );
    if (!stored) {
      return [];
    }

    const boards = JSON.parse(stored);
    if (!Array.isArray(boards)) {
      logger.warn("Invalid boards data in localStorage");
      return [];
    }
    logger.debug("📖 Loaded", boards.length, "boards from localStorage");

    return boards.map((board: StoredBoard) => ({
      ...board,
      labels: board.labels || [],
      createdAt:
        typeof board.createdAt === "string"
          ? board.createdAt
          : new Date(board.createdAt).toISOString(),
      updatedAt:
        typeof board.updatedAt === "string"
          ? board.updatedAt
          : new Date(board.updatedAt).toISOString(),
      columns: board.columns.map((column: StoredColumn) => ({
        ...column,
        tasks: column.tasks.map((task: StoredTask) => ({
          ...task,
          priority: task.priority,
          files: task.files || [],
          subTasks: task.subTasks || [],
          completedAt: task.completedAt || null,
          labels: task.labels || [],
          createdAt:
            typeof task.createdAt === "string"
              ? task.createdAt
              : new Date(task.createdAt).toISOString(),
          updatedAt:
            typeof task.updatedAt === "string"
              ? task.updatedAt
              : new Date(task.updatedAt).toISOString(),
          dueDate: task.dueDate
            ? typeof task.dueDate === "string"
              ? task.dueDate
              : new Date(task.dueDate).toISOString()
            : null,
        })),
      })),
    }));
  } catch (error) {
    logger.warn("Failed to load boards from localStorage:", error);
    return [];
  }
};

export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("current-board-id");
  } catch (error) {
    logger.warn("Failed to clear localStorage:", error);
  }
};
