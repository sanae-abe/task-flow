import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../ConfirmDialog';
import { useBoard } from '../../contexts/BoardContext';
import { getRecycleBinTasks } from '../../utils/recycleBin';
import { useRecycleBinSettingsReadOnly } from '../../hooks/useRecycleBinSettings';
import { useRecycleBinOperations } from '../../hooks/useRecycleBinOperations';
import { MESSAGES } from '../../constants/recycleBin';
import { RecycleBinEmptyState } from './components/RecycleBinEmptyState';
import { RecycleBinHeader } from './components/RecycleBinHeader';
import {
  RecycleBinTaskItem,
  type DeletedTaskWithMeta,
} from './components/RecycleBinTaskItem';

/**
 * ゴミ箱のタスクを表示・復元・完全削除するコンポーネント
 */
interface RecycleBinViewProps {
  /** メッセージ表示時のコールバック */
  onMessage?: (message: {
    type:
      | 'success'
      | 'critical'
      | 'warning'
      | 'danger'
      | 'default'
      | 'info'
      | 'upsell';
    text: string;
  }) => void;
}

export const RecycleBinView: React.FC<RecycleBinViewProps> = ({
  onMessage,
}) => {
  const { t } = useTranslation();
  const { state } = useBoard();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  // ゴミ箱設定を読み込み
  const recycleBinSettings = useRecycleBinSettingsReadOnly();

  // ゴミ箱操作フック
  const {
    restoringTaskId,
    deletingTaskId,
    isEmptying,
    restoreTask,
    permanentlyDeleteTask,
    emptyRecycleBin,
  } = useRecycleBinOperations(onMessage);

  // ゴミ箱のタスクを取得
  const deletedTasks = useMemo(
    (): DeletedTaskWithMeta[] =>
      getRecycleBinTasks(state.boards).map(task => ({
        ...task,
        boardTitle:
          state.boards.find(b => b.id === task.boardId)?.title ||
          t('board.noBoards'),
        columnTitle:
          state.boards
            .find(b => b.id === task.boardId)
            ?.columns.find(c => c.id === task.columnId)?.title ||
          t('column.column'),
      })),
    [state.boards, t]
  );

  const handleRestore = async (taskId: string) => {
    const task = deletedTasks.find(t => t.id === taskId);
    await restoreTask(taskId, task?.title);
  };

  const handlePermanentDelete = async (taskId: string) => {
    const task = deletedTasks.find(t => t.id === taskId);
    await permanentlyDeleteTask(taskId, task?.title);
    setShowDeleteConfirm(null);
  };

  const handleEmptyRecycleBin = async () => {
    await emptyRecycleBin();
    setShowEmptyConfirm(false);
  };

  // 空状態の表示
  if (deletedTasks.length === 0) {
    return (
      <div className='pb-4'>
        <RecycleBinEmptyState />
      </div>
    );
  }

  return (
    <div className='pb-4'>
      <RecycleBinHeader
        taskCount={deletedTasks.length}
        settings={recycleBinSettings}
        isEmptying={isEmptying}
        onEmptyClick={() => setShowEmptyConfirm(true)}
      />

      <div className='grid gap-3'>
        {deletedTasks.map(task => (
          <RecycleBinTaskItem
            key={task.id}
            task={task}
            settings={recycleBinSettings}
            restoringTaskId={restoringTaskId}
            deletingTaskId={deletingTaskId}
            onRestore={handleRestore}
            onDeleteConfirm={setShowDeleteConfirm}
          />
        ))}
      </div>

      {/* ゴミ箱を空にする確認ダイアログ */}
      <ConfirmDialog
        isOpen={showEmptyConfirm}
        title={MESSAGES.EMPTY_BIN.CONFIRM_TITLE}
        message={`${deletedTasks.length}${t('recycleBin.emptyConfirm')}`}
        onConfirm={handleEmptyRecycleBin}
        onCancel={() => setShowEmptyConfirm(false)}
        confirmText={MESSAGES.EMPTY_BIN.CONFIRM_ACTION}
        cancelText={MESSAGES.EMPTY_BIN.CANCEL_ACTION}
      />

      {/* 個別完全削除の確認ダイアログ */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={!!showDeleteConfirm}
          title={t('recycleBin.permanentDelete')}
          message={`${t('recycleBin.permanentDeleteConfirm')}`}
          onConfirm={() => handlePermanentDelete(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
          confirmText={t('recycleBin.permanentDelete')}
          cancelText={t('common.cancel')}
        />
      )}
    </div>
  );
};

export default RecycleBinView;
