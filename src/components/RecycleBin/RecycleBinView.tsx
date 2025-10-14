import React, { useMemo, useState } from "react";
import {
  Button,
  Text,
  Flash,
  Spinner,
  ConfirmationDialog,
} from "@primer/react";
import {
  TrashIcon,
  RepoIcon,
  ClockIcon,
  AlertIcon,
  HistoryIcon,
} from "@primer/octicons-react";
import { useBoard } from "../../contexts/BoardContext";
import {
  getRecycleBinTasks,
  emptyRecycleBin,
  restoreTaskFromRecycleBin,
  formatTimeUntilDeletion,
} from "../../utils/recycleBin";
import { DEFAULT_RECYCLE_BIN_SETTINGS, type RecycleBinSettings } from "../../types/settings";
import { logger } from "../../utils/logger";

/**
 * ゴミ箱のタスクを表示・復元・完全削除するコンポーネント
 */
export const RecycleBinView: React.FC = () => {
  const { state, importBoards } = useBoard();
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isEmptying, setIsEmptying] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  // LocalStorageから現在のゴミ箱設定を読み込み
  const recycleBinSettings = useMemo(() => {
    try {
      const stored = localStorage.getItem('recycleBinSettings');
      if (stored) {
        return JSON.parse(stored) as RecycleBinSettings;
      }
    } catch (error) {
      logger.warn('ゴミ箱設定の読み込みに失敗:', error);
    }
    return DEFAULT_RECYCLE_BIN_SETTINGS;
  }, []);

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
      const updatedBoards = restoreTaskFromRecycleBin(state.boards, taskId);
      if (updatedBoards) {
        importBoards(updatedBoards, true);
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
        <TrashIcon size={24}  />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Text
            as="h2"
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--fgColor-default)'
            }}
          >
            ゴミ箱は空です
          </Text>
          <Text style={{ color: 'var(--fgColor-muted)', fontSize: '14px' }}>
            削除されたタスクはありません。
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
          marginBottom: '8px'
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
            ゴミ箱
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
                削除中...
              </>
            ) : (
              <>
                <TrashIcon size={12} />
                ゴミ箱を空にする
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
          {deletedTasks.length}件のタスクがゴミ箱にあります
        </div>

        <Flash
          variant="warning"
          style={{ marginBottom: '12px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AlertIcon size={16} />
            <Text style={{ marginLeft: '8px' }}>
              {recycleBinSettings.retentionDays === null ? (
                <>
                  これらのタスクは無制限に保持されます。手動で削除するまで自動削除されません。<br />
                  不要なタスクは「ゴミ箱を空にする」で削除してください。
                </>
              ) : (
                <>
                  これらのタスクは{recycleBinSettings.retentionDays}日後に自動的に完全削除されます。<br />
                  復元が必要な場合は早めに操作してください。
                </>
              )}
            </Text>
          </div>
        </Flash>
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
                    marginBottom: '4px'
                  }}
                >
                  {task.title}
                </Text>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--fgColor-muted)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <RepoIcon size={12} />
                    <Text>{task.boardTitle} → {task.columnTitle}</Text>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <ClockIcon size={12} />
                    <Text>
                      削除予定: {task.deletedAt ?
                        formatTimeUntilDeletion(task.deletedAt, recycleBinSettings.retentionDays)
                        : "不明"
                      }
                    </Text>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {isRestoring === task.id ? (
                  <Button disabled>
                    <Spinner size="small" style={{ marginRight: '4px' }} />
                    復元中...
                  </Button>
                ) : showConfirm === task.id ? (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handleRestore(task.id)}
                    >
                      復元を確認
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setShowConfirm(null)}
                    >
                      キャンセル
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
                      <Text>復元</Text>
                    </div>
                  </Button>
                )}
              </div>
            </div>

            {task.description && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: 'var(--color-canvas-default)',
                borderRadius: '4px'
              }}>
                <Text
                  fontSize={1}
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
      {showEmptyConfirm && (
        <ConfirmationDialog
          title="ゴミ箱を空にする"
          onClose={(confirmed) => {
            if (confirmed === "confirm") {
              handleEmptyRecycleBin();
            } else {
              setShowEmptyConfirm(false);
            }
          }}
          confirmButtonContent="完全削除"
          confirmButtonType="danger"
          cancelButtonContent="キャンセル"
        >
          <Text>
            ゴミ箱内の{deletedTasks.length}件のタスクをすべて完全削除します。<br />
            この操作は取り消すことができません。本当に実行しますか？
          </Text>
        </ConfirmationDialog>
      )}
    </div>
  );
};

export default RecycleBinView;