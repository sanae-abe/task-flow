import React, { useMemo, useState } from "react";
import {
  Button,
  Text,
  Spinner,
} from "@primer/react";
import ConfirmDialog from "../ConfirmDialog";
import {
  TrashIcon,
  RepoIcon,
  ClockIcon,
  HistoryIcon,
  ArrowRightIcon
} from "@primer/octicons-react";
import { useBoard } from "../../contexts/BoardContext";
import {
  getRecycleBinTasks,
  emptyRecycleBin,
  restoreTaskFromRecycleBin,
  formatTimeUntilDeletion,
} from "../../utils/recycleBin";
import { useRecycleBinSettingsReadOnly } from "../../hooks/useRecycleBinSettings";
import { UI_TEXT, MESSAGES } from "../../constants/recycleBin";
import { logger } from "../../utils/logger";
import { InlineMessage } from "../shared";

/**
 * ゴミ箱のタスクを表示・復元・完全削除するコンポーネント
 */
export const RecycleBinView: React.FC = () => {
  const { state, importBoards } = useBoard();
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isEmptying, setIsEmptying] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
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
        const customMessage = taskToRestore ?
          `タスク「${taskToRestore.title}」を復元しました` :
          "タスクを復元しました";
        importBoards(updatedBoards, true, customMessage);
        setShowConfirm(null);
      }
    } catch (error) {
      logger.error("復元エラー:", error);
    } finally {
      setIsRestoring(null);
    }
  };

  const handleEmptyRecycleBin = async () => {
    setIsEmptying(true);
    try {
      const { updatedBoards, deletedCount } = emptyRecycleBin(state.boards);
      importBoards(updatedBoards, true);
      setShowEmptyConfirm(false);
      logger.info(`${deletedCount}件のタスクを完全削除しました`);
    } catch (error) {
      logger.error("ゴミ箱を空にする際のエラー:", error);
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
          margin: '16px',
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
              <>
                <Spinner size="small" style={{ marginRight: '4px' }} />
                {MESSAGES.EMPTY_BIN.IN_PROGRESS}
              </>
            ) : (
              <>
                <TrashIcon size={12} />
                {UI_TEXT.VIEW.EMPTY_BIN_BUTTON}
              </>
            )}
          </Button>
        </div>

        <div
          style={{
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
                {isRestoring === task.id ? (
                  <Button disabled>
                    <Spinner size="small" style={{ marginRight: '4px' }} />
                    {MESSAGES.RESTORE.IN_PROGRESS}
                  </Button>
                ) : showConfirm === task.id ? (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handleRestore(task.id)}
                    >
                      {MESSAGES.RESTORE.CONFIRM_ACTION}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setShowConfirm(null)}
                    >
                      {MESSAGES.RESTORE.CANCEL_ACTION}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="small"
                    onClick={() => setShowConfirm(task.id)}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <HistoryIcon size={12} />
                      <Text>{UI_TEXT.VIEW.RESTORE_BUTTON}</Text>
                    </div>
                  </Button>
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
    </div>
  );
};

export default RecycleBinView;