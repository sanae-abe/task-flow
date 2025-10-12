import React from "react";
import type { TableRowProps } from "../types";
import { isTaskWithColumn } from "../utils/tableHelpers";
import { logger } from "../../../utils/logger";

/**
 * テーブル行コンポーネント
 *
 * 個別のタスク行を描画します。
 * ホバー効果とクリック処理を含みます。
 */
export const TableRow: React.FC<TableRowProps> = ({
  task,
  index,
  totalTasks,
  visibleColumns,
  gridTemplateColumns,
  onTaskClick,
  renderCell,
}) => {
  // 型ガードチェック
  if (!isTaskWithColumn(task)) {
    logger.warn("Task is missing required column properties:", task);
    return null;
  }

  return (
    <div
      key={task.id}
      style={{
        gridTemplateColumns,
        display: "grid",
        padding: "8px 12px",
        gap: "8px",
        alignItems: "center",
        borderBottom:
          index < totalTasks - 1
            ? "1px solid var(--borderColor-default)"
            : "none",
        cursor: "pointer",
        minWidth: "fit-content",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--bgColor-muted)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "";
      }}
      onClick={() => onTaskClick(task)}
    >
      {visibleColumns.map((column) => (
        <div key={column.id}>{renderCell(task, column.id)}</div>
      ))}
    </div>
  );
};
