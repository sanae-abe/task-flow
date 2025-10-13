import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";

import type { SortOption, TaskFilter, ViewMode } from "../types";
import type { VirtualRecurringTask } from "../utils/calendarRecurrence";
import { logger } from "../utils/logger";

interface UIState {
  sortOption: SortOption;
  taskFilter: TaskFilter;
  viewMode: ViewMode;
  selectedTaskId: string | null;
  virtualTaskInfo: VirtualRecurringTask | null;
  isTaskDetailOpen: boolean;
  isTaskFormOpen: boolean;
  isHelpOpen: boolean;
  taskFormDefaultDate?: Date;
  taskFormDefaultStatus?: string;
}

type UIAction =
  | { type: "SET_SORT_OPTION"; payload: SortOption }
  | { type: "SET_TASK_FILTER"; payload: TaskFilter }
  | { type: "SET_VIEW_MODE"; payload: ViewMode }
  | { type: "OPEN_TASK_DETAIL"; payload: { taskId: string } }
  | { type: "OPEN_VIRTUAL_TASK_DETAIL"; payload: { virtualTask: VirtualRecurringTask } }
  | { type: "CLOSE_TASK_DETAIL" }
  | {
      type: "OPEN_TASK_FORM";
      payload?: { defaultDate?: Date; defaultStatus?: string };
    }
  | { type: "CLOSE_TASK_FORM" }
  | { type: "OPEN_HELP" }
  | { type: "CLOSE_HELP" }
  | { type: "LOAD_SORT_OPTION"; payload: SortOption };

interface UIContextType {
  state: UIState;
  sortOption: SortOption;
  taskFilter: TaskFilter;
  dispatch: React.Dispatch<UIAction>;
  setSortOption: (option: SortOption) => void;
  setTaskFilter: (filter: TaskFilter) => void;
  setViewMode: (mode: ViewMode) => void;
  openTaskDetail: (taskId: string) => void;
  openVirtualTaskDetail: (virtualTask: VirtualRecurringTask) => void;
  closeTaskDetail: () => void;
  openTaskForm: (defaultDate?: Date, defaultStatus?: string) => void;
  closeTaskForm: () => void;
  openHelp: () => void;
  closeHelp: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

// LocalStorage操作のヘルパー関数
const saveSortOption = (sortOption: SortOption) => {
  try {
    localStorage.setItem("sort-option", JSON.stringify(sortOption));
  } catch (error) {
    logger.warn("Failed to save sort option to localStorage:", error);
  }
};

const loadSortOption = (): SortOption => {
  try {
    const saved = localStorage.getItem("sort-option");
    return saved ? JSON.parse(saved) : "createdAt";
  } catch (error) {
    logger.warn("Failed to load sort option from localStorage:", error);
    return "createdAt";
  }
};

const saveTaskFilter = (filter: TaskFilter) => {
  try {
    localStorage.setItem("task-filter", JSON.stringify(filter));
  } catch (error) {
    logger.warn("Failed to save task filter to localStorage:", error);
  }
};

const loadTaskFilter = (): TaskFilter => {
  try {
    const saved = localStorage.getItem("task-filter");
    return saved ? JSON.parse(saved) : { type: "all", label: "すべて" };
  } catch (error) {
    logger.warn("Failed to load task filter from localStorage:", error);
    return { type: "all", label: "すべて" };
  }
};

const saveViewMode = (mode: ViewMode) => {
  try {
    localStorage.setItem("view-mode", mode);
  } catch (error) {
    logger.warn("Failed to save view mode to localStorage:", error);
  }
};

const loadViewMode = (): ViewMode => {
  try {
    const saved = localStorage.getItem("view-mode") as ViewMode;
    return saved || "kanban";
  } catch (error) {
    logger.warn("Failed to load view mode from localStorage:", error);
    return "kanban";
  }
};

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case "LOAD_SORT_OPTION":
      return {
        ...state,
        sortOption: action.payload,
      };

    case "SET_SORT_OPTION":
      saveSortOption(action.payload);
      return {
        ...state,
        sortOption: action.payload,
      };

    case "SET_TASK_FILTER":
      saveTaskFilter(action.payload);
      return {
        ...state,
        taskFilter: action.payload,
      };

    case "SET_VIEW_MODE":
      saveViewMode(action.payload);
      return {
        ...state,
        viewMode: action.payload,
      };

    case "OPEN_TASK_DETAIL":
      return {
        ...state,
        selectedTaskId: action.payload.taskId,
        virtualTaskInfo: null, // 通常のタスクの場合は仮想タスク情報をクリア
        isTaskDetailOpen: true,
        isHelpOpen: false, // タスク詳細を開くときにヘルプを閉じる
      };

    case "OPEN_VIRTUAL_TASK_DETAIL":
      return {
        ...state,
        selectedTaskId: action.payload.virtualTask.originalTaskId,
        virtualTaskInfo: action.payload.virtualTask,
        isTaskDetailOpen: true,
        isHelpOpen: false, // タスク詳細を開くときにヘルプを閉じる
      };

    case "CLOSE_TASK_DETAIL":
      return {
        ...state,
        selectedTaskId: null,
        virtualTaskInfo: null,
        isTaskDetailOpen: false,
      };

    case "OPEN_HELP":
      return {
        ...state,
        isHelpOpen: true,
        isTaskDetailOpen: false, // ヘルプを開くときにタスク詳細を閉じる
        selectedTaskId: null,
        virtualTaskInfo: null,
      };

    case "CLOSE_HELP":
      return {
        ...state,
        isHelpOpen: false,
      };

    case "OPEN_TASK_FORM":
      return {
        ...state,
        isTaskFormOpen: true,
        taskFormDefaultDate: action.payload?.defaultDate,
        taskFormDefaultStatus: action.payload?.defaultStatus,
      };

    case "CLOSE_TASK_FORM":
      return {
        ...state,
        isTaskFormOpen: false,
        taskFormDefaultDate: undefined,
        taskFormDefaultStatus: undefined,
      };

    default:
      return state;
  }
};

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, {
    sortOption: "createdAt",
    taskFilter: { type: "all", label: "すべて" },
    viewMode: "kanban",
    selectedTaskId: null,
    virtualTaskInfo: null,
    isTaskDetailOpen: false,
    isTaskFormOpen: false,
    isHelpOpen: false,
  });

  // 初期データの読み込み
  useEffect(() => {
    const loadInitialUIData = () => {
      try {
        const sortOption = loadSortOption();
        const taskFilter = loadTaskFilter();
        const viewMode = loadViewMode();

        dispatch({ type: "LOAD_SORT_OPTION", payload: sortOption });
        dispatch({ type: "SET_TASK_FILTER", payload: taskFilter });
        dispatch({ type: "SET_VIEW_MODE", payload: viewMode });
      } catch (error) {
        logger.error("Failed to load initial UI data:", error);
      }
    };

    loadInitialUIData();
  }, []);

  // メモ化されたアクション関数
  const setSortOption = useCallback((option: SortOption) => {
    dispatch({ type: "SET_SORT_OPTION", payload: option });
  }, []);

  const setTaskFilter = useCallback((filter: TaskFilter) => {
    dispatch({ type: "SET_TASK_FILTER", payload: filter });
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  }, []);

  const openTaskDetail = useCallback((taskId: string) => {
    dispatch({ type: "OPEN_TASK_DETAIL", payload: { taskId } });
  }, []);

  const openVirtualTaskDetail = useCallback((virtualTask: VirtualRecurringTask) => {
    dispatch({ type: "OPEN_VIRTUAL_TASK_DETAIL", payload: { virtualTask } });
  }, []);

  const closeTaskDetail = useCallback(() => {
    dispatch({ type: "CLOSE_TASK_DETAIL" });
  }, []);

  const openTaskForm = useCallback(
    (defaultDate?: Date, defaultStatus?: string) => {
      dispatch({
        type: "OPEN_TASK_FORM",
        payload: { defaultDate, defaultStatus },
      });
    },
    [],
  );

  const closeTaskForm = useCallback(() => {
    dispatch({ type: "CLOSE_TASK_FORM" });
  }, []);

  const openHelp = useCallback(() => {
    dispatch({ type: "OPEN_HELP" });
  }, []);

  const closeHelp = useCallback(() => {
    dispatch({ type: "CLOSE_HELP" });
  }, []);

  // メモ化されたコンテキスト値
  const contextValue = useMemo(
    () => ({
      state,
      sortOption: state.sortOption,
      taskFilter: state.taskFilter,
      dispatch,
      setSortOption,
      setTaskFilter,
      setViewMode,
      openTaskDetail,
      openVirtualTaskDetail,
      closeTaskDetail,
      openTaskForm,
      closeTaskForm,
      openHelp,
      closeHelp,
    }),
    [
      state,
      setSortOption,
      setTaskFilter,
      setViewMode,
      openTaskDetail,
      openVirtualTaskDetail,
      closeTaskDetail,
      openTaskForm,
      closeTaskForm,
      openHelp,
      closeHelp,
    ],
  );

  return (
    <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};

export default UIContext;
