import React from "react";

import type { Column } from "../types";

interface ColumnTitleProps {
  column: Column;
}

const ColumnTitle: React.FC<ColumnTitleProps> = ({ column }) => (
  <div className="flex flex-1 items-center justify-between gap-2 flex-shrink-0 w-full overflow-hidden">
    <h3 className="text-lg font-bold text-foreground flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap m-0">
      {column.title}
    </h3>
    <span className="flex-shrink-0 bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full text-xs font-medium">
      {column.tasks.length}
    </span>
  </div>
);

export default ColumnTitle;