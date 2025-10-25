import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import LabelFormDialog from './LabelFormDialog';
import ConfirmDialog from '../shared/Dialog/ConfirmDialog';
import { EmptyState, SortableHeader, LabelTableRow } from './components';
import { useLabelSort, useLabelDialogs, useLabelData } from './hooks';

interface LabelManagementPanelProps {
  /** メッセージ表示時のコールバック */
  onMessage?: (message: { type: 'success' | 'danger' | 'warning' | 'critical' | 'default' | 'info' | 'upsell'; text: string }) => void;
}

const LabelManagementPanel: React.FC<LabelManagementPanelProps> = ({ onMessage }) => {
  const { sortField, sortDirection, handleSort } = useLabelSort();
  const { allLabelsWithInfo } = useLabelData(sortField, sortDirection);

  // メッセージコールバック
  const handleMessage = useCallback((message: { type: 'success' | 'danger' | 'warning' | 'critical' | 'default' | 'info' | 'upsell'; text: string } | null) => {
    // nullチェックを追加してランタイムエラーを防ぐ
    if (!message) {
      return;
    }

    // 親のSettingsDialogのDialogFlashMessageに送信
    if (onMessage) {
      onMessage(message);
    }
  }, [onMessage]);

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
  } = useLabelDialogs(handleMessage);

  return (
    <div className="flex flex-col gap-3">
      {/* ヘッダー */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">
            ラベル管理
          </h2>
        </div>
        <Button
          variant="default"
          onClick={handleCreate}
          size="sm"
        >
          <Plus size={16} className="mr-2" />
          ラベルを作成
        </Button>
      </div>

      {/* ラベル一覧 */}
      {allLabelsWithInfo.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="border border-gray-200 rounded-md overflow-hidden">
          {/* テーブルヘッダー */}
          <div className="grid grid-cols-[1fr_200px_60px_50px] gap-2 p-2 bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-600">
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
            <div className="text-center text-xs">操作</div>
          </div>

          {/* テーブルボディ */}
          <div className="max-h-[400px] overflow-auto">
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
          </div>
        </div>
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
    </div>
  );
};

export default LabelManagementPanel;