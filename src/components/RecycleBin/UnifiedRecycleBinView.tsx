import React, { useMemo, useState } from "react";
import {
  Button,
  Text,
  Spinner,
  Heading,
  IconButton,
} from "@primer/react";
import {
  HistoryIcon,
  TrashIcon,
  ProjectIcon,
  TasklistIcon,
  ClockIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
} from "@primer/octicons-react";

import { useBoard } from "../../contexts/BoardContext";
import { getAllRecycleBinItems } from "../../utils/recycleBin";
import { useRecycleBinSettingsReadOnly } from "../../hooks/useRecycleBinSettings";
import { useRecycleBinOperations } from "../../hooks/useRecycleBinOperations";
import ConfirmDialog from "../ConfirmDialog";
import UnifiedDialog from "../shared/Dialog/UnifiedDialog";
import { LoadingButton } from "../shared/LoadingButton";
import type { DialogFlashMessageData } from "../shared/DialogFlashMessage";
import type { RecycleBinItemWithMeta } from "../../types/recycleBin";

type SortField = 'type' | 'title' | 'deletedAt' | 'location' | 'timeUntilDeletion';
type SortDirection = 'asc' | 'desc';

interface UnifiedRecycleBinViewProps {
  onMessage?: (message: DialogFlashMessageData) => void;
}

const UnifiedRecycleBinView: React.FC<UnifiedRecycleBinViewProps> = ({
  onMessage,
}) => {
  const { state, restoreBoard, permanentlyDeleteBoard } = useBoard();
  const [restoringItemId, setRestoringItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [emptyingRecycleBin, setEmptyingRecycleBin] = useState(false);
  const [sortField, setSortField] = useState<SortField>('deletedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
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

  // ソート済みアイテム
  const allRecycleBinItems = useMemo(() =>
    [...rawRecycleBinItems].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'deletedAt':
          aValue = new Date(a.deletedAt || 0).getTime();
          bValue = new Date(b.deletedAt || 0).getTime();
          break;
        case 'location':
          aValue = a.type === 'task' ? `${a.boardTitle} → ${a.columnTitle}` : '';
          bValue = b.type === 'task' ? `${b.boardTitle} → ${b.columnTitle}` : '';
          break;
        case 'timeUntilDeletion':
          // 削除予定時刻を計算してソート（無制限の場合は最後に配置）
          const getExpirationTime = (item: RecycleBinItemWithMeta) => {
            if (recycleBinSettings.retentionDays === null || !item.deletedAt) {
              return Number.MAX_SAFE_INTEGER; // 無制限は最後
            }
            const deletedDate = new Date(item.deletedAt);
            return deletedDate.getTime() + (recycleBinSettings.retentionDays * 24 * 60 * 60 * 1000);
          };
          aValue = getExpirationTime(a);
          bValue = getExpirationTime(b);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    }),
    [rawRecycleBinItems, sortField, sortDirection, recycleBinSettings.retentionDays]);

  // ソートハンドラー
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRestore = async (item: RecycleBinItemWithMeta) => {
    setRestoringItemId(item.id);
    try {
      if (item.type === 'task') {
        await restoreTask(item.id, item.title);
      } else if (item.type === 'board') {
        restoreBoard(item.id);
      }
    } catch {
      onMessage?.({
        type: "danger",
        text: `${item.type === 'task' ? 'タスク' : 'ボード'}の復元に失敗しました`,
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
      }
    } catch {
      onMessage?.({
        type: "danger",
        text: `${item.type === 'task' ? 'タスク' : 'ボード'}の完全削除に失敗しました`,
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
      const boardCount = state.boards.filter(b => b.deletionState === "deleted").length;
      if (boardCount > 0) {
        // ボードの空にする機能を実装する必要がある場合
        // emptyBoardRecycleBin();
      }
    } catch {
      onMessage?.({
        type: "danger",
        text: "ゴミ箱を空にすることに失敗しました",
      });
    } finally {
      setEmptyingRecycleBin(false);
      setShowEmptyConfirm(false);
    }
  };

  // ソート可能ヘッダーコンポーネント
  const SortableHeader: React.FC<{
    field: SortField;
    children: React.ReactNode;
    align?: 'left' | 'center';
  }> = ({ field, children, align = 'left' }) => {
    const isActive = sortField === field;

    return (
      <button
        onClick={() => handleSort(field)}
        aria-label={`${children}でソート`}
        style={{
          width: '100%',
          justifyContent: align === 'center' ? 'center' : 'flex-start',
          fontWeight: 'bold',
          border: 0,
          padding: '8px',
          color: 'var(--fgColor-muted)',
          fontSize: '12px',
          background: 'none',
          appearance: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <Text sx={{ fontSize: 0, fontWeight: 'bold' }}>
          {children}
        </Text>
        <div style={{ opacity: isActive ? 1 : 0.3 }}>
          {isActive && sortDirection === 'asc' ? (
            <ChevronUpIcon size={12} />
          ) : (
            <ChevronDownIcon size={12} />
          )}
        </div>
      </button>
    );
  };

  const renderItemActions = (item: RecycleBinItemWithMeta) => {
    const isLoading =
      restoringItemId === item.id ||
      deletingItemId === item.id ||
      (item.type === 'task' && (restoringTaskId === item.id || deletingTaskId === item.id));

    if (isLoading) {
      return (
        <LoadingButton
          disabled
          isLoading
          loadingText={
            restoringItemId === item.id || restoringTaskId === item.id
              ? "復元中..."
              : "削除中..."
          }
          size="small"
        >
          処理中
        </LoadingButton>
      );
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
        <IconButton
          icon={EyeIcon}
          aria-label={`${item.type === 'board' ? 'ボード' : 'タスク'}「${item.title}」の詳細を表示`}
          size="small"
          variant="invisible"
          onClick={() => setShowDetailDialog(item.id)}
        />
        <IconButton
          icon={HistoryIcon}
          aria-label={`${item.type === 'board' ? 'ボード' : 'タスク'}「${item.title}」を復元`}
          size="small"
          variant="invisible"
          onClick={() => handleRestore(item)}
        />
        <IconButton
          icon={TrashIcon}
          aria-label={`${item.type === 'board' ? 'ボード' : 'タスク'}「${item.title}」を完全に削除`}
          size="small"
          variant="invisible"
          onClick={() => setShowDeleteConfirm(item.id)}
        />
      </div>
    );
  };

  const selectedItem = showDeleteConfirm
    ? allRecycleBinItems.find(item => item.id === showDeleteConfirm)
    : null;

  const detailItem = showDetailDialog
    ? allRecycleBinItems.find(item => item.id === showDetailDialog)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: "12px", paddingBottom: "16px" }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heading sx={{ fontSize: 2, fontWeight: 'bold' }}>
            ゴミ箱 ({allRecycleBinItems.length}件)
          </Heading>
        </div>
        <Button
          variant="danger"
          size="small"
          onClick={() => setShowEmptyConfirm(true)}
          disabled={emptyingRecycleBin || isEmptying || allRecycleBinItems.length === 0}
        >
          {emptyingRecycleBin || isEmptying ? (
            <>
              <Spinner size="small" sx={{ mr: 1 }} />
              削除中...
            </>
          ) : (
            "ゴミ箱を空にする"
          )}
        </Button>
      </div>

      {/* ゴミ箱一覧 */}
      {allRecycleBinItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          border: '1px dashed',
          borderColor: 'var(--borderColor-muted)',
          borderRadius: 'var(--borderRadius-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: "8px",
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text sx={{ color: 'fg.muted' }}>
            ゴミ箱にアイテムはありません
          </Text>
        </div>
      ) : (
        <div style={{
          border: '1px solid',
          borderColor: 'var(--borderColor-default)',
          borderRadius: "var(--borderRadius-medium)",
          overflow: 'hidden'
        }}>
          {/* テーブルヘッダー */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr 150px 100px',
            gap: "8px",
            padding: "8px",
            background: 'var(--bgColor-muted)',
            borderBottom: '1px solid',
            borderColor: 'var(--borderColor-default)',
            fontSize: "14px",
            fontWeight: 'bold',
            color: 'var(--fgColor-muted)'
          }}>
            <SortableHeader field="type">種別</SortableHeader>
            <SortableHeader field="title">タイトル</SortableHeader>
            <SortableHeader field="timeUntilDeletion" align="center">削除予定</SortableHeader>
            <Text sx={{ textAlign: 'center', fontSize: 0, p: 1 }}>操作</Text>
          </div>

          {/* テーブルボディ */}
          <div style={{ maxHeight: '500px', overflow: 'auto' }}>
            {allRecycleBinItems.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr 150px 100px',
                  gap: "8px",
                  padding: "12px 8px",
                  borderBottom: index === allRecycleBinItems.length - 1 ? 'none' : '1px solid',
                  borderColor: 'var(--borderColor-muted)',
                  alignItems: 'center'
                }}
              >
                {/* 種別 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {item.type === 'board' ? <ProjectIcon size={16} /> : <TasklistIcon size={16} />}
                  <Text
                    sx={{
                      fontSize: 0,
                      color: "fg.default",
                      px: 1,
                      py: 0.5,
                      bg: item.type === 'board' ? "attention.subtle" : "accent.subtle",
                      borderRadius: 1,
                    }}
                  >
                    {item.type === 'board' ? 'ボード' : 'タスク'}
                  </Text>
                </div>

                {/* タイトル */}
                <div style={{ minWidth: 0 }}>
                  <Text
                    sx={{
                      fontSize: 1,
                      fontWeight: "semibold",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.title}
                  </Text>
                </div>

                {/* 削除予定 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  {item.timeUntilDeletion ? (
                    <>
                      <ClockIcon size={14} />
                      <Text
                        sx={{
                          fontSize: 0,
                          color: recycleBinSettings.retentionDays === null ? 'fg.muted' : 'fg.default',
                          textAlign: 'center',
                        }}
                      >
                        {item.timeUntilDeletion}
                      </Text>
                    </>
                  ) : (
                    <Text sx={{ fontSize: 0, color: 'fg.muted', textAlign: 'center' }}>
                      未設定
                    </Text>
                  )}
                </div>

                {/* 操作 */}
                <div>
                  {renderItemActions(item)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ゴミ箱を空にする確認ダイアログ */}
      <ConfirmDialog
        isOpen={showEmptyConfirm}
        title="ゴミ箱を空にする"
        message={`ゴミ箱内の${allRecycleBinItems.length}件のアイテムをすべて完全削除します。この操作は取り消すことができません。本当に実行しますか？`}
        onConfirm={handleEmptyRecycleBin}
        onCancel={() => setShowEmptyConfirm(false)}
        confirmText="完全削除"
        cancelText="キャンセル"
      />

      {/* 個別完全削除の確認ダイアログ */}
      {selectedItem && (
        <ConfirmDialog
          isOpen={!!showDeleteConfirm}
          title={`${selectedItem.type === 'board' ? 'ボード' : 'タスク'}の完全削除`}
          message={`${selectedItem.type === 'board' ? 'ボード' : 'タスク'}「${selectedItem.title}」を完全に削除しますか？この操作は元に戻せません。`}
          onConfirm={() => handlePermanentDelete(selectedItem)}
          onCancel={() => setShowDeleteConfirm(null)}
          confirmText="完全に削除"
          cancelText="キャンセル"
        />
      )}

      {/* 詳細表示ダイアログ */}
      {detailItem && (
        <UnifiedDialog
          isOpen={!!showDetailDialog}
          onClose={() => setShowDetailDialog(null)}
          title={`${detailItem.type === 'board' ? 'ボード' : 'タスク'}詳細`}
          variant="modal"
          size="large"
        >
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* タイトル */}
            <div>
              <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>タイトル</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {detailItem.type === 'board' ? <ProjectIcon size={20} /> : <TasklistIcon size={20} />}
                <Text sx={{ fontSize: 2, fontWeight: 'semibold' }}>{detailItem.title}</Text>
                <Text
                  sx={{
                    fontSize: 0,
                    color: "fg.default",
                    px: 2,
                    py: 1,
                    bg: detailItem.type === 'board' ? "attention.subtle" : "accent.subtle",
                    borderRadius: 1,
                  }}
                >
                  {detailItem.type === 'board' ? 'ボード' : 'タスク'}
                </Text>
              </div>
            </div>

            {/* 説明文（タスクの場合） */}
            {detailItem.description && detailItem.type === 'task' && (
              <div>
                <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>説明</Text>
                <Text
                  sx={{
                    fontSize: 1,
                    color: 'fg.default',
                    p: 2,
                    bg: 'canvas.subtle',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'border.default'
                  }}
                >
                  {detailItem.description.replace(/<[^>]*>/g, "")}
                </Text>
              </div>
            )}

            {/* 元の場所・詳細情報 */}
            <div>
              <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>詳細情報</Text>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '12px',
                background: 'var(--bgColor-muted)',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: 'var(--borderColor-default)'
              }}>
                {detailItem.type === 'task' ? (
                  <>
                    <div>
                      <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>所属ボード</Text>
                      <Text sx={{ fontSize: 1, fontWeight: 'semibold' }}>{detailItem.boardTitle}</Text>
                    </div>
                    <div>
                      <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>所属カラム</Text>
                      <Text sx={{ fontSize: 1, fontWeight: 'semibold' }}>{detailItem.columnTitle}</Text>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>カラム数</Text>
                      <Text sx={{ fontSize: 1, fontWeight: 'semibold' }}>{detailItem.columnsCount}個</Text>
                    </div>
                    <div>
                      <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>タスク数</Text>
                      <Text sx={{ fontSize: 1, fontWeight: 'semibold' }}>{detailItem.taskCount}個</Text>
                    </div>
                  </>
                )}
                <div>
                  <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>削除日時</Text>
                  <Text sx={{ fontSize: 1 }}>
                    {new Date(detailItem.deletedAt || "").toLocaleString("ja-JP")}
                  </Text>
                </div>
                <div>
                  <Text sx={{ fontSize: 0, color: 'fg.muted', mb: 1 }}>削除予定</Text>
                  {detailItem.timeUntilDeletion ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ClockIcon size={16} />
                      <Text sx={{ fontSize: 1 }}>{detailItem.timeUntilDeletion}</Text>
                    </div>
                  ) : (
                    <Text sx={{ fontSize: 1, color: 'fg.muted' }}>自動削除なし</Text>
                  )}
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'var(--borderColor-default)', paddingTop: '16px' }}>
              <Button onClick={() => setShowDetailDialog(null)}>閉じる</Button>
              <Button
                variant="primary"
                leadingVisual={HistoryIcon}
                onClick={() => {
                  handleRestore(detailItem);
                  setShowDetailDialog(null);
                }}
              >
                復元
              </Button>
              <Button
                variant="danger"
                leadingVisual={TrashIcon}
                onClick={() => {
                  setShowDetailDialog(null);
                  setShowDeleteConfirm(detailItem.id);
                }}
              >
                完全に削除
              </Button>
            </div>
          </div>
        </UnifiedDialog>
      )}
    </div>
  );
};

export default UnifiedRecycleBinView;