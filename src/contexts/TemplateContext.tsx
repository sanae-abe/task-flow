import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";

import type {
  TaskTemplate,
  TemplateFormData,
  TemplateFilter,
  TemplateSortConfig,
} from "../types/template";
import {
  TemplateStorage,
  TemplateStorageError,
} from "../utils/templateStorage";
import { useSonnerNotify } from "../hooks/useSonnerNotify";
import { logger } from "../utils/logger";

/**
 * テンプレートの状態
 */
interface TemplateState {
  templates: TaskTemplate[];
  isLoading: boolean;
  error: string | null;
  filter: TemplateFilter;
  sort: TemplateSortConfig;
}

/**
 * テンプレートのアクション
 */
type TemplateAction =
  | { type: "LOAD_TEMPLATES"; payload: TaskTemplate[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CREATE_TEMPLATE"; payload: TaskTemplate }
  | { type: "UPDATE_TEMPLATE"; payload: { id: string; template: TaskTemplate } }
  | { type: "DELETE_TEMPLATE"; payload: string }
  | { type: "INCREMENT_USAGE"; payload: string }
  | { type: "TOGGLE_FAVORITE"; payload: string }
  | { type: "SET_FILTER"; payload: TemplateFilter }
  | { type: "SET_SORT"; payload: TemplateSortConfig }
  | {
      type: "IMPORT_TEMPLATES";
      payload: { templates: TaskTemplate[]; merge: boolean };
    };

/**
 * テンプレートコンテキストの型
 */
interface TemplateContextType {
  state: TemplateState;
  templates: TaskTemplate[];
  filteredTemplates: TaskTemplate[];
  isLoading: boolean;
  error: string | null;
  createTemplate: (formData: TemplateFormData) => Promise<TaskTemplate>;
  updateTemplate: (
    id: string,
    updates: Partial<TemplateFormData>,
  ) => Promise<TaskTemplate | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  incrementUsage: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setFilter: (filter: TemplateFilter) => void;
  setSort: (sort: TemplateSortConfig) => void;
  clearFilter: () => void;
  importTemplates: (
    templates: TaskTemplate[],
    merge?: boolean,
  ) => Promise<void>;
  exportTemplates: () => TaskTemplate[];
  getTemplateById: (id: string) => TaskTemplate | undefined;
  getStorageInfo: () => {
    templatesCount: number;
    storageSize: number;
    version: string;
    lastUpdated: string | null;
  };
}

const TemplateContext = createContext<TemplateContextType | undefined>(
  undefined,
);

/**
 * テンプレートの初期状態
 */
const initialState: TemplateState = {
  templates: [],
  isLoading: false,
  error: null,
  filter: {},
  sort: {
    field: "updatedAt",
    direction: "desc",
  },
};

/**
 * テンプレートリデューサー
 */
const templateReducer = (
  state: TemplateState,
  action: TemplateAction,
): TemplateState => {
  switch (action.type) {
    case "LOAD_TEMPLATES":
      return {
        ...state,
        templates: action.payload,
        isLoading: false,
        error: null,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "CREATE_TEMPLATE":
      return {
        ...state,
        templates: [...state.templates, action.payload],
      };

    case "UPDATE_TEMPLATE":
      return {
        ...state,
        templates: state.templates.map((t) =>
          t.id === action.payload.id ? action.payload.template : t,
        ),
      };

    case "DELETE_TEMPLATE":
      return {
        ...state,
        templates: state.templates.filter((t) => t.id !== action.payload),
      };

    case "INCREMENT_USAGE": {
      return {
        ...state,
        templates: state.templates.map((t) =>
          t.id === action.payload
            ? {
                ...t,
                usageCount: t.usageCount + 1,
                updatedAt: new Date().toISOString(),
              }
            : t,
        ),
      };
    }

    case "TOGGLE_FAVORITE": {
      return {
        ...state,
        templates: state.templates.map((t) =>
          t.id === action.payload
            ? {
                ...t,
                isFavorite: !t.isFavorite,
                updatedAt: new Date().toISOString(),
              }
            : t,
        ),
      };
    }

    case "SET_FILTER":
      return {
        ...state,
        filter: action.payload,
      };

    case "SET_SORT":
      return {
        ...state,
        sort: action.payload,
      };

    case "IMPORT_TEMPLATES": {
      const { templates, merge } = action.payload;
      return {
        ...state,
        templates: merge ? [...state.templates, ...templates] : templates,
      };
    }

    default:
      return state;
  }
};

/**
 * テンプレートのフィルタリング
 */
const filterTemplates = (
  templates: TaskTemplate[],
  filter: TemplateFilter,
): TaskTemplate[] => {
  let filtered = [...templates];

  if (filter.category) {
    filtered = filtered.filter((t) => t.category === filter.category);
  }

  if (filter.isFavorite !== undefined) {
    filtered = filtered.filter((t) => t.isFavorite === filter.isFavorite);
  }

  if (filter.boardId) {
    filtered = filtered.filter((t) => t.boardId === filter.boardId);
  }

  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.taskTitle.toLowerCase().includes(query),
    );
  }

  return filtered;
};

/**
 * テンプレートのソート
 */
const sortTemplates = (
  templates: TaskTemplate[],
  sort: TemplateSortConfig,
): TaskTemplate[] => {
  const sorted = [...templates];

  sorted.sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sort.field) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "category":
        aValue = a.category;
        bValue = b.category;
        break;
      case "usageCount":
        aValue = a.usageCount;
        bValue = b.usageCount;
        break;
      case "createdAt":
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      case "updatedAt":
        aValue = a.updatedAt;
        bValue = b.updatedAt;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sort.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sort.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  return sorted;
};

/**
 * テンプレートプロバイダーのProps
 */
interface TemplateProviderProps {
  children: ReactNode;
}

/**
 * テンプレートプロバイダー
 */
export const TemplateProvider: React.FC<TemplateProviderProps> = ({
  children,
}) => {
  const notify = useSonnerNotify();
  const [state, dispatch] = useReducer(templateReducer, initialState);

  /**
   * 初期データの読み込み
   */
  useEffect(() => {
    const loadTemplates = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const templates = TemplateStorage.load();
        dispatch({ type: "LOAD_TEMPLATES", payload: templates });
        logger.info("Templates loaded:", templates.length);
      } catch (error) {
        const errorMessage =
          error instanceof TemplateStorageError
            ? error.message
            : "テンプレートの読み込みに失敗しました";

        logger.error("Failed to load templates:", error);
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        notify.error(errorMessage);
      }
    };

    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * テンプレートを作成
   */
  const createTemplate = useCallback(
    async (formData: TemplateFormData): Promise<TaskTemplate> => {
      try {
        const template = TemplateStorage.create(formData);
        dispatch({ type: "CREATE_TEMPLATE", payload: template });
        notify.success(`テンプレート「${template.name}」を作成しました`);
        return template;
      } catch (error) {
        const errorMessage =
          error instanceof TemplateStorageError
            ? error.message
            : "テンプレートの作成に失敗しました";

        logger.error("Failed to create template:", error);
        notify.error(errorMessage);
        throw error;
      }
    },
    [notify],
  );

  /**
   * テンプレートを更新
   */
  const updateTemplate = useCallback(
    async (
      id: string,
      updates: Partial<TemplateFormData>,
    ): Promise<TaskTemplate | null> => {
      try {
        const updatedTemplate = TemplateStorage.update(id, updates);

        if (!updatedTemplate) {
          notify.error("テンプレートが見つかりません");
          return null;
        }

        dispatch({
          type: "UPDATE_TEMPLATE",
          payload: { id, template: updatedTemplate },
        });
        notify.success(`テンプレート「${updatedTemplate.name}」を更新しました`);
        return updatedTemplate;
      } catch (error) {
        const errorMessage =
          error instanceof TemplateStorageError
            ? error.message
            : "テンプレートの更新に失敗しました";

        logger.error("Failed to update template:", error);
        notify.error(errorMessage);
        throw error;
      }
    },
    [notify],
  );

  /**
   * テンプレートを削除
   */
  const deleteTemplate = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const template = state.templates.find((t) => t.id === id);
        const success = TemplateStorage.delete(id);

        if (success) {
          dispatch({ type: "DELETE_TEMPLATE", payload: id });
          notify.success(
            `テンプレート「${template?.name || ""}」を削除しました`,
          );
        } else {
          notify.error("テンプレートが見つかりません");
        }

        return success;
      } catch (error) {
        const errorMessage =
          error instanceof TemplateStorageError
            ? error.message
            : "テンプレートの削除に失敗しました";

        logger.error("Failed to delete template:", error);
        notify.error(errorMessage);
        return false;
      }
    },
    [state.templates, notify],
  );

  /**
   * 使用回数をインクリメント
   */
  const incrementUsage = useCallback((id: string) => {
    try {
      TemplateStorage.incrementUsage(id);
      dispatch({ type: "INCREMENT_USAGE", payload: id });
    } catch (error) {
      logger.error("Failed to increment template usage:", error);
    }
  }, []);

  /**
   * お気に入りを切り替え
   */
  const toggleFavorite = useCallback(
    (id: string) => {
      try {
        const isFavorite = TemplateStorage.toggleFavorite(id);
        dispatch({ type: "TOGGLE_FAVORITE", payload: id });

        const template = state.templates.find((t) => t.id === id);
        const message = isFavorite
          ? `「${template?.name}」をお気に入りに追加しました`
          : `「${template?.name}」をお気に入りから削除しました`;
        notify.success(message);
      } catch (error) {
        logger.error("Failed to toggle template favorite:", error);
        notify.error("お気に入りの切り替えに失敗しました");
      }
    },
    [state.templates, notify],
  );

  /**
   * フィルターを設定
   */
  const setFilter = useCallback((filter: TemplateFilter) => {
    dispatch({ type: "SET_FILTER", payload: filter });
  }, []);

  /**
   * ソートを設定
   */
  const setSort = useCallback((sort: TemplateSortConfig) => {
    dispatch({ type: "SET_SORT", payload: sort });
  }, []);

  /**
   * フィルターをクリア
   */
  const clearFilter = useCallback(() => {
    dispatch({ type: "SET_FILTER", payload: {} });
  }, []);

  /**
   * テンプレートをインポート
   */
  const importTemplates = useCallback(
    async (templates: TaskTemplate[], merge = true): Promise<void> => {
      try {
        TemplateStorage.import(
          {
            version: "1.0.0",
            templates,
            updatedAt: new Date().toISOString(),
          },
          { merge },
        );

        dispatch({ type: "IMPORT_TEMPLATES", payload: { templates, merge } });

        const message = merge
          ? `${templates.length}個のテンプレートをインポートしました`
          : `${templates.length}個のテンプレートをインポートしました（既存データを置換）`;
        notify.success(message);
      } catch (error) {
        const errorMessage =
          error instanceof TemplateStorageError
            ? error.message
            : "テンプレートのインポートに失敗しました";

        logger.error("Failed to import templates:", error);
        notify.error(errorMessage);
        throw error;
      }
    },
    [notify],
  );

  /**
   * テンプレートをエクスポート
   */
  const exportTemplates = useCallback(
    (): TaskTemplate[] => state.templates,
    [state.templates],
  );

  /**
   * IDでテンプレートを取得
   */
  const getTemplateById = useCallback(
    (id: string): TaskTemplate | undefined =>
      state.templates.find((t) => t.id === id),
    [state.templates],
  );

  /**
   * ストレージ情報を取得
   */
  const getStorageInfo = useCallback(
    () => TemplateStorage.getStorageInfo(),
    [],
  );

  /**
   * フィルター・ソート済みのテンプレート
   */
  const filteredTemplates = useMemo(() => {
    const filtered = filterTemplates(state.templates, state.filter);
    return sortTemplates(filtered, state.sort);
  }, [state.templates, state.filter, state.sort]);

  /**
   * コンテキストの値
   */
  const value = useMemo(
    () => ({
      state,
      templates: state.templates,
      filteredTemplates,
      isLoading: state.isLoading,
      error: state.error,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      incrementUsage,
      toggleFavorite,
      setFilter,
      setSort,
      clearFilter,
      importTemplates,
      exportTemplates,
      getTemplateById,
      getStorageInfo,
    }),
    [
      state,
      filteredTemplates,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      incrementUsage,
      toggleFavorite,
      setFilter,
      setSort,
      clearFilter,
      importTemplates,
      exportTemplates,
      getTemplateById,
      getStorageInfo,
    ],
  );

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};

/**
 * テンプレートコンテキストを使用するフック
 */
export const useTemplate = (): TemplateContextType => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error("useTemplate must be used within a TemplateProvider");
  }
  return context;
};

export default TemplateContext;
