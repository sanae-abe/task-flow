import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import LabelFormDialog from './LabelFormDialog';
import ConfirmDialog from '../shared/Dialog/ConfirmDialog';
import { EmptyState } from './components';
import { LabelDataTable } from './components/LabelDataTable';
import { useLabelDialogs, useLabelData } from './hooks';

interface LabelManagementPanelProps {
  /** メッセージ表示時のコールバック */
  onMessage?: (message: {
    type:
      | 'success'
      | 'danger'
      | 'warning'
      | 'critical'
      | 'default'
      | 'info'
      | 'upsell';
    text: string;
  }) => void;
}

const LabelManagementPanel: React.FC<LabelManagementPanelProps> = ({
  onMessage,
}) => {
  const { t } = useTranslation();
  const { allLabelsWithInfo } = useLabelData('name', 'asc');

  // メッセージコールバック
  const handleMessage = useCallback(
    (
      message: {
        type:
          | 'success'
          | 'danger'
          | 'warning'
          | 'critical'
          | 'default'
          | 'info'
          | 'upsell';
        text: string;
      } | null
    ) => {
      // nullチェックを追加してランタイムエラーを防ぐ
      if (!message) {
        return;
      }

      // 親のSettingsDialogのDialogFlashMessageに送信
      if (onMessage) {
        onMessage(message);
      }
    },
    [onMessage]
  );

  const {
    editDialog,
    deleteDialog,
    handleEdit,
    handleCreate,
    handleDelete,
    handleCloseEditDialog,
    handleCloseDeleteDialog,
    handleSave,
    handleConfirmDelete,
  } = useLabelDialogs(handleMessage);

  return (
    <div className='flex flex-col gap-3'>
      {/* ヘッダー */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-bold'>{t('label.manageLabels')}</h2>
        </div>
        <Button variant='default' onClick={handleCreate} size='sm'>
          <Plus size={16} className='mr-2' />
          {t('label.createLabel')}
        </Button>
      </div>

      {/* ラベル一覧 */}
      {allLabelsWithInfo.length === 0 ? (
        <EmptyState />
      ) : (
        <LabelDataTable
          labels={allLabelsWithInfo}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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
        title={t('label.deleteLabel')}
        message={
          deleteDialog.label
            ? `${t('label.deleteLabelConfirm').replace('このラベル', `ラベル「${deleteDialog.label.name}」`)}${'usageCount' in deleteDialog.label && typeof deleteDialog.label.usageCount === 'number' && deleteDialog.label.usageCount > 0 ? `\n\n${deleteDialog.label.usageCount}個のタスクからも削除されます。` : ''}`
            : ''
        }
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmVariant='danger'
      />
    </div>
  );
};

export default LabelManagementPanel;
