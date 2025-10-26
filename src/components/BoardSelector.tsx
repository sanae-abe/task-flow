import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

import { useBoard } from "../contexts/BoardContext";
import { useBoardDragAndDrop } from "../hooks/useBoardDragAndDrop";
import type { KanbanBoard } from "../types";


// 空状態表示コンポーネント
const EmptyBoardsMessage: React.FC = memo(() => (
  <div className="flex items-center">
    <p className="text-gray-600 text-sm">利用可能なボードがありません</p>
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

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "h-full flex items-center transition-transform duration-200",
          isSelected
            ? "py-3 border-b-2 border-blue-600"
            : "py-3 border-b-0",
          isDragging && "opacity-50 rotate-[5deg] z-[900]"
        )}
        aria-selected={isSelected}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...attributes}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...listeners}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelect(board.id)}
          className={cn(
            "text-sm rounded-md px-1 py-0 whitespace-nowrap translate-y-0.5 flex-shrink-0 cursor-grab hover:bg-gray-100 hover:text-gray-900 active:cursor-grabbing",
            isSelected ? "font-semibold text-gray-900" : "font-normal text-gray-600"
          )}
          aria-label={`${board.title}ボードを選択`}
        >
          {board.title}
        </Button>
      </div>
    );
  },
);

// ドラッグオーバーレイ用ボードタブ
interface DragOverlayBoardTabProps {
  board: KanbanBoard;
}

const DragOverlayBoardTab: React.FC<DragOverlayBoardTabProps> = memo(
  ({ board }) => (
    <div className="h-full flex items-center py-3 border-b-2 border-blue-600">
      <Button
        variant="ghost"
        size="sm"
        className="text-sm rounded-md px-1 py-0 whitespace-nowrap flex-shrink-0 font-semibold text-gray-900 bg-white border border-gray-300 shadow-md"
      >
        {board.title}
      </Button>
    </div>
  ),
);

// メインコンポーネント
const BoardSelector: React.FC = () => {
  const { state, setCurrentBoard, reorderBoards } = useBoard();

  // アクティブなボードのみをフィルタリング
  const activeBoards = state.boards.filter(board => board.deletionState !== "deleted");

  const { sensors, activeBoard, handleDragStart, handleDragEnd } =
    useBoardDragAndDrop({
      boards: activeBoards,
      onReorderBoards: reorderBoards,
    });

  if (activeBoards.length === 0) {
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
        items={activeBoards.map((board) => board.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div
          className="flex items-center gap-4 text-sm min-w-0 w-full h-full overflow-x-auto scrollbar-none pr-1"
          style={{
            maskImage: "linear-gradient(to right, black 0%, black calc(100% - 12px), transparent 100%)"
          }}
          role="tablist"
          aria-label="ボード選択"
        >
          {activeBoards.map((board) => (
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
