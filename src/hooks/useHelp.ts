import { useState } from 'react';

interface UseHelpReturn {
  isHelpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
}

export const useHelp = (): UseHelpReturn => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const openHelp = () => {
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