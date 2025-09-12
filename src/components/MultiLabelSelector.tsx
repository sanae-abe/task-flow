import { ChevronDownIcon, XIcon } from '@primer/octicons-react';
import { Box, TextInput } from '@primer/react';
import { useState, useRef, useEffect, useCallback, memo } from 'react';

import { useKanban } from '../contexts/KanbanContext';
import type { Label } from '../types';
import { LABEL_COLORS, createLabel } from '../utils/labels';
import { getLabelColors } from '../utils/labelHelpers';

interface MultiLabelSelectorProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
  placeholder?: string;
}

/**
 * react-selectのMultiスタイルを参考にしたラベルセレクター
 * - 選択されたラベルをチップ形式で表示
 * - テキスト入力で新しいラベルを作成
 * - ドロップダウンで既存ラベルを選択
 */
const MultiLabelSelector = memo<MultiLabelSelectorProps>(({ 
  selectedLabels, 
  onLabelsChange, 
  placeholder = "ラベルを選択または作成..." 
}) => {
  const { getAllLabels } = useKanban();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 全ラベルから未選択のラベルを取得
  const availableLabels = useCallback(() => {
    const allLabels = getAllLabels();
    const selectedNames = new Set(selectedLabels.map(label => label.name.toLowerCase()));
    return allLabels.filter(label => !selectedNames.has(label.name.toLowerCase()));
  }, [getAllLabels, selectedLabels]);

  // 入力値でフィルタリングされたラベル
  const filteredLabels = useCallback(() => {
    const available = availableLabels();
    if (!inputValue.trim()) {
      return available;
    }
    return available.filter(label => 
      label.name.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [availableLabels, inputValue]);

  // クリック外でクローズ
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ラベル追加
  const addLabel = useCallback((label: Label) => {
    const isAlreadySelected = selectedLabels.some(selected => 
      selected.name.toLowerCase() === label.name.toLowerCase()
    );
    
    if (!isAlreadySelected) {
      onLabelsChange([...selectedLabels, label]);
    }
    setInputValue('');
    inputRef.current?.focus();
  }, [selectedLabels, onLabelsChange]);

  // ラベル削除
  const removeLabel = useCallback((labelToRemove: Label) => {
    onLabelsChange(selectedLabels.filter(label => label.id !== labelToRemove.id));
  }, [selectedLabels, onLabelsChange]);

  // 新しいラベル作成
  const createNewLabel = useCallback(() => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || trimmedValue.length < 2) {
      return;
    }

    // 重複チェック
    const allLabels = getAllLabels();
    const isDuplicate = allLabels.some(label => 
      label.name.toLowerCase() === trimmedValue.toLowerCase()
    );
    
    if (!isDuplicate) {
      const color = LABEL_COLORS[selectedColorIndex % LABEL_COLORS.length];
      const newLabel = createLabel(trimmedValue, color?.variant ?? 'default');
      addLabel(newLabel);
      setSelectedColorIndex((prev) => (prev + 1) % LABEL_COLORS.length);
    }
  }, [inputValue, getAllLabels, selectedColorIndex, addLabel]);

  // キーボード操作
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const filtered = filteredLabels();
      if (filtered.length > 0) {
        // 最初の候補を選択
        const firstLabel = filtered[0];
        if (firstLabel) {
          addLabel(firstLabel);
        }
      } else {
        // 新しいラベルを作成
        createNewLabel();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && selectedLabels.length > 0) {
      // 最後のラベルを削除
      const lastLabel = selectedLabels[selectedLabels.length - 1];
      if (lastLabel) {
        removeLabel(lastLabel);
      }
    }
  }, [filteredLabels, addLabel, createNewLabel, inputValue, selectedLabels, removeLabel]);

  // 入力値変更
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  }, []);

  const shouldShowCreateOption = inputValue.trim().length >= 2 && 
    !getAllLabels().some(label => label.name.toLowerCase() === inputValue.toLowerCase());

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%' }}>
      {/* メインコンテナ */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: isOpen ? 'accent.emphasis' : 'border.default',
          borderRadius: 2,
          bg: 'canvas.default',
          minHeight: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
          p: 1,
          cursor: 'text',
          '&:hover': {
            borderColor: 'border.muted'
          }
        }}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {/* 選択されたラベル */}
        {selectedLabels.map((label) => {
          const colors = getLabelColors(label.color);
          return (
            <Box
              key={label.id}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                bg: colors.bg,
                color: colors.color,
                px: 2,
                py: 1,
                borderRadius: 1,
                fontSize: 0,
                gap: 1
              }}
            >
              <span>{label.name}</span>
              <Box
                as="button"
                sx={{
                  border: 'none',
                  bg: 'transparent',
                  color: colors.color,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  p: 0,
                  '&:hover': {
                    opacity: 0.7
                  }
                }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  removeLabel(label);
                }}
              >
                <XIcon size={12} />
              </Box>
            </Box>
          );
        })}

        {/* 入力フィールド */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: '120px' }}>
          <TextInput
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedLabels.length === 0 ? placeholder : ''}
            sx={{
              border: 'none',
              boxShadow: 'none',
              bg: 'transparent',
              p: 0,
              fontSize: 1,
              '&:focus': {
                border: 'none',
                boxShadow: 'none'
              }
            }}
          />
          <Box
            sx={{ 
              color: 'fg.muted',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronDownIcon size={16} />
          </Box>
        </Box>
      </Box>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            bg: 'canvas.overlay',
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: 2,
            boxShadow: 'shadow.large',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {/* 新しいラベル作成オプション */}
          {shouldShowCreateOption && (
            <Box
              sx={{
                p: 2,
                cursor: 'pointer',
                borderBottom: '1px solid',
                borderColor: 'border.default',
                '&:hover': {
                  bg: 'neutral.subtle'
                }
              }}
              onClick={createNewLabel}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: 1,
                    bg: LABEL_COLORS[selectedColorIndex % LABEL_COLORS.length]?.variant === 'default' 
                      ? 'neutral.emphasis' 
                      : `${LABEL_COLORS[selectedColorIndex % LABEL_COLORS.length]?.variant ?? 'default'}.emphasis`
                  }}
                />
                <span>「{inputValue}」を作成</span>
              </Box>
            </Box>
          )}

          {/* 既存ラベル候補 */}
          {filteredLabels().map((label) => {
            const colors = getLabelColors(label.color);
            return (
              <Box
                key={label.id}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    bg: 'neutral.subtle'
                  }
                }}
                onClick={() => addLabel(label)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: '12px',
                      height: '12px',
                      borderRadius: 1,
                      bg: colors.bg,
                      border: '1px solid',
                      borderColor: colors.color
                    }}
                  />
                  <span>{label.name}</span>
                </Box>
              </Box>
            );
          })}

          {/* ラベルが見つからない場合 */}
          {!shouldShowCreateOption && filteredLabels().length === 0 && (
            <Box sx={{ p: 2, color: 'fg.muted', textAlign: 'center' }}>
              {inputValue ? 'ラベルが見つかりません' : 'ラベルを入力してください'}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
});

MultiLabelSelector.displayName = 'MultiLabelSelector';

export default MultiLabelSelector;