import { useState } from 'react';
import { useKanban } from '../contexts/KanbanContext';

interface UseHelpReturn {
  isHelpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
}

export const useHelp = (): UseHelpReturn => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { state, closeTaskDetail } = useKanban();

  const openHelp = () => {
    // ヘルプを開く前にタスク詳細が開いていたら閉じる
    if (state.isTaskDetailOpen) {
      closeTaskDetail();
    }
    setIsHelpOpen(true);
  };

  const closeHelp = () => {
    setIsHelpOpen(false);
  };

  return {
    isHelpOpen,
    openHelp,
    closeHelp
  };
};