import { useState, useCallback, useMemo } from 'react';

import { useKanban } from '../contexts/KanbanContext';
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
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isValid: boolean;
  suggestions: Label[];
  addSuggestedLabel: (label: Label) => void;
}

export const useLabelSelector = ({ selectedLabels, onLabelsChange }: UseLabelSelectorProps): UseLabelSelectorReturn => {
  const { getAllLabels } = useKanban();
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

    // グローバル重複ラベル名チェック（全ボード横断）
    const allLabels = getAllLabels();
    const isDuplicate = allLabels.some(label => 
      label.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      return;
    }

    const newLabel = createLabel(trimmedName, selectedColor);
    onLabelsChange([...selectedLabels, newLabel]);
    cancelCreating();
  }, [newLabelName, selectedColor, selectedLabels, onLabelsChange, cancelCreating, getAllLabels]);

  const removeLabel = useCallback((labelId: string) => {
    onLabelsChange(selectedLabels.filter(label => label.id !== labelId));
  }, [selectedLabels, onLabelsChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
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
    
    // グローバル重複ラベル名チェック
    const allLabels = getAllLabels();
    const isDuplicate = allLabels.some(label => 
      label.name.toLowerCase() === trimmedName.toLowerCase()
    );
    return !isDuplicate;
  }, [newLabelName, getAllLabels]);

  // 既存ラベルのサジェスト（未選択のラベルのみ）
  const suggestions = useMemo(() => {
    const allLabels = getAllLabels();
    const selectedLabelNames = new Set(selectedLabels.map(label => label.name.toLowerCase()));
    
    return allLabels.filter(label => 
      !selectedLabelNames.has(label.name.toLowerCase())
    );
  }, [getAllLabels, selectedLabels]);

  const addSuggestedLabel = useCallback((label: Label) => {
    // 既に選択されているかチェック
    const isAlreadySelected = selectedLabels.some(selected => 
      selected.name.toLowerCase() === label.name.toLowerCase()
    );
    
    if (!isAlreadySelected) {
      onLabelsChange([...selectedLabels, label]);
    }
  }, [selectedLabels, onLabelsChange]);

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
    isValid,
    suggestions,
    addSuggestedLabel
  };
};