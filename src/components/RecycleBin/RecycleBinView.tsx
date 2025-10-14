import React, { useMemo, useState } from "react";
import {
  Button,
  Text,
  Flash,
  Spinner,
} from "@primer/react";
import {
  TrashIcon,
  RepoIcon,
  ClockIcon,
  AlertIcon,
  HistoryIcon,
} from "@primer/octicons-react";
import { useBoard } from "../../contexts/BoardContext";
import { type Task } from "../../types";
// date-fnsの代わりにシンプルな日付計算を使用

/**
 * ソフトデリートされたタスクを表示・復元するコンポーネント
 */
export const RecycleBinView: React.FC = () => {
  const { state, restoreTask } = useBoard();
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  // ソフトデリートされたタスクを取得
  const softDeletedTasks = useMemo(() => {
    const deletedTasks: (Task & { boardTitle: string; columnTitle: string })[] = [];

    state.boards.forEach((board) => {
      board.columns.forEach((column) => {
        column.tasks.forEach((task) => {
          if (task.deletionState === "soft-deleted") {
            deletedTasks.push({
              ...task,
              boardTitle: board.title,
              columnTitle: column.title,
            });
          }
        });
      });
    });

    // 削除日時順でソート（新しいものから）
    return deletedTasks.sort((a, b) => {
      const aTime = new Date(a.softDeletedAt || 0).getTime();
      const bTime = new Date(b.softDeletedAt || 0).getTime();
      return bTime - aTime;
    });
  }, [state.boards]);

  const handleRestore = (taskId: string) => {
    setIsRestoring(taskId);
    try {
      restoreTask(taskId);
      setShowConfirm(null);
    } catch (error) {
      // エラーハンドリングは上位コンポーネントで行われる
    } finally {
      setIsRestoring(null);
    }
  };

  const formatTimeRemaining = (scheduledDeletionAt: string | null | undefined) => {
    if (!scheduledDeletionAt) {
      return "不明";
    }

    const deletionDate = new Date(scheduledDeletionAt);
    const now = new Date();

    if (deletionDate <= now) {
      return "削除予定時刻を過ぎています";
    }

    const diffMs = deletionDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `約${diffDays}日後`;
    }
    if (diffHours > 0) {
      return `約${diffHours}時間後`;
    }
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `約${diffMinutes}分後`;
  };

  if (softDeletedTasks.length === 0) {
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
            ごみ箱は空です
          </Text>
          <Text style={{ color: 'var(--fgColor-muted)', fontSize: '14px' }}>
            ソフトデリートされたタスクはありません。
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '16px' }}>
      <div style={{ marginBottom: '16px', }}>
        <Text
          as="h2"
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ごみ箱
        </Text>
        <div
          style={{
            marginBottom: '12px',
            color: 'var(--fgColor-muted)',
            fontSize: '14px',
        }}
        >
          {softDeletedTasks.length}件のソフトデリートされたタスクがあります
        </div>
        <Flash
          variant="warning"
          style={{ marginBottom: '12px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AlertIcon size={16} />
            <Text style={{ marginLeft: '8px' }}>
              これらのタスクは自動的に完全削除されます。<br />
              復元が必要な場合は早めに操作してください。
            </Text>
          </div>
        </Flash>
      </div>

      <div style={{
        display: 'grid',
        gap: '12px',
      }}>
        {softDeletedTasks.map((task) => (
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
                      削除予定: {formatTimeRemaining(task.scheduledDeletionAt)}
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
    </div>
  );
};

export default RecycleBinView;