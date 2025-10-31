import { useState, useCallback } from 'react';

export const useSubTaskForm = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const resetForm = useCallback((): void => {
    setTitle('');
    setIsAdding(false);
  }, []);

  const handleSubmit = useCallback(
    (onAddSubTask: (title: string) => void): void => {
      const trimmedTitle = title.trim();
      if (trimmedTitle && trimmedTitle.length > 0) {
        onAddSubTask(trimmedTitle);
        resetForm();
      }
    },
    [title, resetForm]
  );

  const handleKeyPress = useCallback(
    (
      event: React.KeyboardEvent,
      _onAddSubTask: (title: string) => void
    ): void => {
      if (event.key === 'Enter') {
        event.preventDefault();
        // Enterキーでの自動作成を無効化（ボタンクリックのみで作成）
      } else if (event.key === 'Escape') {
        event.preventDefault();
        resetForm();
      }
    },
    [resetForm]
  );

  const startAdding = useCallback((): void => {
    setIsAdding(true);
  }, []);

  const cancelAdding = useCallback((): void => {
    resetForm();
  }, [resetForm]);

  return {
    isAdding,
    title,
    setIsAdding,
    setTitle,
    handleSubmit,
    resetForm,
    handleKeyPress,
    startAdding,
    cancelAdding,
    canSubmit: title.trim().length > 0,
  };
};
