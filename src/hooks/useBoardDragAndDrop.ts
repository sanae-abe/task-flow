import { useState } from "react";
import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import type { KanbanBoard } from "../types";

interface UseBoardDragAndDropProps {
  boards: KanbanBoard[];
  onReorderBoards: (boards: KanbanBoard[]) => void;
}

interface UseBoardDragAndDropReturn {
  sensors: ReturnType<typeof useSensors>;
  activeBoard: KanbanBoard | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export const useBoardDragAndDrop = ({
  boards,
  onReorderBoards,
}: UseBoardDragAndDropProps): UseBoardDragAndDropReturn => {
  const [activeBoard, setActiveBoard] = useState<KanbanBoard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent): void => {
    const { active } = event;
    const board = boards.find((board) => board.id === active.id);
    setActiveBoard(board || null);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    setActiveBoard(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = boards.findIndex((board) => board.id === active.id);
    const newIndex = boards.findIndex((board) => board.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedBoards = arrayMove(boards, oldIndex, newIndex);
      onReorderBoards(reorderedBoards);
    }
  };

  return {
    sensors,
    activeBoard,
    handleDragStart,
    handleDragEnd,
  };
};
