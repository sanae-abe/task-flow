import { Button, Text, Box, Spinner } from "@primer/react";
import { HistoryIcon } from "@primer/octicons-react";
import React, { useMemo, useState } from "react";

import { useBoard } from "../../contexts/BoardContext";
import { getRecycleBinBoards } from "../../utils/recycleBin";
import ConfirmDialog from "../ConfirmDialog";
import type { DialogFlashMessageData } from "../shared/DialogFlashMessage";

interface BoardRecycleBinViewProps {
  onMessage?: (message: DialogFlashMessageData) => void;
}

const BoardRecycleBinView: React.FC<BoardRecycleBinViewProps> = ({
  onMessage,
}) => {
  const { state, restoreBoard, emptyBoardRecycleBin } = useBoard();
  const [restoringBoardId, setRestoringBoardId] = useState<string | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [emptyingRecycleBin, setEmptyingRecycleBin] = useState(false);

  // 削除されたボードを取得
  const deletedBoards = useMemo(() => getRecycleBinBoards(state.boards), [state.boards]);

  const handleRestore = async (boardId: string, boardTitle: string) => {
    setRestoringBoardId(boardId);
    try {
      restoreBoard(boardId);
      onMessage?.({
        type: "success",
        text: `ボード「${boardTitle}」を復元しました`,
      });
    } catch {
      onMessage?.({
        type: "danger",
        text: "ボードの復元に失敗しました",
      });
    } finally {
      setRestoringBoardId(null);
    }
  };

  const handleEmptyRecycleBin = async () => {
    setEmptyingRecycleBin(true);
    try {
      const deletedCount = deletedBoards.length;
      emptyBoardRecycleBin();
      onMessage?.({
        type: "success",
        text: `${deletedCount}件のボードを完全削除しました`,
      });
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
                <Button
                  variant="default"
                  size="small"
                  leadingVisual={HistoryIcon}
                  onClick={() => handleRestore(board.id, board.title)}
                  disabled={restoringBoardId === board.id}
                  aria-label={`ボード「${board.title}」を復元`}
                >
                  {restoringBoardId === board.id ? (
                    <>
                      <Spinner size="small" sx={{ mr: 1 }} />
                      復元中...
                    </>
                  ) : (
                    "復元"
                  )}
                </Button>
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
    </Box>
  );
};

export default BoardRecycleBinView;