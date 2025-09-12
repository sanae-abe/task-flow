import { TextInput, Box, Text, FormControl } from '@primer/react';
import { useState, useCallback } from 'react';

import { useKanban } from '../contexts/KanbanContext';
import type { Label } from '../types';
import { createLabel } from '../utils/labels';
import { getLabelColors } from '../utils/labelHelpers';

import BaseDialog, { DialogActions } from './BaseDialog';
import ColorSelector from './ColorSelector';

interface LabelAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLabelCreated: (label: Label) => void;
}

const LabelAddDialog: React.FC<LabelAddDialogProps> = ({
  isOpen,
  onClose,
  onLabelCreated
}) => {
  const { getAllLabels } = useKanban();
  const [labelText, setLabelText] = useState('');
  const [selectedColor, setSelectedColor] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // フォームリセット
  const resetForm = useCallback(() => {
    setLabelText('');
    setSelectedColor('default');
    setIsLoading(false);
    setErrorMessage('');
  }, []);

  // ダイアログを閉じる
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  // ラベル作成
  const handleCreate = useCallback(async () => {
    const trimmedText = labelText.trim();
    if (!trimmedText || trimmedText.length < 2) {
      setErrorMessage('ラベル名は2文字以上で入力してください');
      return;
    }

    // 重複チェック
    const allLabels = getAllLabels();
    const isDuplicate = allLabels.some(label => 
      label.name.toLowerCase() === trimmedText.toLowerCase()
    );
    
    if (isDuplicate) {
      setErrorMessage('同じ名前のラベルが既に存在します');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const newLabel = createLabel(trimmedText, selectedColor);
      onLabelCreated(newLabel);
      resetForm();
    } catch (error) {
      setErrorMessage('ラベルの作成に失敗しました');
      setIsLoading(false);
    }
  }, [labelText, selectedColor, getAllLabels, onLabelCreated, resetForm]);

  // Enterキーでの作成
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  }, [handleCreate]);

  // バリデーション
  const isValid = labelText.trim().length >= 2;
  const colors = getLabelColors(selectedColor);

  return (
    <BaseDialog
      isOpen={isOpen}
      title="新しいラベルを追加"
      onClose={handleClose}
      size="large"
      actions={
        <DialogActions
          onCancel={handleClose}
          onConfirm={handleCreate}
          confirmText="作成"
          cancelText="キャンセル"
          isConfirmDisabled={!isValid || isLoading}
        />
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
        {/* ラベル名入力 */}
        <FormControl>
          <FormControl.Label htmlFor="label-text-input">
            ラベル名
          </FormControl.Label>
          <TextInput
            id="label-text-input"
            value={labelText}
            onChange={(e) => {
              setLabelText(e.target.value);
              setErrorMessage('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="ラベル名を入力してください"
            autoFocus
            validationStatus={errorMessage ? 'error' : undefined}
            sx={{ width: '100%' }}
          />
          {errorMessage && (
            <FormControl.Validation variant="error">
              {errorMessage}
            </FormControl.Validation>
          )}
        </FormControl>

        {/* 色選択 */}
        <Box>
          <ColorSelector
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
          />
        </Box>

        {/* プレビュー */}
        {labelText.trim() && (
          <Box>
            <Text sx={{ fontSize: 1, fontWeight: '500', mb: 2, display: 'block' }}>
              プレビュー
            </Text>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                bg: colors.bg,
                color: colors.color,
                px: 2,
                py: 1,
                borderRadius: 1,
                fontSize: 0,
                fontWeight: '500'
              }}
            >
              {labelText.trim()}
            </Box>
          </Box>
        )}
      </Box>
    </BaseDialog>
  );
};

export default LabelAddDialog;