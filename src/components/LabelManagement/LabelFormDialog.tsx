import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';

import type { Label } from '../../types';
import { useLabel } from '../../contexts/LabelContext';
import { useBoard } from '../../contexts/BoardContext';
import UnifiedDialog from '../shared/Dialog/UnifiedDialog';
import ColorSelector from '../ColorSelector';
import LabelChip from '../LabelChip';
import InlineMessage from '../shared/InlineMessage';

interface LabelFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (labelData: { name: string; color: string; boardId?: string }) => void;
  onLabelCreated?: (label: Label) => void;
  label?: Label | null;
  mode: 'create' | 'edit';
  enableBoardSelection?: boolean; // 全ボード管理モードでのみtrue
}

interface LabelFormData {
  name: string;
  color: string;
  boardId?: string;
}

const LabelFormDialog: React.FC<LabelFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  label,
  mode,
  enableBoardSelection = false
}) => {
  const { getAllLabels } = useLabel();
  const { state: boardState } = useBoard();
  const [formData, setFormData] = useState<LabelFormData>({
    name: '',
    color: '#0969da',
    boardId: undefined
  });
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // フォームデータの初期化
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && label) {
        setFormData({
          name: label.name,
          color: label.color,
          boardId: undefined // 編集時はボード選択不要
        });
      } else {
        setFormData({
          name: '',
          color: '#0969da',
          boardId: enableBoardSelection && boardState.boards.length > 0 ? boardState.boards[0]?.id : undefined
        });
      }
      setErrors({});
      setIsLoading(false);
    }
  }, [isOpen, mode, label, enableBoardSelection, boardState.boards]);

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
        color: formData.color,
        boardId: formData.boardId
      };

      // create/edit両方でonSaveを使用
      if (onSave) {
        onSave(labelData);
      }

      onClose();
    } catch (error) {
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
      <div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
        {/* プレビューエリア */}
        <div className="flex flex-col gap-1">
          <label className="block text-sm font-medium">
            プレビュー
          </label>
          <div className="rounded-lg p-4 border border-gray-200">
            <div className="flex justify-center">
              <LabelChip label={previewLabel} />
            </div>
          </div>
        </div>

        {/* ラベル名入力 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">ラベル名</label>
          <Input
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              // リアルタイムでエラーをクリア
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: undefined }));
              }
            }}
            placeholder="ラベル名を入力"
            className="w-full"
            autoFocus
            disabled={isLoading}
          />
          {errors.name && (
            <InlineMessage variant="critical" message={errors.name} size="small" />
          )}
        </div>

        {/* ボード選択 */}
        {enableBoardSelection && mode === 'create' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">作成先ボード</label>
            <select
              value={formData.boardId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, boardId: e.target.value }))}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {boardState.boards.map(board => (
                <option key={board.id} value={board.id}>
                  {board.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* カラーセレクター */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">色</label>
          <ColorSelector
            selectedColor={formData.color}
            onColorSelect={(color: string) => setFormData(prev => ({ ...prev, color }))}
          />
        </div>
      </div>
    </UnifiedDialog>
  );
};

export default LabelFormDialog;