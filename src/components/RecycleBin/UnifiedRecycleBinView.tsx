import React, { useMemo, useState } from "react";
import {
  Button,
  Text,
  Spinner,
  Heading,
} from "@primer/react";
import {
  ProjectIcon,
  TasklistIcon,
  ColumnsIcon,
  ClockIcon,
} from "@primer/octicons-react";

import { useBoard } from "../../contexts/BoardContext";
import { getAllRecycleBinItems } from "../../utils/recycleBin";
import { useRecycleBinSettingsReadOnly } from "../../hooks/useRecycleBinSettings";
import { useRecycleBinOperations } from "../../hooks/useRecycleBinOperations";
import { useRecycleBinSort } from "../../hooks/useRecycleBinSort";
import ConfirmDialog from "../ConfirmDialog";
import { SortableHeader } from "./components/SortableHeader";
import { RecycleBinItemActions } from "./components/RecycleBinItemActions";
import { RecycleBinItemDetailDialog } from "./components/RecycleBinItemDetailDialog";
import type { DialogFlashMessageData } from "../shared/DialogFlashMessage";
import type { RecycleBinItemWithMeta } from "../../types/recycleBin";

interface UnifiedRecycleBinViewProps {
  onMessage?: (message: DialogFlashMessageData) => void;
}

const UnifiedRecycleBinView: React.FC<UnifiedRecycleBinViewProps> = ({
  onMessage,
}) => {
  const {
    state,
    restoreBoard,
    permanentlyDeleteBoard,
    restoreColumn,
    permanentlyDeleteColumn
  } = useBoard();
  const [restoringItemId, setRestoringItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
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
      const itemTypeText = item.type === 'task' ? 'タスク' : item.type === 'board' ? 'ボード' : 'カラム';
      onMessage?.({
        type: "danger",
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
      const itemTypeText = item.type === 'task' ? 'タスク' : item.type === 'board' ? 'ボード' : 'カラム';
      onMessage?.({
        type: "danger",
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

  const getItemLoadingState = (item: RecycleBinItemWithMeta) => {
    const isLoading =
      restoringItemId === item.id ||
      deletingItemId === item.id ||
      (item.type === 'task' && (restoringTaskId === item.id || deletingTaskId === item.id));

    const loadingText =
      restoringItemId === item.id || restoringTaskId === item.id
        ? "復元中..."
        : "削除中...";

    return { isLoading, loadingText };
  };

  const selectedItem = showDeleteConfirm
    ? allRecycleBinItems.find(item => item.id === showDeleteConfirm)
    : null;

  const detailItem = showDetailDialog
    ? allRecycleBinItems.find(item => item.id === showDetailDialog) ?? null
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
            <SortableHeader
              field="type"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              種別
            </SortableHeader>
            <SortableHeader
              field="title"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              タイトル
            </SortableHeader>
            <SortableHeader
              field="timeUntilDeletion"
              align="center"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              削除予定
            </SortableHeader>
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
                  {item.type === 'board' ? (
                    <ProjectIcon size={16} />
                  ) : item.type === 'column' ? (
                    <ColumnsIcon size={16} />
                  ) : (
                    <TasklistIcon size={16} />
                  )}
                  <Text
                    sx={{
                      fontSize: 0,
                      color: "fg.default",
                      px: 1,
                      py: 0.5,
                      bg: item.type === 'board' ? "attention.subtle" : item.type === 'column' ? "success.subtle" : "accent.subtle",
                      borderRadius: 1,
                    }}
                  >
                    {item.type === 'board' ? 'ボード' : item.type === 'column' ? 'カラム' : 'タスク'}
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
                  <RecycleBinItemActions
                    item={item}
                    isLoading={getItemLoadingState(item).isLoading}
                    loadingText={getItemLoadingState(item).loadingText}
                    onRestore={handleRestore}
                    onDelete={(item) => setShowDeleteConfirm(item.id)}
                    onShowDetail={(item) => setShowDetailDialog(item.id)}
                  />
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
          title={`${selectedItem.type === 'board' ? 'ボード' : selectedItem.type === 'column' ? 'カラム' : 'タスク'}の完全削除`}
          message={`${selectedItem.type === 'board' ? 'ボード' : selectedItem.type === 'column' ? 'カラム' : 'タスク'}「${selectedItem.title}」を完全に削除しますか？この操作は元に戻せません。`}
          onConfirm={() => handlePermanentDelete(selectedItem)}
          onCancel={() => setShowDeleteConfirm(null)}
          confirmText="完全に削除"
          cancelText="キャンセル"
        />
      )}

      {/* 詳細表示ダイアログ */}
      <RecycleBinItemDetailDialog
        item={detailItem}
        isOpen={!!showDetailDialog}
        onClose={() => setShowDetailDialog(null)}
        onRestore={handleRestore}
        onDelete={(item) => setShowDeleteConfirm(item.id)}
      />
    </div>
  );
};

export default UnifiedRecycleBinView;