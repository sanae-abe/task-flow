import React, { useMemo, useState } from "react";
import {
  Button,
  Text,
  Spinner,
  ActionMenu,
  ActionList,
} from "@primer/react";
import ConfirmDialog from "../ConfirmDialog";
import {
  TrashIcon,
  RepoIcon,
  ClockIcon,
  HistoryIcon,
  ArrowRightIcon,
  KebabHorizontalIcon
} from "@primer/octicons-react";
import { useBoard } from "../../contexts/BoardContext";
import {
  getRecycleBinTasks,
  emptyRecycleBin,
  restoreTaskFromRecycleBin,
  formatTimeUntilDeletion,
  permanentlyDeleteTask,
} from "../../utils/recycleBin";
import { useRecycleBinSettingsReadOnly } from "../../hooks/useRecycleBinSettings";
import { UI_TEXT, MESSAGES } from "../../constants/recycleBin";
import { logger } from "../../utils/logger";
import { InlineMessage } from "../shared";

/**
 * ゴミ箱のタスクを表示・復元・完全削除するコンポーネント
 */
interface RecycleBinViewProps {
  /** メッセージ表示時のコールバック */
  onMessage?: (message: { type: 'success' | 'critical' | 'warning' | 'danger' | 'default' | 'info' | 'upsell'; text: string }) => void;
}

export const RecycleBinView: React.FC<RecycleBinViewProps> = ({ onMessage }) => {
  const { state, importBoards } = useBoard();
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEmptying, setIsEmptying] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  // ゴミ箱設定を読み込み
  const recycleBinSettings = useRecycleBinSettingsReadOnly();

  // ゴミ箱のタスクを取得
  const deletedTasks = useMemo(() => getRecycleBinTasks(state.boards).map(task => ({
    ...task,
    boardTitle: state.boards.find(b => b.id === task.boardId)?.title || "不明なボード",
    columnTitle: state.boards
      .find(b => b.id === task.boardId)
      ?.columns.find(c => c.id === task.columnId)?.title || "不明なカラム",
  })), [state.boards]);

  const handleRestore = async (taskId: string) => {
    setIsRestoring(taskId);
    try {
      // 復元前にタスク情報を取得
      const taskToRestore = deletedTasks.find(task => task.id === taskId);
      const updatedBoards = restoreTaskFromRecycleBin(state.boards, taskId);
      if (updatedBoards) {
        const message = taskToRestore ?
          `タスク「${taskToRestore.title}」を復元しました` :
          "タスクを復元しました";
        importBoards(updatedBoards, true, undefined, true);
        onMessage?.({ type: 'success', text: message });
      }
    } catch (error) {
      logger.error("復元エラー:", error);
      onMessage?.({ type: 'danger', text: '復元に失敗しました' });
    } finally {
      setIsRestoring(null);
    }
  };

  const handlePermanentDelete = async (taskId: string) => {
    setIsDeleting(taskId);
    try {
      // 削除前にタスク情報を取得
      const taskToDelete = deletedTasks.find(task => task.id === taskId);
      const { updatedBoards, success } = permanentlyDeleteTask(state.boards, taskId);
      if (success) {
        const message = taskToDelete ?
          `タスク「${taskToDelete.title}」を完全に削除しました` :
          "タスクを完全に削除しました";
        importBoards(updatedBoards, true, undefined, true);
        setShowDeleteConfirm(null);
        onMessage?.({ type: 'success', text: message });
      }
    } catch (error) {
      logger.error("完全削除エラー:", error);
      onMessage?.({ type: 'danger', text: '完全削除に失敗しました' });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEmptyRecycleBin = async () => {
    setIsEmptying(true);
    try {
      const { updatedBoards, deletedCount } = emptyRecycleBin(state.boards);
      importBoards(updatedBoards, true, undefined, true);
      setShowEmptyConfirm(false);
      onMessage?.({ type: 'success', text: `${deletedCount}件のタスクを完全削除しました` });
      logger.info(`${deletedCount}件のタスクを完全削除しました`);
    } catch (error) {
      logger.error("ゴミ箱を空にする際のエラー:", error);
      onMessage?.({ type: 'danger', text: 'ゴミ箱を空にする際にエラーが発生しました' });
    } finally {
      setIsEmptying(false);
    }
  };

  if (deletedTasks.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          paddingBlock: '24px',
          border: '1px dashed',
          borderColor: 'var(--borderColor-muted)',
          borderRadius: 'var(--borderRadius-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '16px',
          color: 'var(--fgColor-muted)'
        }}
      >
        <TrashIcon size={24} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Text
            as="h2"
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--fgColor-default)'
            }}
          >
            {UI_TEXT.VIEW.EMPTY_TITLE}
          </Text>
          <Text style={{ color: 'var(--fgColor-muted)', fontSize: '14px' }}>
            {UI_TEXT.VIEW.EMPTY_DESCRIPTION}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '16px' }}>
      <div style={{ marginBottom: '16px', }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Text
            as="h2"
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <TrashIcon size={16} />
            {UI_TEXT.VIEW.TITLE}
          </Text>
          <Button
            variant="danger"
            size="small"
            onClick={() => setShowEmptyConfirm(true)}
            disabled={isEmptying}
          >
            {isEmptying ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Spinner size="small" style={{ marginRight: '4px' }} />
                {MESSAGES.EMPTY_BIN.IN_PROGRESS}
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrashIcon size={14} />
                {UI_TEXT.VIEW.EMPTY_BIN_BUTTON}
              </span>
            )}
          </Button>
        </div>

        <div
          style={{
            marginTop: '12px',
            marginBottom: '12px',
            color: 'var(--fgColor-muted)',
            fontSize: '14px',
          }}
        >
          {UI_TEXT.VIEW.TASK_COUNT(deletedTasks.length)}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <InlineMessage variant="warning" message={recycleBinSettings.retentionDays === null ? (
              UI_TEXT.VIEW.WARNING_UNLIMITED
            ) : (
              UI_TEXT.VIEW.WARNING_LIMITED(recycleBinSettings.retentionDays)
            )
          } />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gap: '12px',
      }}>
        {deletedTasks.map((task) => (
          <div
            key={task.id}
            style={{
              border: '1px solid var(--borderColor-default)',
              borderRadius: '6px',
              padding: '12px',
              backgroundColor: 'var(--bgColor-muted)',
              opacity: 0.8
            }}
          >
            <div style={{
              display: 'flex',
              gap: "8px",
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <div style={{ flex: 1 }}>
                <Text
                  as="h3"
                  style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  {task.title}
                </Text>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(isRestoring === task.id || isDeleting === task.id) ? (
                  <Button disabled>
                    <Spinner size="small" style={{ marginRight: '4px' }} />
                    {isRestoring === task.id ? MESSAGES.RESTORE.IN_PROGRESS : "削除中..."}
                  </Button>
                ) : (
                  <ActionMenu>
                    <ActionMenu.Anchor>
                      <Button
                        size="small"
                        leadingVisual={KebabHorizontalIcon}
                      >
                        操作
                      </Button>
                    </ActionMenu.Anchor>
                    <ActionMenu.Overlay>
                      <ActionList>
                        <ActionList.Item
                          onSelect={() => handleRestore(task.id)}
                        >
                          <ActionList.LeadingVisual>
                            <HistoryIcon size={16} />
                          </ActionList.LeadingVisual>
                          復元
                        </ActionList.Item>
                        <ActionList.Divider />
                        <ActionList.Item
                          variant="danger"
                          onSelect={() => setShowDeleteConfirm(task.id)}
                        >
                          <ActionList.LeadingVisual>
                            <TrashIcon size={16} />
                          </ActionList.LeadingVisual>
                          完全に削除
                        </ActionList.Item>
                      </ActionList>
                    </ActionMenu.Overlay>
                  </ActionMenu>
                )}
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              fontSize: '14px',
              color: 'var(--fgColor-muted)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <RepoIcon size={12} />
                <Text>{task.boardTitle} <ArrowRightIcon size={12} /> {task.columnTitle}</Text>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ClockIcon size={12} />
                <Text>
                  {UI_TEXT.VIEW.DELETION_SCHEDULE} {task.deletedAt ?
                    formatTimeUntilDeletion(task.deletedAt, recycleBinSettings.retentionDays)
                    : MESSAGES.RETENTION.UNKNOWN
                  }
                </Text>
              </div>
            </div>

            {task.description && (
              <div style={{
                marginTop: '8px',
                backgroundColor: 'var(--color-canvas-default)',
                borderRadius: '4px'
              }}>
                <Text
                  fontSize={0}
                  color="fg.muted"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {task.description.replace(/<[^>]*>/g, "")} {/* HTMLタグを除去 */}
                </Text>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ゴミ箱を空にする確認ダイアログ */}
      <ConfirmDialog
        isOpen={showEmptyConfirm}
        title={MESSAGES.EMPTY_BIN.CONFIRM_TITLE}
        message={UI_TEXT.VIEW.CONFIRM_EMPTY_MESSAGE(deletedTasks.length)}
        onConfirm={handleEmptyRecycleBin}
        onCancel={() => setShowEmptyConfirm(false)}
        confirmText={MESSAGES.EMPTY_BIN.CONFIRM_ACTION}
        cancelText={MESSAGES.EMPTY_BIN.CANCEL_ACTION}
      />

      {/* 個別完全削除の確認ダイアログ */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={!!showDeleteConfirm}
          title="タスクの完全削除"
          message={`タスク「${deletedTasks.find(t => t.id === showDeleteConfirm)?.title || ''}」を完全に削除しますか？この操作は元に戻せません。`}
          onConfirm={() => handlePermanentDelete(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
          confirmText="完全に削除"
          cancelText="キャンセル"
        />
      )}
    </div>
  );
};

export default RecycleBinView;