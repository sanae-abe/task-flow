import React, { useState, useCallback, useMemo } from 'react';
import { Button, Box, Text, IconButton } from '@primer/react';
import { PencilIcon, TrashIcon, TagIcon, PlusIcon } from '@primer/octicons-react';

import type { Label } from '../../types';
import { useLabel } from '../../contexts/LabelContext';
import LabelChip from '../LabelChip';
import LabelFormDialog from './LabelFormDialog';
import ConfirmDialog from '../shared/Dialog/ConfirmDialog';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TagIcon size={20} />
          <Text sx={{ fontSize: 2, fontWeight: 'bold' }}>
            ラベル管理
          </Text>
        </div>
        <Button
          variant="primary"
          leadingVisual={PlusIcon}
          onClick={handleCreate}
        >
          最初のラベルを作成
        </Button>
      </div>

      {/* ラベル一覧 */}
      {labelsWithUsage.length === 0 ? (
        <Box sx={{
          textAlign: 'center',
          py: 6,
          border: '1px dashed',
          borderColor: 'border.muted',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text sx={{ color: 'fg.muted' }}>
            まだラベルがありません
          </Text>
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
            {labelsWithUsage.map((label, index) => (
              <Box
                key={label.id}
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
                  <LabelChip label={label} />
                </Box>

                {/* 使用数 */}
                <Box sx={{ textAlign: 'center' }}>
                  <CounterLabel count={label.usageCount} />
                </Box>

                {/* 編集ボタン */}
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
                    aria-label={`ラベル「${label.name}」を編集`}
                    size="small"
                    variant="invisible"
                    onClick={() => handleEdit(label)}
                  />
                  {/* 削除ボタン */}
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
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="ラベルの削除"
        message={
          deleteDialog.label
            ? `ラベル「${deleteDialog.label.name}」を削除しますか？この操作は元に戻せません。`
            : ''
        }
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        confirmText="削除"
        cancelText="キャンセル"
        confirmVariant="danger"
      />
    </Box>
  );
};

export default LabelManagementPanel;