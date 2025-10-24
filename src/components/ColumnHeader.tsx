import React from "react";

import type { Column } from "../types";

import ColumnActions from "./ColumnActions";
import ColumnTitle from "./ColumnTitle";

interface ColumnHeaderProps {
  column: Column;
  onTitleEdit: () => void;
  onDeleteColumn: () => void;
  onAddTask: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  column,
  onTitleEdit,
  onDeleteColumn,
  onAddTask,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
}) => (
  <div className="flex justify-between items-center pb-3 w-full overflow-hidden">
    <ColumnTitle column={column} />
    <ColumnActions
      onAddTask={onAddTask}
      onTitleEdit={onTitleEdit}
      onDeleteColumn={onDeleteColumn}
      onMoveLeft={onMoveLeft}
      onMoveRight={onMoveRight}
      canMoveLeft={canMoveLeft}
      canMoveRight={canMoveRight}
    />
  </div>
);

export default ColumnHeader;
