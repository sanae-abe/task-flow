import { useState, useEffect, useCallback } from "react";
import type { TaskTemplate, TemplateFormData } from "../types/template";
import { TemplateStorage } from "../utils/templateStorage";

interface UseTemplateManagementReturn {
  templates: TaskTemplate[];
  loading: boolean;
  _error: string | null;
  createTemplate: (data: TemplateFormData) => Promise<TaskTemplate | null>;
  updateTemplate: (
    id: string,
    data: TemplateFormData,
  ) => Promise<TaskTemplate | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  reloadTemplates: () => void;
}

/**
 * テンプレート管理のCRUD操作を提供するカスタムフック
 */
export const useTemplateManagement = (): UseTemplateManagementReturn => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  // テンプレートをLocalStorageから読み込み
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedTemplates = TemplateStorage.load();
      setTemplates(loadedTemplates);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Failed to load templates:", err);
      setError("テンプレートの読み込みに失敗しました");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回ロード
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // テンプレート作成
  const createTemplate = useCallback(
    async (data: TemplateFormData): Promise<TaskTemplate | null> => {
      try {
        setError(null);
        const newTemplate = TemplateStorage.create(data);
        setTemplates((prev) => [...prev, newTemplate]);
        return newTemplate;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to create template:", err);
        setError("テンプレートの作成に失敗しました");
        return null;
      }
    },
    [],
  );

  // テンプレート更新
  const updateTemplate = useCallback(
    async (
      id: string,
      data: TemplateFormData,
    ): Promise<TaskTemplate | null> => {
      try {
        setError(null);
        const updatedTemplate = TemplateStorage.update(id, data);
        if (updatedTemplate) {
          setTemplates((prev) =>
            prev.map((t) => (t.id === id ? updatedTemplate : t)),
          );
          return updatedTemplate;
        }
        setError("テンプレートが見つかりませんでした");
        return null;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to update template:", err);
        setError("テンプレートの更新に失敗しました");
        return null;
      }
    },
    [],
  );

  // テンプレート削除
  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = TemplateStorage.delete(id);
      if (success) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        return true;
      }
      setError("テンプレートの削除に失敗しました");
      return false;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete template:", err);
      setError("テンプレートの削除に失敗しました");
      return false;
    }
  }, []);

  // お気に入りトグル
  const toggleFavorite = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const newFavoriteState = TemplateStorage.toggleFavorite(id);
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, isFavorite: newFavoriteState } : t,
        ),
      );
      return newFavoriteState;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to toggle favorite:", err);
      setError("お気に入りの変更に失敗しました");
      return false;
    }
  }, []);

  return {
    templates,
    loading,
    _error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleFavorite,
    reloadTemplates: loadTemplates,
  };
};
