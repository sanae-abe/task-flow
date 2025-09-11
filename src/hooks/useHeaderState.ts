import { useState, useCallback } from 'react';
import { useKanban } from '../contexts/KanbanContext';

interface UseHeaderStateReturn {
  isCreatingBoard: boolean;
  handleCreateBoard: (title: string) => void;
  handleStartCreate: () => void;
  handleCancelCreate: () => void;
}

export const useHeaderState = (): UseHeaderStateReturn => {
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const { createBoard } = useKanban();

  const handleCreateBoard = useCallback((title: string) => {
    createBoard(title);
    setIsCreatingBoard(false);
  }, [createBoard]);

  const handleStartCreate = useCallback(() => {
    setIsCreatingBoard(true);
  }, []);

  const handleCancelCreate = useCallback(() => {
    setIsCreatingBoard(false);
  }, []);

  return {
    isCreatingBoard,
    handleCreateBoard,
    handleStartCreate,
    handleCancelCreate
  };
};