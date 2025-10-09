import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextInput, FormControl } from '@primer/react';

import type { Label } from '../../types';
import UnifiedDialog from '../shared/Dialog/UnifiedDialog';
import ColorSelector from '../ColorSelector';
import LabelChip from '../LabelChip';

interface LabelFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (labelData: { name: string; color: string }) => void;
  label?: Label | null;
  mode: 'create' | 'edit';
}

interface LabelFormData {
  name: string;
  color: string;
}

const LabelFormDialog: React.FC<LabelFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  label,
  mode
}) => {
  const [formData, setFormData] = useState<LabelFormData>({
    name: '',
    color: '#0969da'
  });
  const [errors, setErrors] = useState<{ name?: string }>({});

  // フォームデータの初期化
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && label) {
        setFormData({
          name: label.name,
          color: label.color
        });
      } else {
        setFormData({
          name: '',
          color: '#0969da'
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, label]);

  // バリデーション
  const validateForm = useCallback(() => {
    const newErrors: { name?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'ラベル名は必須です';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'ラベル名は50文字以下で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.name]);

  // 保存処理
  const handleSave = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    onSave({
      name: formData.name.trim(),
      color: formData.color
    });
    onClose();
  }, [formData, validateForm, onSave, onClose]);

  // キャンセル処理
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  // Enterキーでの保存
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  // プレビュー用のラベルデータ
  const previewLabel: Label = {
    id: 'preview',
    name: formData.name || 'ラベル名',
    color: formData.color
  };

  const actions = [
    {
      label: 'キャンセル',
      variant: 'default' as const,
      onClick: handleCancel
    },
    {
      label: mode === 'create' ? '作成' : '更新',
      variant: 'primary' as const,
      onClick: handleSave,
      disabled: !formData.name.trim()
    }
  ];

  return (
    <UnifiedDialog
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'ラベルを作成' : 'ラベルを編集'}
      variant="modal"
      size="medium"
      actions={actions}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }} onKeyDown={handleKeyDown}>
        {/* プレビューエリア */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControl.Label sx={{ display: 'block' }}>
            プレビュー
          </FormControl.Label>
          <div style={{
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid',
            borderColor: 'var(--borderColor-muted)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <LabelChip label={previewLabel} />
            </Box>
          </div>
        </Box>

        {/* ラベル名入力 */}
        <FormControl required>
          <FormControl.Label>ラベル名</FormControl.Label>
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="ラベル名を入力"
            sx={{ width: '100%' }}
            validationStatus={errors.name ? 'error' : undefined}
            autoFocus
          />
          {errors.name && (
            <FormControl.Validation variant="error">
              {errors.name}
            </FormControl.Validation>
          )}
        </FormControl>

        {/* カラーセレクター */}
        <FormControl>
          <FormControl.Label>色</FormControl.Label>
          <Box sx={{ mt: 2 }}>
            <ColorSelector
              selectedColor={formData.color}
              onColorSelect={(color: string) => setFormData(prev => ({ ...prev, color }))}
            />
          </Box>
        </FormControl>
      </Box>
    </UnifiedDialog>
  );
};

export default LabelFormDialog;