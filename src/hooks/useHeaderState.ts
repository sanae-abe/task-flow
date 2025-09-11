import { useState, useCallback } from 'react';
import { useKanban } from '../contexts/KanbanContext';

interface UseHeaderStateReturn {
  isCreatingBoard: boolean;
  newBoardTitle: string;
  setNewBoardTitle: (title: string) => void;
  handleCreateBoard: () => void;
  handleStartCreate: () => void;
  handleCancelCreate: () => void;
}

export const useHeaderState = (): UseHeaderStateReturn => {
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const { createBoard } = useKanban();

  const handleCreateBoard = useCallback(() => {
    if (newBoardTitle.trim()) {
      createBoard(newBoardTitle.trim());
      setNewBoardTitle('');
      setIsCreatingBoard(false);
    }
  }, [newBoardTitle, createBoard]);

  const handleStartCreate = useCallback(() => {
    setIsCreatingBoard(true);
  }, []);

  const handleCancelCreate = useCallback(() => {
    setNewBoardTitle('');
    setIsCreatingBoard(false);
  }, []);

  return {
    isCreatingBoard,
    newBoardTitle,
    setNewBoardTitle,
    handleCreateBoard,
    handleStartCreate,
    handleCancelCreate
  };
};