import React from "react";

import type { Column } from "../types";

interface ColumnTitleProps {
  column: Column;
}

const ColumnTitle: React.FC<ColumnTitleProps> = ({ column }) => {
  // 削除されていないタスクのみをカウント（ゴミ箱のタスクは除外）
  const activeTasksCount = column.tasks.filter(
    task => task.deletionState !== 'deleted'
  ).length;

  return (
    <div className="flex flex-1 items-center justify-between gap-2 shrink-0 w-full overflow-hidden mr-1">
      <h3 className="text-md font-bold text-foreground flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap m-0">
        {column.title}
      </h3>
      <span className="shrink-0 bg-neutral-200 px-2 py-1 rounded-full text-xs">
        {activeTasksCount}
      </span>
    </div>
  );
};

export default ColumnTitle;