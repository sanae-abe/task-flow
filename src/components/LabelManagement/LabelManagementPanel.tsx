import React, { useState, useCallback, useMemo } from 'react';
import { Button, Box, Text, IconButton } from '@primer/react';
import { PencilIcon, TrashIcon, TagIcon, PlusIcon, ChevronUpIcon, ChevronDownIcon } from '@primer/octicons-react';

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

type SortField = 'name' | 'boardName' | 'usageCount';
type SortDirection = 'asc' | 'desc';

// ソート可能なヘッダーコンポーネント
const SortableHeader: React.FC<{
  field: SortField;
  currentSortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
  align?: 'left' | 'center';
}> = ({ field, currentSortField, sortDirection, onSort, children, align = 'left' }) => {
  const isActive = currentSortField === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        width: '100%',
        padding: 0,
        color: 'var(--fgColor-muted)',
        fontSize: '12px',
        fontWeight: 'bold',
        fontFamily: 'inherit'
      }}
      aria-label={`${children}でソート`}
    >
      <span>{children}</span>
      <span style={{ opacity: isActive ? 1 : 0.3, fontSize: '10px' }}>
        {isActive && sortDirection === 'asc' ? (
          <ChevronUpIcon size={12} />
        ) : (
          <ChevronDownIcon size={12} />
        )}
      </span>
    </button>
  );
};

const LabelManagementPanel: React.FC = () => {
  const {
    getAllLabelsWithBoardInfo,
    getAllLabelUsageCount,
    createLabel,
    updateLabel,
    deleteLabelFromAllBoards
  } = useLabel();

  // ソート状態
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    label: (Label & { boardName: string; boardId: string }) | null;
    mode: 'create' | 'edit';
  }>({
    isOpen: false,
    label: null,
    mode: 'create'
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    label: (Label & { boardName: string; boardId: string }) | null;
  }>({
    isOpen: false,
    label: null
  });

  // ソートハンドラー
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      // 同じフィールドをクリックした場合は方向を反転
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // 異なるフィールドをクリックした場合は昇順で開始
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // 全ボードのラベルデータを取得してusageCountを追加、ソート適用
  const allLabelsWithInfo = useMemo(() => {
    const labelsMap = new Map<string, Label & { boardName: string; boardId: string; usageCount: number }>();

    // 全ボードのラベルを収集
    getAllLabelsWithBoardInfo().forEach(labelWithBoard => {
      const existingLabel = labelsMap.get(labelWithBoard.id);

      if (existingLabel) {
        // 既に存在する場合、ボード名を結合
        existingLabel.boardName = `${existingLabel.boardName}, ${labelWithBoard.boardName}`;
      } else {
        // 新しいラベルの場合、使用数を計算して追加
        labelsMap.set(labelWithBoard.id, {
          ...labelWithBoard,
          usageCount: getAllLabelUsageCount(labelWithBoard.id)
        });
      }
    });

    // ソート処理
    const sortedLabels = Array.from(labelsMap.values()).sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'boardName':
          comparison = a.boardName.localeCompare(b.boardName);
          break;
        case 'usageCount':
          comparison = a.usageCount - b.usageCount;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sortedLabels;
  }, [getAllLabelsWithBoardInfo, getAllLabelUsageCount, sortField, sortDirection]);

  // 編集ダイアログを開く
  const handleEdit = useCallback((label: Label & { boardName: string; boardId: string; usageCount: number }) => {
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
  const handleDelete = useCallback((label: Label & { boardName: string; boardId: string; usageCount: number }) => {
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

  // ラベル削除確認（全ボードから削除）
  const handleConfirmDelete = useCallback(() => {
    if (deleteDialog.label) {
      deleteLabelFromAllBoards(deleteDialog.label.id);
      handleCloseDeleteDialog();
    }
  }, [deleteDialog.label, deleteLabelFromAllBoards, handleCloseDeleteDialog]);

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
            全ボードのラベル管理
          </Text>
        </div>
        <Button
          variant="primary"
          leadingVisual={PlusIcon}
          onClick={handleCreate}
          sx={{
            backgroundColor: 'accent.fg',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: 'var(--button-outline-bgColor-active)'
            }
          }}
        >
          ラベルを作成
        </Button>
      </div>

      {/* ラベル一覧 */}
      {allLabelsWithInfo.length === 0 ? (
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
            gridTemplateColumns: '1fr 150px 50px 50px',
            gap: 2,
            p: 2,
            bg: 'canvas.subtle',
            borderBottom: '1px solid',
            borderColor: 'border.default',
            fontSize: 1,
            fontWeight: 'bold',
            color: 'fg.muted'
          }}>
            <SortableHeader
              field="name"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              ラベル
            </SortableHeader>
            <SortableHeader
              field="boardName"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              所属ボード
            </SortableHeader>
            <SortableHeader
              field="usageCount"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              align="center"
            >
              使用数
            </SortableHeader>
            <Text sx={{ textAlign: 'center' }}>操作</Text>
          </Box>

          {/* テーブルボディ */}
          <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
            {allLabelsWithInfo.map((label, index) => (
              <Box
                key={label.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 150px 50px 50px',
                  gap: 2,
                  p: 2,
                  alignItems: 'center',
                  borderBottom: index < allLabelsWithInfo.length - 1 ? '1px solid' : 'none',
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

                {/* 所属ボード */}
                <Box sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  <Text sx={{
                    fontSize: 0,
                    color: 'fg.muted',
                  }}>
                    {label.boardName}
                  </Text>
                </Box>

                {/* 使用数 */}
                <Box sx={{ textAlign: 'center' }}>
                  <CounterLabel count={label.usageCount} />
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
                    aria-label={`ラベル「${label.name}」を編集`}
                    size="small"
                    variant="invisible"
                    onClick={() => handleEdit(label)}
                  />
                  <IconButton
                    icon={TrashIcon}
                    aria-label={`ラベル「${label.name}」を全ボードから削除`}
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
            ? `ラベル「${deleteDialog.label.name}」を全ボードから削除しますか？この操作は元に戻せません。${('usageCount' in deleteDialog.label && typeof deleteDialog.label.usageCount === 'number' && deleteDialog.label.usageCount > 0) ? `\n\n${deleteDialog.label.usageCount}個のタスクからも削除されます。` : ''}`
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