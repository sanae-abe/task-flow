import React from "react";
import type { TableCellProps } from "../types";
import {
  renderActionsCell,
  renderEditCell,
  renderTitleCell,
  renderStatusCell,
  renderPriorityCell,
  renderDueDateCell,
  renderLabelsCell,
  renderSubTasksCell,
  renderFilesCell,
  renderProgressCell,
  renderCreatedAtCell,
  renderUpdatedAtCell,
  renderCompletedAtCell,
  renderDescriptionCell,
  renderRecurrenceCell,
  renderDefaultCell,
} from "../utils/tableCellRenderers";

/**
 * テーブルセルコンポーネント
 *
 * 指定されたカラムIDに応じて適切なセルコンテンツを描画します。
 * 各セルタイプに応じた専用の描画関数を呼び出します。
 */
export const TableCell: React.FC<TableCellProps> = ({
  task,
  columnId,
  currentBoard,
  onStatusChange,
  onDeleteClick,
  onEditClick,
}) => {
  switch (columnId) {
    case "actions":
      return renderActionsCell(task, onDeleteClick);

    case "edit":
      return renderEditCell(task, onEditClick);

    case "title":
      return renderTitleCell(task);

    case "status":
      return renderStatusCell(task, currentBoard, onStatusChange);

    case "priority":
      return renderPriorityCell(task);

    case "dueDate":
      return renderDueDateCell(task);

    case "labels":
      return renderLabelsCell(task);

    case "subTasks":
      return renderSubTasksCell(task);

    case "files":
      return renderFilesCell(task);

    case "progress":
      return renderProgressCell(task);

    case "createdAt":
      return renderCreatedAtCell(task);

    case "updatedAt":
      return renderUpdatedAtCell(task);

    case "completedAt":
      return renderCompletedAtCell(task);

    case "description":
      return renderDescriptionCell(task);

    case "recurrence":
      return renderRecurrenceCell(task);

    default:
      return renderDefaultCell();
  }
};
