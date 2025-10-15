import { Button, Text, Box, Spinner, ActionMenu, ActionList } from "@primer/react";
import {
  HistoryIcon,
  TrashIcon,
  KebabHorizontalIcon
} from "@primer/octicons-react";
import React, { useMemo, useState } from "react";

import { useBoard } from "../../contexts/BoardContext";
import { getRecycleBinBoards } from "../../utils/recycleBin";
import ConfirmDialog from "../ConfirmDialog";
import { LoadingButton } from "../shared/LoadingButton";
import type { DialogFlashMessageData } from "../shared/DialogFlashMessage";

interface BoardRecycleBinViewProps {
  onMessage?: (message: DialogFlashMessageData) => void;
}

const BoardRecycleBinView: React.FC<BoardRecycleBinViewProps> = ({
  onMessage,
}) => {
  const { state, restoreBoard, permanentlyDeleteBoard, emptyBoardRecycleBin } = useBoard();
  const [restoringBoardId, setRestoringBoardId] = useState<string | null>(null);
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [emptyingRecycleBin, setEmptyingRecycleBin] = useState(false);

  // 削除されたボードを取得
  const deletedBoards = useMemo(() => getRecycleBinBoards(state.boards), [state.boards]);

  /**
   * ボード復元の統一エラーハンドリング
   */
  const handleRestore = async (boardId: string) => {
    const board = deletedBoards.find(b => b.id === boardId);
    const boardTitle = board?.title || 'ボード';

    setRestoringBoardId(boardId);
    try {
      restoreBoard(boardId);
      onMessage?.({
        type: "success",
        text: `ボード「${boardTitle}」を復元しました`,
      });
    } catch (error) {
      console.error('Board restore failed:', error);
      onMessage?.({
        type: "danger",
        text: `ボード「${boardTitle}」の復元に失敗しました`,
      });
    } finally {
      setRestoringBoardId(null);
    }
  };

  /**
   * ボード完全削除の統一エラーハンドリング
   */
  const handlePermanentDelete = async (boardId: string) => {
    const board = deletedBoards.find(b => b.id === boardId);
    const boardTitle = board?.title || 'ボード';

    setDeletingBoardId(boardId);
    try {
      permanentlyDeleteBoard(boardId);
      onMessage?.({
        type: "success",
        text: `ボード「${boardTitle}」を完全に削除しました`,
      });
    } catch (error) {
      console.error('Board permanent delete failed:', error);
      onMessage?.({
        type: "danger",
        text: `ボード「${boardTitle}」の完全削除に失敗しました`,
      });
    } finally {
      setDeletingBoardId(null);
      setShowDeleteConfirm(null);
    }
  };

  /**
   * ゴミ箱を空にする処理の統一エラーハンドリング
   */
  const handleEmptyRecycleBin = async () => {
    const boardCount = deletedBoards.length;

    setEmptyingRecycleBin(true);
    try {
      emptyBoardRecycleBin();
      onMessage?.({
        type: "success",
        text: `${boardCount}件のボードを完全に削除しました`,
      });
    } catch (error) {
      console.error('Empty recycle bin failed:', error);
      onMessage?.({
        type: "danger",
        text: "ゴミ箱を空にすることに失敗しました",
      });
    } finally {
      setEmptyingRecycleBin(false);
      setShowEmptyConfirm(false);
    }
  };

  if (deletedBoards.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Text sx={{ color: "fg.muted", fontSize: 1 }}>
          ゴミ箱にボードはありません
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Text as="h3" sx={{ fontSize: 2, fontWeight: "semibold" }}>
          削除されたボード ({deletedBoards.length}件)
        </Text>
        <Button
          variant="danger"
          size="small"
          onClick={() => setShowEmptyConfirm(true)}
          disabled={emptyingRecycleBin || deletedBoards.length === 0}
        >
          {emptyingRecycleBin ? (
            <>
              <Spinner size="small" sx={{ mr: 1 }} />
              削除中...
            </>
          ) : (
            "ゴミ箱を空にする"
          )}
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {deletedBoards.map((board) => (
          <Box
            key={board.id}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "border.default",
              borderRadius: 2,
              bg: "canvas.subtle",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 3,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Text
                  as="h4"
                  sx={{
                    fontSize: 1,
                    fontWeight: "semibold",
                    mb: 1,
                    wordBreak: "break-word",
                  }}
                >
                  {board.title}
                </Text>
                <Text sx={{ fontSize: 0, color: "fg.muted" }}>
                  削除日時: {new Date(board.deletedAt || "").toLocaleString("ja-JP")}
                </Text>
                <Text sx={{ fontSize: 0, color: "fg.muted", mt: 1 }}>
                  カラム数: {board.columns.length}個
                </Text>
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexShrink: 0 }}>
                {(restoringBoardId === board.id || deletingBoardId === board.id) ? (
                  <LoadingButton
                    disabled
                    isLoading
                    loadingText={
                      restoringBoardId === board.id
                        ? "復元中..."
                        : "削除中..."
                    }
                  >
                    処理中
                  </LoadingButton>
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
                        <ActionList.Item onSelect={() => handleRestore(board.id)}>
                          <ActionList.LeadingVisual>
                            <HistoryIcon size={16} />
                          </ActionList.LeadingVisual>
                          復元
                        </ActionList.Item>
                        <ActionList.Divider />
                        <ActionList.Item
                          variant="danger"
                          onSelect={() => setShowDeleteConfirm(board.id)}
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
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      <ConfirmDialog
        isOpen={showEmptyConfirm}
        title="ボードゴミ箱を空にする"
        message={`ゴミ箱内の${deletedBoards.length}件のボードをすべて完全削除します。この操作は取り消すことができません。本当に実行しますか？`}
        onConfirm={handleEmptyRecycleBin}
        onCancel={() => setShowEmptyConfirm(false)}
        confirmText="完全削除"
        cancelText="キャンセル"
      />

      {/* 個別完全削除の確認ダイアログ */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={!!showDeleteConfirm}
          title="ボードの完全削除"
          message={`ボード「${deletedBoards.find(b => b.id === showDeleteConfirm)?.title || ''}」を完全に削除しますか？この操作は元に戻せません。`}
          onConfirm={() => handlePermanentDelete(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
          confirmText="完全に削除"
          cancelText="キャンセル"
        />
      )}
    </Box>
  );
};

export default BoardRecycleBinView;