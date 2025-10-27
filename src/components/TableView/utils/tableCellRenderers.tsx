import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Trash2,
  Check,
  Paperclip,
  ChevronDown,
  RotateCcw,
  Edit,
} from "lucide-react";

import type { TaskWithColumn } from "../../../types/table";
import type { KanbanBoard } from "../../../types";
import { formatDate, getDateStatus } from "../../../utils/dateHelpers";
import { stripHtml } from "../../../utils/textHelpers";
import LabelChip from "../../LabelChip";
import StatusBadge from "../../shared/StatusBadge";
import SubTaskProgressBar from "../../SubTaskProgressBar";
import {
  getPriorityText,
  getCompletionRate,
  getDateColor,
} from "./tableHelpers";
import IconButton from "@/components/shared/IconButton";

/**
 * アクションセル（削除ボタン）の描画
 */
export const renderActionsCell = (
  task: TaskWithColumn,
  onDeleteClick: (task: TaskWithColumn) => void,
) => (
  <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
    <IconButton
      icon={Trash2}
      size="icon"
      ariaLabel="タスクを削除"
      onClick={() => onDeleteClick(task)}
      className="w-8 h-8 p-2 hover:bg-gray-200"
    />
  </div>
);

/**
 * 編集セル（編集ボタン）の描画
 */
export const renderEditCell = (
  task: TaskWithColumn,
  onEditClick: (task: TaskWithColumn) => void,
) => (
  <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
    <IconButton
      icon={Edit}
      size="icon"
      ariaLabel="タスクを編集"
      onClick={() => onEditClick(task)}
      className="w-8 h-8 p-2 hover:bg-gray-200"
    />
  </div>
);

/**
 * タイトルセルの描画
 */
export const renderTitleCell = (task: TaskWithColumn) => (
  <span
    className={`block overflow-hidden text-ellipsis whitespace-nowrap text-gray-900 text-sm ${
      task.completedAt ? "line-through" : ""
    }`}
  >
    {task.title}
  </span>
);

/**
 * ステータスセル（ドロップダウン）の描画
 */
export const renderStatusCell = (
  task: TaskWithColumn,
  currentBoard: KanbanBoard | null,
  onStatusChange: (task: TaskWithColumn, newColumnId: string) => void,
) => (
  <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto min-h-0 border-none"
        >
          <StatusBadge size="medium" variant="default" fontWeight="400">
            {task.status}
          </StatusBadge>
          <ChevronDown size={12} className="ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={task.columnId} onValueChange={(value) => onStatusChange(task, value)}>
          <DropdownMenuLabel>ステータス変更</DropdownMenuLabel>
          {currentBoard?.columns.map((column) => (
            <DropdownMenuRadioItem
              value={column.id}
              key={column.id}
            >
              {column.title}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

/**
 * 優先度セルの描画
 */
export const renderPriorityCell = (task: TaskWithColumn) => (
  <div>
    {task.priority ? (
      <span className="text-gray-900 text-sm">
        {getPriorityText(task.priority)}
      </span>
    ) : (
      <span className="text-gray-900 text-sm">-</span>
    )}
  </div>
);

/**
 * 期限セルの描画
 */
export const renderDueDateCell = (task: TaskWithColumn) => {
  if (!task.dueDate) {
    return (
      <div>
        <span className="text-gray-900 text-sm">-</span>
      </div>
    );
  }

  const dueDate = new Date(task.dueDate);
  const { isOverdue, isDueToday, isDueTomorrow } = getDateStatus(dueDate);
  const formattedDate = formatDate(task.dueDate, "MM/dd HH:mm");
  const dateColor = getDateColor(isOverdue, isDueToday, isDueTomorrow);

  // Convert Primer color to Tailwind classes
  const getColorClass = (color: string) => {
    if (color === "danger.fg") {
      return "text-red-600";
    }
    if (color === "attention.fg") {
      return "text-yellow-600";
    }
    if (color === "success.fg") {
      return "text-green-600";
    }
    return "text-gray-900";
  };

  return (
    <span
      className={`flex items-center gap-2 text-sm ${getColorClass(dateColor)}`}
    >
      {formattedDate}
    </span>
  );
};

/**
 * ラベルセルの描画
 */
export const renderLabelsCell = (task: TaskWithColumn) => (
  <div className="flex flex-wrap items-center gap-1">
    {task.labels?.slice(0, 2).map((label) => (
      <LabelChip key={label.id} label={label} />
    ))}
    {task.labels && task.labels.length > 2 && (
      <span className="text-xs text-gray-900 px-2 py-1 border border-gray-200 rounded">
        +{task.labels.length - 2}
      </span>
    )}
  </div>
);

/**
 * サブタスクセルの描画
 */
export const renderSubTasksCell = (task: TaskWithColumn) => (
  <div className="flex items-center gap-1">
    {task.subTasks && task.subTasks.length > 0 ? (
      <>
        <Check size={12} />
        <span className="text-sm text-gray-900">
          {task.subTasks.filter((sub) => sub.completed).length}/
          {task.subTasks.length}
        </span>
      </>
    ) : (
      <span className="text-gray-900 text-sm">-</span>
    )}
  </div>
);

/**
 * ファイルセルの描画
 */
export const renderFilesCell = (task: TaskWithColumn) => (
  <div className="flex items-center gap-1">
    {task.files && task.files.length > 0 ? (
      <>
        <Paperclip size={12} />
        <span className="text-sm text-gray-900">
          {task.files.length}
        </span>
      </>
    ) : (
      <span className="text-gray-900 text-sm">-</span>
    )}
  </div>
);

/**
 * 進捗セルの描画
 */
export const renderProgressCell = (task: TaskWithColumn) => (
  <div>
    {task.subTasks && task.subTasks.length > 0 ? (
      <div className="flex items-center gap-2">
        <SubTaskProgressBar
          completedCount={task.subTasks.filter((sub) => sub.completed).length}
          totalCount={task.subTasks.length}
        />
        <span className="text-sm text-gray-900">
          {getCompletionRate(task)}%
        </span>
      </div>
    ) : (
      <span className="text-gray-900 text-sm">-</span>
    )}
  </div>
);

/**
 * 作成日セルの描画
 */
export const renderCreatedAtCell = (task: TaskWithColumn) => (
  <span className="text-sm text-gray-900">
    {formatDate(task.createdAt, "MM/dd HH:mm")}
  </span>
);

/**
 * 更新日セルの描画
 */
export const renderUpdatedAtCell = (task: TaskWithColumn) => (
  <span className="text-sm text-gray-900">
    {formatDate(task.updatedAt, "MM/dd HH:mm")}
  </span>
);

/**
 * 完了日セルの描画
 */
export const renderCompletedAtCell = (task: TaskWithColumn) => (
  <div>
    {task.completedAt ? (
      <span className="text-sm text-gray-900">
        {formatDate(task.completedAt, "MM/dd HH:mm")}
      </span>
    ) : (
      <span className="text-gray-900 text-sm">-</span>
    )}
  </div>
);

/**
 * 説明セルの描画
 */
export const renderDescriptionCell = (task: TaskWithColumn) => (
  <div>
    {task.description ? (
      <span
        className="block text-xs text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap max-w-[580px]"
        title={stripHtml(task.description)}
      >
        {stripHtml(task.description)}
      </span>
    ) : (
      <span className="text-gray-900 text-xs">-</span>
    )}
  </div>
);

/**
 * 繰り返しセルの描画
 */
export const renderRecurrenceCell = (task: TaskWithColumn) => (
  <div
    style={{
      color: "var(--foreground)",
    }}
    className="flex items-center gap-1"
  >
    {task.recurrence?.enabled ? (
      <>
        <RotateCcw size={12} />
        <span className="text-sm">
          {task.recurrence.pattern === "daily" && "毎日"}
          {task.recurrence.pattern === "weekly" && "毎週"}
          {task.recurrence.pattern === "monthly" && "毎月"}
          {task.recurrence.pattern === "yearly" && "毎年"}
        </span>
      </>
    ) : (
      <span className="text-gray-900 text-sm">-</span>
    )}
  </div>
);

/**
 * デフォルトセルの描画
 */
export const renderDefaultCell = () => (
  <span className="text-sm text-gray-900">-</span>
);
