import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

import { useBoard } from '../../contexts/BoardContext';
import { getAllRecycleBinItems } from '../../utils/recycleBin';
import { useRecycleBinSettingsReadOnly } from '../../hooks/useRecycleBinSettings';
import { useRecycleBinOperations } from '../../hooks/useRecycleBinOperations';
import { useRecycleBinSort } from '../../hooks/useRecycleBinSort';
import ConfirmDialog from '../ConfirmDialog';
import { RecycleBinDataTable } from './components/RecycleBinDataTable';
import { RecycleBinItemDetailDialog } from './components/RecycleBinItemDetailDialog';
import type { DialogFlashMessageData } from '../shared/DialogFlashMessage';
import type { RecycleBinItemWithMeta } from '../../types/recycleBin';

interface UnifiedRecycleBinViewProps {
  onMessage?: (message: DialogFlashMessageData) => void;
}

const UnifiedRecycleBinView: React.FC<UnifiedRecycleBinViewProps> = ({
  onMessage,
}) => {
  const { t } = useTranslation();
  const {
    state,
    restoreBoard,
    permanentlyDeleteBoard,
    restoreColumn,
    permanentlyDeleteColumn,
  } = useBoard();
  const [restoringItemId, setRestoringItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [emptyingRecycleBin, setEmptyingRecycleBin] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState<string | null>(null);

  // ゴミ箱設定を読み込み
  const recycleBinSettings = useRecycleBinSettingsReadOnly();

  // タスクのゴミ箱操作フック
  const {
    restoringTaskId,
    deletingTaskId,
    isEmptying,
    restoreTask,
    permanentlyDeleteTask,
    emptyRecycleBin,
  } = useRecycleBinOperations(onMessage);

  // 統合されたゴミ箱アイテムを取得
  const rawRecycleBinItems = useMemo(
    () => getAllRecycleBinItems(state.boards, recycleBinSettings),
    [state.boards, recycleBinSettings]
  );

  // ソート機能
  const {
    sortField,
    sortDirection,
    sortedItems: allRecycleBinItems,
    handleSort,
  } = useRecycleBinSort({
    items: rawRecycleBinItems,
    recycleBinSettings,
  });

  const handleRestore = async (item: RecycleBinItemWithMeta) => {
    setRestoringItemId(item.id);
    try {
      if (item.type === 'task') {
        await restoreTask(item.id, item.title);
      } else if (item.type === 'board') {
        restoreBoard(item.id);
      } else if (item.type === 'column') {
        restoreColumn(item.id);
      }
    } catch {
      const itemTypeText =
        item.type === 'task'
          ? 'タスク'
          : item.type === 'board'
            ? 'ボード'
            : 'カラム';
      onMessage?.({
        type: 'danger',
        text: `${itemTypeText}の復元に失敗しました`,
      });
    } finally {
      setRestoringItemId(null);
    }
  };

  const handlePermanentDelete = async (item: RecycleBinItemWithMeta) => {
    setDeletingItemId(item.id);
    try {
      if (item.type === 'task') {
        await permanentlyDeleteTask(item.id, item.title);
      } else if (item.type === 'board') {
        permanentlyDeleteBoard(item.id);
      } else if (item.type === 'column') {
        permanentlyDeleteColumn(item.id);
      }
    } catch {
      const itemTypeText =
        item.type === 'task'
          ? 'タスク'
          : item.type === 'board'
            ? 'ボード'
            : 'カラム';
      onMessage?.({
        type: 'danger',
        text: `${itemTypeText}の完全削除に失敗しました`,
      });
    } finally {
      setDeletingItemId(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleEmptyRecycleBin = async () => {
    setEmptyingRecycleBin(true);
    try {
      // タスクとボードの両方を空にする
      await emptyRecycleBin();
      const boardCount = state.boards.filter(
        b => b.deletionState === 'deleted'
      ).length;
      if (boardCount > 0) {
        // ボードの空にする機能を実装する必要がある場合
        // emptyBoardRecycleBin();
      }
    } catch {
      onMessage?.({
        type: 'danger',
        text: 'ゴミ箱を空にすることに失敗しました',
      });
    } finally {
      setEmptyingRecycleBin(false);
      setShowEmptyConfirm(false);
    }
  };

  const getItemLoadingState = (item: RecycleBinItemWithMeta) => {
    const isLoading =
      restoringItemId === item.id ||
      deletingItemId === item.id ||
      (item.type === 'task' &&
        (restoringTaskId === item.id || deletingTaskId === item.id));

    const loadingText =
      restoringItemId === item.id || restoringTaskId === item.id
        ? '復元中...'
        : '削除中...';

    return { isLoading, loadingText };
  };

  const selectedItem = showDeleteConfirm
    ? allRecycleBinItems.find(item => item.id === showDeleteConfirm)
    : null;

  const detailItem = showDetailDialog
    ? (allRecycleBinItems.find(item => item.id === showDetailDialog) ?? null)
    : null;

  return (
    <div className='flex flex-col gap-3'>
      {/* ヘッダー */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-bold text-foreground'>
            {t('recycleBin.recycleBinWithCount', {
              count: allRecycleBinItems.length,
            })}
          </h2>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setShowEmptyConfirm(true)}
          disabled={
            emptyingRecycleBin || isEmptying || allRecycleBinItems.length === 0
          }
        >
          {emptyingRecycleBin || isEmptying ? (
            <>
              <Loader2 size={16} className='animate-spin mr-2' />
              {t('recycleBin.deleting')}
            </>
          ) : (
            t('recycleBin.emptyRecycleBin')
          )}
        </Button>
      </div>

      {/* ゴミ箱一覧 */}
      <RecycleBinDataTable
        items={allRecycleBinItems}
        recycleBinSettings={recycleBinSettings}
        getItemLoadingState={getItemLoadingState}
        onRestore={handleRestore}
        onDelete={item => setShowDeleteConfirm(item.id)}
        onShowDetail={item => setShowDetailDialog(item.id)}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* ゴミ箱を空にする確認ダイアログ */}
      <ConfirmDialog
        isOpen={showEmptyConfirm}
        title={t('recycleBin.emptyRecycleBin')}
        message={t('recycleBin.emptyAllConfirm', {
          count: allRecycleBinItems.length,
        })}
        onConfirm={handleEmptyRecycleBin}
        onCancel={() => setShowEmptyConfirm(false)}
        confirmText={t('recycleBin.permanentDelete')}
        cancelText={t('common.cancel')}
      />

      {/* 個別完全削除の確認ダイアログ */}
      {selectedItem && (
        <ConfirmDialog
          isOpen={!!showDeleteConfirm}
          title={`${selectedItem.type === 'board' ? 'ボード' : selectedItem.type === 'column' ? 'カラム' : 'タスク'}の完全削除`}
          message={`${selectedItem.type === 'board' ? 'ボード' : selectedItem.type === 'column' ? 'カラム' : 'タスク'}「${selectedItem.title}」を完全に削除しますか？この操作は元に戻せません。`}
          onConfirm={() => handlePermanentDelete(selectedItem)}
          onCancel={() => setShowDeleteConfirm(null)}
          confirmText='完全に削除'
          cancelText='キャンセル'
        />
      )}

      {/* 詳細表示ダイアログ */}
      <RecycleBinItemDetailDialog
        item={detailItem}
        isOpen={!!showDetailDialog}
        onClose={() => setShowDetailDialog(null)}
        onRestore={handleRestore}
        onDelete={item => setShowDeleteConfirm(item.id)}
      />
    </div>
  );
};

export default UnifiedRecycleBinView;
