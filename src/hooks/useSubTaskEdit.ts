import { useState, useCallback } from "react";

export interface UseSubTaskEditReturn {
  editingId: string | null;
  editingTitle: string;
  startEdit: (subTaskId: string, currentTitle: string) => void;
  updateEditingTitle: (title: string) => void;
  saveEdit: (onSave: (title: string) => void) => void;
  cancelEdit: () => void;
  isEditing: (subTaskId: string) => boolean;
}

export const useSubTaskEdit = (): UseSubTaskEditReturn => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  const startEdit = useCallback((subTaskId: string, currentTitle: string) => {
    setEditingId(subTaskId);
    setEditingTitle(currentTitle);
  }, []);

  const updateEditingTitle = useCallback((title: string) => {
    setEditingTitle(title);
  }, []);

  const saveEdit = useCallback(
    (onSave: (title: string) => void) => {
      const trimmedTitle = editingTitle.trim();
      if (trimmedTitle && editingId) {
        onSave(trimmedTitle);
        setEditingId(null);
        setEditingTitle("");
      }
    },
    [editingId, editingTitle],
  );

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingTitle("");
  }, []);

  const isEditing = useCallback(
    (subTaskId: string) => editingId === subTaskId,
    [editingId],
  );

  return {
    editingId,
    editingTitle,
    startEdit,
    updateEditingTitle,
    saveEdit,
    cancelEdit,
    isEditing,
  };
};
