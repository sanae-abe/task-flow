import { useState, useRef, useEffect } from 'react';

interface UseSubTaskEditOptions {
  initialTitle: string;
  onEdit: (subTaskId: string, newTitle: string) => void;
  subTaskId: string;
}

export const useSubTaskEdit = ({
  initialTitle,
  onEdit,
  subTaskId,
}: UseSubTaskEditOptions) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null!);

  // 編集開始
  const startEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditing(true);
    setEditTitle(initialTitle);
  };

  // 編集保存
  const saveEdit = () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== initialTitle) {
      onEdit(subTaskId, trimmedTitle);
    }
    setIsEditing(false);
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setIsEditing(false);
    setEditTitle(initialTitle);
  };

  // キーボードイベント処理
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
    }
  };

  // 編集モードに入ったときにフォーカスを当てる
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return {
    isEditing,
    editTitle,
    setEditTitle,
    inputRef,
    startEdit,
    saveEdit,
    cancelEdit,
    handleKeyDown,
  };
};
