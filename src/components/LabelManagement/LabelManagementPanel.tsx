import React from 'react';
import { Button, Box, Heading, Text } from '@primer/react';
import { PlusIcon } from '@primer/octicons-react';

import LabelFormDialog from './LabelFormDialog';
import ConfirmDialog from '../shared/Dialog/ConfirmDialog';
import { EmptyState, SortableHeader, LabelTableRow } from './components';
import { useLabelSort, useLabelDialogs, useLabelData } from './hooks';

const LabelManagementPanel: React.FC = () => {
  const { sortField, sortDirection, handleSort } = useLabelSort();
  const { allLabelsWithInfo } = useLabelData(sortField, sortDirection);
  const {
    editDialog,
    deleteDialog,
    handleEdit,
    handleCreate,
    handleDelete,
    handleCloseEditDialog,
    handleCloseDeleteDialog,
    handleSave,
    handleConfirmDelete
  } = useLabelDialogs();

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
          <Heading sx={{ fontSize: 2, fontWeight: 'bold' }}>
            ラベル管理
          </Heading>
        </div>
        <Button
          variant="primary"
          leadingVisual={PlusIcon}
          onClick={handleCreate}
          size="small"
        >
          ラベルを作成
        </Button>
      </div>

      {/* ラベル一覧 */}
      {allLabelsWithInfo.length === 0 ? (
        <EmptyState />
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
            gridTemplateColumns: '1fr 200px 60px 50px',
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
            <Text sx={{ textAlign: 'center', fontSize: 0 }}>操作</Text>
          </Box>

          {/* テーブルボディ */}
          <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
            {allLabelsWithInfo.map((label, index) => (
              <LabelTableRow
                key={label.id}
                label={label}
                index={index}
                totalCount={allLabelsWithInfo.length}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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
        enableBoardSelection
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