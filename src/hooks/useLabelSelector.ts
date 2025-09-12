import { useState, useCallback, useMemo } from 'react';

import type { Label } from '../types';
import { LABEL_COLORS, createLabel } from '../utils/labels';

interface UseLabelSelectorProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

interface UseLabelSelectorReturn {
  isCreating: boolean;
  newLabelName: string;
  selectedColor: string;
  setNewLabelName: (name: string) => void;
  setSelectedColor: (color: string) => void;
  startCreating: () => void;
  cancelCreating: () => void;
  createNewLabel: () => void;
  removeLabel: (labelId: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isValid: boolean;
}

export const useLabelSelector = ({ selectedLabels, onLabelsChange }: UseLabelSelectorProps): UseLabelSelectorReturn => {
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(LABEL_COLORS[0].variant);

  const startCreating = useCallback(() => {
    setIsCreating(true);
    setNewLabelName('');
    setSelectedColor(LABEL_COLORS[0].variant);
  }, []);

  const cancelCreating = useCallback(() => {
    setIsCreating(false);
    setNewLabelName('');
  }, []);

  const createNewLabel = useCallback(() => {
    const trimmedName = newLabelName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return;
    }

    // 重複ラベル名チェック
    const isDuplicate = selectedLabels.some(label => 
      label.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      return;
    }

    const newLabel = createLabel(trimmedName, selectedColor);
    onLabelsChange([...selectedLabels, newLabel]);
    cancelCreating();
  }, [newLabelName, selectedColor, selectedLabels, onLabelsChange, cancelCreating]);

  const removeLabel = useCallback((labelId: string) => {
    onLabelsChange(selectedLabels.filter(label => label.id !== labelId));
  }, [selectedLabels, onLabelsChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Enterキーでの自動作成を無効化
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelCreating();
    }
  }, [cancelCreating]);

  const isValid = useMemo(() => {
    const trimmedName = newLabelName.trim();
    if (trimmedName.length < 2) {
      return false;
    }
    
    // 重複ラベル名チェック
    const isDuplicate = selectedLabels.some(label => 
      label.name.toLowerCase() === trimmedName.toLowerCase()
    );
    return !isDuplicate;
  }, [newLabelName, selectedLabels]);

  return {
    isCreating,
    newLabelName,
    selectedColor,
    setNewLabelName,
    setSelectedColor,
    startCreating,
    cancelCreating,
    createNewLabel,
    removeLabel,
    handleKeyDown,
    isValid
  };
};