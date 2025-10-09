import React, { useState, useCallback, useMemo } from 'react';
import { Box, Button, Text, IconButton } from '@primer/react';
import { PlusIcon, PencilIcon, TrashIcon } from '@primer/octicons-react';

import type { Label } from '../../types';
import { useLabel } from '../../contexts/LabelContext';
import LabelChip from '../LabelChip';
import LabelFormDialog from './LabelFormDialog';
import LabelDeleteConfirmDialog from './LabelDeleteConfirmDialog';

const CounterLabel: React.FC<{ count: number }> = ({ count }) => (
  <Text
    sx={{
      fontSize: 1,
      fontWeight: count > 0 ? 'bold' : 'normal',
      color: count > 0 ? 'fg.default' : 'fg.muted'
    }}
  >
    {count}
  </Text>
);

const LabelManagementPanel: React.FC = () => {
  const { labels, createLabel, updateLabel, deleteLabel, getCurrentBoardLabelUsageCount } = useLabel();
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    label: Label | null;
    mode: 'create' | 'edit';
  }>({
    isOpen: false,
    label: null,
    mode: 'create'
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    label: Label | null;
  }>({
    isOpen: false,
    label: null
  });

  // ラベルデータにusageCountを追加
  const labelsWithUsage = useMemo(() => labels.map(label => ({
    ...label,
    usageCount: getCurrentBoardLabelUsageCount(label.id)
  })), [labels, getCurrentBoardLabelUsageCount]);

  // 編集ダイアログを開く
  const handleEdit = useCallback((label: Label) => {
    setEditDialog({
      isOpen: true,
      label,
      mode: 'edit'
    });
  }, []);

  // 作成ダイアログを開く
  const handleCreate = useCallback(() => {
    setEditDialog({
      isOpen: true,
      label: null,
      mode: 'create'
    });
  }, []);

  // 削除ダイアログを開く
  const handleDelete = useCallback((label: Label) => {
    setDeleteDialog({
      isOpen: true,
      label
    });
  }, []);

  // ダイアログを閉じる
  const handleCloseEditDialog = useCallback(() => {
    setEditDialog({
      isOpen: false,
      label: null,
      mode: 'create'
    });
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialog({
      isOpen: false,
      label: null
    });
  }, []);

  // ラベル保存（作成・編集）
  const handleSave = useCallback((labelData: { name: string; color: string }) => {
    if (editDialog.mode === 'create') {
      createLabel(labelData.name, labelData.color);
    } else if (editDialog.label) {
      updateLabel(editDialog.label.id, labelData);
    }
    handleCloseEditDialog();
  }, [editDialog.mode, editDialog.label, createLabel, updateLabel, handleCloseEditDialog]);

  // ラベル削除確認
  const handleConfirmDelete = useCallback(() => {
    if (deleteDialog.label) {
      deleteLabel(deleteDialog.label.id);
      handleCloseDeleteDialog();
    }
  }, [deleteDialog.label, deleteLabel, handleCloseDeleteDialog]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
      {/* ヘッダー */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'border.muted',
        pb: 3
      }}>
        <Box>
          <Text sx={{ fontSize: 1, fontWeight: 'bold', color: 'fg.default' }}>
            ラベル管理
          </Text>
          <Text sx={{ fontSize: 0, color: 'fg.muted', mt: 1 }}>
            プロジェクトで使用するラベルを作成・編集・削除できます
          </Text>
        </Box>
        <Button
          variant="primary"
          size="small"
          leadingVisual={PlusIcon}
          onClick={handleCreate}
        >
          新しいラベル
        </Button>
      </Box>

      {/* ラベル一覧 */}
      {labelsWithUsage.length === 0 ? (
        <Box sx={{
          textAlign: 'center',
          py: 6,
          border: '1px dashed',
          borderColor: 'border.muted',
          borderRadius: 2
        }}>
          <Text sx={{ color: 'fg.muted', mb: 3, display: 'block' }}>
            まだラベルがありません
          </Text>
          <Button
            variant="primary"
            leadingVisual={PlusIcon}
            onClick={handleCreate}
          >
            最初のラベルを作成
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto auto',
            gap: 2,
            alignItems: 'center',
            px: 3,
            py: 2,
            fontSize: 0,
            fontWeight: 'bold',
            color: 'fg.muted',
            borderBottom: '1px solid',
            borderColor: 'border.muted'
          }}>
            <Text>ラベル</Text>
            <Text sx={{ textAlign: 'center' }}>使用数</Text>
            <Text sx={{ textAlign: 'center' }}>編集</Text>
            <Text sx={{ textAlign: 'center' }}>削除</Text>
          </Box>

          {labelsWithUsage.map((label) => (
            <Box
              key={label.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                gap: 2,
                alignItems: 'center',
                px: 3,
                py: 2,
                border: '1px solid',
                borderColor: 'border.default',
                borderRadius: 2,
                '&:hover': {
                  bg: 'canvas.subtle'
                }
              }}
            >
              {/* ラベル表示 */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LabelChip label={label} />
              </Box>

              {/* 使用数 */}
              <Box sx={{ textAlign: 'center', minWidth: '60px' }}>
                <CounterLabel count={label.usageCount} />
              </Box>

              {/* 編集ボタン */}
              <Box sx={{ textAlign: 'center' }}>
                <IconButton
                  icon={PencilIcon}
                  aria-label={`ラベル「${label.name}」を編集`}
                  size="small"
                  variant="invisible"
                  onClick={() => handleEdit(label)}
                />
              </Box>

              {/* 削除ボタン */}
              <Box sx={{ textAlign: 'center' }}>
                <IconButton
                  icon={TrashIcon}
                  aria-label={`ラベル「${label.name}」を削除`}
                  size="small"
                  variant="invisible"
                  onClick={() => handleDelete(label)}
                />
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* フォームダイアログ */}
      <LabelFormDialog
        isOpen={editDialog.isOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSave}
        label={editDialog.label}
        mode={editDialog.mode}
      />

      {/* 削除確認ダイアログ */}
      <LabelDeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        label={deleteDialog.label}
        usageCount={deleteDialog.label ? getCurrentBoardLabelUsageCount(deleteDialog.label.id) : 0}
      />
    </Box>
  );
};

export default LabelManagementPanel;