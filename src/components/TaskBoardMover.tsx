import React, { useState, useCallback, useMemo } from "react";
import { ActionList, ActionMenu, Text } from "@primer/react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ProjectIcon } from "@primer/octicons-react";
import { useBoard } from "../contexts/BoardContext";

interface TaskBoardMoverProps {
  onMoveTask: (targetBoardId: string) => void;
  disabled?: boolean;
}

export const TaskBoardMover: React.FC<TaskBoardMoverProps> = ({
  onMoveTask,
  disabled = false,
}) => {
  const { state, currentBoard } = useBoard();
  const [isOpen, setIsOpen] = useState(false);

  // 現在のボード以外のボード（削除されたボードを除く）を取得
  const availableBoards = useMemo(
    () => state.boards.filter((board) =>
      board.id !== currentBoard?.id && board.deletionState !== 'deleted'
    ),
    [state.boards, currentBoard?.id],
  );

  const handleBoardSelect = useCallback(
    (boardId: string) => {
      onMoveTask(boardId);
      setIsOpen(false);
    },
    [onMoveTask],
  );

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // 移動可能なボードがない場合は表示しない
  if (availableBoards.length === 0) {
    return null;
  }

  return (
    <ActionMenu open={isOpen} onOpenChange={setIsOpen}>
      <ActionMenu.Anchor>
        <Button
          variant="default"
          size="default"
          disabled={disabled}
          onClick={handleToggle}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <ArrowRightIcon size={16} />
          移動
        </Button>
      </ActionMenu.Anchor>

      <ActionMenu.Overlay>
        <ActionList>
          <ActionList.Group title="移動先のボードを選択">
            {availableBoards.map((board) => (
              <ActionList.Item
                key={board.id}
                onSelect={() => handleBoardSelect(board.id)}
              >
                <ActionList.LeadingVisual>
                  <ProjectIcon size={16} />
                </ActionList.LeadingVisual>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>{board.title}</Text>
                  <Text
                    style={{ fontSize: "12px", color: "var(--fgColor-muted)" }}
                  >
                    {board.columns.length} カラム・
                    {board.columns.reduce(
                      (sum, col) => sum + col.tasks.length,
                      0,
                    )}{" "}
                    タスク
                  </Text>
                </div>
              </ActionList.Item>
            ))}
          </ActionList.Group>

          {currentBoard && (
            <ActionList.Group title="現在のボード">
              <ActionList.Item disabled>
                <ActionList.LeadingVisual>
                  <ProjectIcon size={16} />
                </ActionList.LeadingVisual>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>
                    {currentBoard.title}
                  </Text>
                  <Text
                    style={{ fontSize: "12px", color: "var(--fgColor-muted)" }}
                  >
                    現在のボード
                  </Text>
                </div>
              </ActionList.Item>
            </ActionList.Group>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
};

export default TaskBoardMover;
