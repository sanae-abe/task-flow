import { TextInput, Box, Text } from '@primer/react';
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

  // フォームリセット
  const resetForm = useCallback(() => {
    setLabelText('');
    setSelectedColor('default');
    setIsLoading(false);
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
      return;
    }

    // 重複チェック
    const allLabels = getAllLabels();
    const isDuplicate = allLabels.some(label => 
      label.name.toLowerCase() === trimmedText.toLowerCase()
    );
    
    if (isDuplicate) {
      // TODO: エラー表示の実装
      // eslint-disable-next-line no-console
      console.warn('同じ名前のラベルが既に存在します');
      return;
    }

    setIsLoading(true);
    
    try {
      const newLabel = createLabel(trimmedText, selectedColor);
      onLabelCreated(newLabel);
      resetForm();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('ラベル作成エラー:', error);
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* ラベル名入力 */}
        <Box>
          <Text 
            as="label" 
            sx={{ fontSize: 1, fontWeight: '500', mb: 2, display: 'block' }}
            htmlFor="label-text-input"
          >
            ラベル名
          </Text>
          <TextInput
            id="label-text-input"
            value={labelText}
            onChange={(e) => setLabelText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ラベル名を入力してください"
            autoFocus
            sx={{ width: '100%' }}
          />
        </Box>

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