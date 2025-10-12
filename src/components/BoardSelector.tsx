import { Button, Box, Text } from "@primer/react";
import React, { memo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useBoard } from "../contexts/BoardContext";
import { useBoardDragAndDrop } from "../hooks/useBoardDragAndDrop";
import type { KanbanBoard } from "../types";

// スタイル定義
const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    fontSize: "14px",
    minWidth: 0,
    width: "100%",
    height: "100%",
    overflowX: "auto",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    maskImage:
      "linear-gradient(to right, black 0%, black calc(100% - 12px), transparent 100%)",
    paddingRight: "4px",
  },
  emptyState: {
    display: "flex",
    alignItems: "center",
  },
  emptyText: {
    color: "fg.muted",
    fontSize: "14px",
  },
  tabContainer: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    transition: "transform 200ms ease",
  },
  draggingTab: {
    opacity: 0.5,
    transform: "rotate(5deg)",
    zIndex: 1000,
  },
  selectedTab: {
    paddingInline: 0,
    paddingBlock: "12px",
    borderBottom: "2px solid",
    borderBottomColor: "accent.emphasis",
  },
  unselectedTab: {
    paddingInline: 0,
    paddingBlock: "12px",
    borderBottom: "none",
  },
  tabButton: {
    fontSize: "14px",
    borderRadius: "6px",
    paddingInline: "4px",
    paddingBlock: 0,
    whiteSpace: "nowrap",
    translate: "0 2px",
    flexShrink: 0,
    cursor: "grab",
    "&:hover": {
      backgroundColor: "canvas.subtle",
      color: "fg.default",
    },
    "&:active": {
      cursor: "grabbing",
    },
  },
  selectedButton: {
    fontWeight: "600",
    color: "fg.default",
  },
  unselectedButton: {
    fontWeight: "400",
    color: "fg.muted",
  },
  overlayButton: {
    fontSize: "14px",
    borderRadius: "6px",
    paddingInline: "4px",
    paddingBlock: 0,
    whiteSpace: "nowrap",
    flexShrink: 0,
    fontWeight: "600",
    color: "fg.default",
    backgroundColor: "canvas.default",
    border: "1px solid",
    borderColor: "border.default",
    boxShadow: "shadow.medium",
  },
} as const;

// 空状態表示コンポーネント
const EmptyBoardsMessage: React.FC = memo(() => (
  <div style={styles.emptyState}>
    <Text sx={styles.emptyText}>利用可能なボードがありません</Text>
  </div>
));

// ソート可能なボードタブコンポーネント
interface SortableBoardTabProps {
  board: KanbanBoard;
  isSelected: boolean;
  onSelect: (boardId: string) => void;
}

const SortableBoardTab: React.FC<SortableBoardTabProps> = memo(
  ({ board, isSelected, onSelect }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: board.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const tabStyles = {
      ...styles.tabContainer,
      ...(isSelected ? styles.selectedTab : styles.unselectedTab),
      ...(isDragging ? styles.draggingTab : {}),
    };

    const buttonStyles = {
      ...styles.tabButton,
      ...(isSelected ? styles.selectedButton : styles.unselectedButton),
    };

    return (
      <Box
        ref={setNodeRef}
        style={style}
        sx={tabStyles}
        aria-selected={isSelected}
        {...attributes}
        {...listeners}
      >
        <Button
          variant="invisible"
          size="medium"
          onClick={() => onSelect(board.id)}
          sx={buttonStyles}
          aria-label={`${board.title}ボードを選択`}
        >
          {board.title}
        </Button>
      </Box>
    );
  },
);

// ドラッグオーバーレイ用ボードタブ
interface DragOverlayBoardTabProps {
  board: KanbanBoard;
}

const DragOverlayBoardTab: React.FC<DragOverlayBoardTabProps> = memo(
  ({ board }) => (
    <div
      style={{
        ...styles.tabContainer,
        ...styles.selectedTab,
      }}
    >
      <Button variant="invisible" size="medium" sx={styles.overlayButton}>
        {board.title}
      </Button>
    </div>
  ),
);

// メインコンポーネント
const BoardSelector: React.FC = () => {
  const { state, setCurrentBoard, reorderBoards } = useBoard();

  const { sensors, activeBoard, handleDragStart, handleDragEnd } =
    useBoardDragAndDrop({
      boards: state.boards,
      onReorderBoards: reorderBoards,
    });

  if (state.boards.length === 0) {
    return <EmptyBoardsMessage />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={state.boards.map((board) => board.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div style={styles.container} role="tablist" aria-label="ボード選択">
          {state.boards.map((board) => (
            <SortableBoardTab
              key={board.id}
              board={board}
              isSelected={state.currentBoard?.id === board.id}
              onSelect={setCurrentBoard}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: "0.5",
              },
            },
          }),
        }}
      >
        {activeBoard ? <DragOverlayBoardTab board={activeBoard} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default BoardSelector;
