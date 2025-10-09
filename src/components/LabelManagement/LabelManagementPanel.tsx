import React, { useState, useCallback, useMemo } from 'react';
import { Box, Button, Text, IconButton } from '@primer/react';
import { PlusIcon, PencilIcon, TrashIcon, TagIcon } from '@primer/octicons-react';

import type { Label } from '../../types';
import { useLabel } from '../../contexts/LabelContext';
import LabelChip from '../LabelChip';
import LabelFormDialog from './LabelFormDialog';
import LabelDeleteConfirmDialog from './LabelDeleteConfirmDialog';

interface EditDialogState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  label?: Label | null;
}

interface DeleteDialogState {
  isOpen: boolean;
  label: Label | null;
}

const LabelManagementPanel: React.FC = () => {
  const { labels, createLabel, updateLabel, deleteLabel, getLabelUsageCount } = useLabel();

  const [editDialog, setEditDialog] = useState<EditDialogState>({
    isOpen: false,
    mode: 'create',
    label: null
  });

  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    label: null
  });

  // ラベルデータと使用数を組み合わせたデータ
  const labelsWithUsage = useMemo(() => labels.map(label => ({
      ...label,
      usageCount: getLabelUsageCount(label.id)
    })), [labels, getLabelUsageCount]);

  // 新規作成ダイアログを開く
  const handleCreateLabel = useCallback(() => {
    setEditDialog({
      isOpen: true,
      mode: 'create',
      label: null
    });
  }, []);

  // 編集ダイアログを開く
  const handleEditLabel = useCallback((label: Label) => {
    setEditDialog({
      isOpen: true,
      mode: 'edit',
      label
    });
  }, []);

  // 削除確認ダイアログを開く
  const handleDeleteLabel = useCallback((label: Label) => {
    setDeleteDialog({
      isOpen: true,
      label
    });
  }, []);

  // ラベル保存処理
  const handleSaveLabel = useCallback((labelData: { name: string; color: string }) => {
    if (editDialog.mode === 'create') {
      createLabel(labelData.name, labelData.color);
    } else if (editDialog.mode === 'edit' && editDialog.label) {
      updateLabel(editDialog.label.id, labelData);
    }
  }, [editDialog, createLabel, updateLabel]);

  // ラベル削除処理
  const handleConfirmDelete = useCallback(() => {
    if (deleteDialog.label) {
      deleteLabel(deleteDialog.label.id);
      setDeleteDialog({ isOpen: false, label: null });
    }
  }, [deleteDialog.label, deleteLabel]);

  // ダイアログを閉じる
  const handleCloseEditDialog = useCallback(() => {
    setEditDialog({ isOpen: false, mode: 'create', label: null });
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialog({ isOpen: false, label: null });
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ヘッダー */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'border.default'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TagIcon size={20} />
          <Text sx={{ fontSize: 2, fontWeight: 'bold' }}>
            ラベル管理
          </Text>
          <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
            ({labels.length}個)
          </Text>
        </Box>
        <Button
          variant="primary"
          size="small"
          leadingVisual={PlusIcon}
          onClick={handleCreateLabel}
        >
          新規作成
        </Button>
      </Box>

      {/* ラベル一覧 */}
      {labels.length === 0 ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          py: 6,
          textAlign: 'center',
          bg: 'canvas.subtle',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'border.default'
        }}>
          <TagIcon size={48} />
          <Box>
            <Text sx={{ fontSize: 2, fontWeight: 'bold', mb: 1, display: 'block' }}>
              ラベルがありません
            </Text>
            <Text sx={{ fontSize: 1, color: 'fg.muted', mb: 3, display: 'block' }}>
              ラベルを作成してタスクを整理しましょう
            </Text>
            <Button
              variant="primary"
              leadingVisual={PlusIcon}
              onClick={handleCreateLabel}
            >
              最初のラベルを作成
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          {/* テーブルヘッダー */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 80px 100px',
            gap: 2,
            p: 2,
            bg: 'canvas.subtle',
            borderBottom: '1px solid',
            borderColor: 'border.default',
            fontSize: 1,
            fontWeight: 'bold',
            color: 'fg.muted'
          }}>
            <Text>ラベル</Text>
            <Text sx={{ textAlign: 'center' }}>使用数</Text>
            <Text sx={{ textAlign: 'center' }}>操作</Text>
          </Box>

          {/* テーブルボディ */}
          <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
            {labelsWithUsage.map((labelWithUsage, index) => (
              <Box
                key={labelWithUsage.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px 100px',
                  gap: 2,
                  p: 2,
                  alignItems: 'center',
                  borderBottom: index < labelsWithUsage.length - 1 ? '1px solid' : 'none',
                  borderColor: 'border.muted',
                  '&:hover': {
                    bg: 'canvas.subtle',
                    '& .label-actions': {
                      opacity: 1
                    }
                  }
                }}
              >
                {/* ラベル表示 */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LabelChip label={labelWithUsage} />
                </Box>

                {/* 使用数 */}
                <Box sx={{ textAlign: 'center' }}>
                  <Text
                    sx={{
                      fontSize: 1,
                      fontWeight: labelWithUsage.usageCount > 0 ? 'bold' : 'normal',
                      color: labelWithUsage.usageCount > 0 ? 'fg.default' : 'fg.muted'
                    }}
                  >
                    {labelWithUsage.usageCount}
                  </Text>
                </Box>

                {/* アクションボタン */}
                <Box
                  className="label-actions"
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1,
                    opacity: 0,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  <IconButton
                    icon={PencilIcon}
                    aria-label="編集"
                    size="small"
                    variant="invisible"
                    onClick={() => handleEditLabel(labelWithUsage)}
                  />
                  <IconButton
                    icon={TrashIcon}
                    aria-label="削除"
                    size="small"
                    variant="invisible"
                    onClick={() => handleDeleteLabel(labelWithUsage)}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* フォームダイアログ */}
      <LabelFormDialog
        isOpen={editDialog.isOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSaveLabel}
        label={editDialog.label}
        mode={editDialog.mode}
      />

      {/* 削除確認ダイアログ */}
      <LabelDeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        label={deleteDialog.label}
        usageCount={deleteDialog.label ? getLabelUsageCount(deleteDialog.label.id) : 0}
      />
    </Box>
  );
};

export default LabelManagementPanel;