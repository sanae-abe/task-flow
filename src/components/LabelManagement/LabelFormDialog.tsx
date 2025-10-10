import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextInput, FormControl } from '@primer/react';

import type { Label } from '../../types';
import { useLabel } from '../../contexts/LabelContext';
import UnifiedDialog from '../shared/Dialog/UnifiedDialog';
import ColorSelector from '../ColorSelector';
import LabelChip from '../LabelChip';

interface LabelFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (labelData: { name: string; color: string }) => void;
  onLabelCreated?: (label: Label) => void;
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
  const { getAllLabels } = useLabel();
  const [formData, setFormData] = useState<LabelFormData>({
    name: '',
    color: '#0969da'
  });
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(false);
    }
  }, [isOpen, mode, label]);

  // バリデーション（統合版）
  const validateForm = useCallback(() => {
    const newErrors: { name?: string } = {};
    const trimmedName = formData.name.trim();

    // 基本バリデーション
    if (!trimmedName) {
      newErrors.name = 'ラベル名は必須です';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'ラベル名は2文字以上で入力してください';
    } else if (trimmedName.length > 50) {
      newErrors.name = 'ラベル名は50文字以下で入力してください';
    } else {
      // 重複チェック（編集時は自分自身を除外）
      const allLabels = getAllLabels();
      const isDuplicate = allLabels.some(existingLabel => {
        const isSameLabel = mode === 'edit' && label && existingLabel.id === label.id;
        return !isSameLabel && existingLabel.name.toLowerCase() === trimmedName.toLowerCase();
      });

      if (isDuplicate) {
        newErrors.name = '同じ名前のラベルが既に存在します';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.name, getAllLabels, mode, label]);

  // 保存処理（統合版）
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const labelData = {
        name: formData.name.trim(),
        color: formData.color
      };

      // create/edit両方でonSaveを使用
      if (onSave) {
        onSave(labelData);
      }

      onClose();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('ラベル保存エラー:', error);
      }
      setErrors({ name: 'ラベルの保存に失敗しました' });
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, onSave, onClose]);

  // キャンセル処理
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  // Enterキーでの保存
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!isLoading) {
        handleSave();
      }
    }
  }, [handleSave, isLoading]);

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
      disabled: !formData.name.trim() || isLoading
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
        <FormControl>
          <FormControl.Label>ラベル名</FormControl.Label>
          <TextInput
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              // リアルタイムでエラーをクリア
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: undefined }));
              }
            }}
            placeholder="ラベル名を入力"
            sx={{ width: '100%' }}
            validationStatus={errors.name ? 'error' : undefined}
            autoFocus
            disabled={isLoading}
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