import React, { useMemo, useCallback, useState } from "react";
import {
  Text,
  Box,
  IconButton,
  ActionMenu,
  ActionList,
  Button,
  CounterLabel,
} from "@primer/react";
import {
  XIcon,
  CheckIcon,
  PaperclipIcon,
  TriangleDownIcon,
  SyncIcon,
} from "@primer/octicons-react";

import { useKanban } from "../contexts/KanbanContext";
import { useTableColumns } from "../contexts/TableColumnsContext";
import type { Task, Priority } from "../types";
import type { TaskWithColumn, TableColumn } from "../types/table";
import { sortTasks } from "../utils/taskSort";
import { filterTasks } from "../utils/taskFilter";
import { formatDate, getDateStatus } from "../utils/dateHelpers";
import { stripHtml } from "../utils/textHelpers";
import LabelChip from "./LabelChip";
import StatusBadge from "./shared/StatusBadge";
import SubTaskProgressBar from "./SubTaskProgressBar";
import TableColumnManager from "./TableColumnManager";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { logger } from "../utils/logger";

// 型ガード関数
const isTaskWithColumn = (task: Task): task is TaskWithColumn =>
  "columnId" in task && "columnTitle" in task && "status" in task;

// 優先度を日本語テキストに変換
const getPriorityText = (priority: Priority): string => {
  switch (priority) {
    case "low":
      return "低";
    case "medium":
      return "中";
    case "high":
      return "高";
    case "critical":
      return "緊急";
    default:
      return "";
  }
};

const TableView: React.FC = () => {
  const { state, moveTask, deleteTask, setTaskFilter, openTaskDetail } =
    useKanban();
  const tableColumnsData = useTableColumns();
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    task: TaskWithColumn | null;
  }>({ isOpen: false, task: null });

  const currentBoard = state.currentBoard;

  const allTasks = useMemo(() => {
    if (!currentBoard) {
      return [];
    }

    return currentBoard.columns.flatMap((column) =>
      column.tasks.map(
        (task) =>
          ({
            ...task,
            columnId: column.id,
            columnTitle: column.title,
            status: column.title,
          }) as TaskWithColumn,
      ),
    );
  }, [currentBoard]);

  const filteredAndSortedTasks = useMemo(() => {
    let tasks = filterTasks(allTasks, state.taskFilter);
    tasks = sortTasks(tasks, state.sortOption);
    return tasks;
  }, [allTasks, state.taskFilter, state.sortOption]);

  const handleTaskClick = useCallback(
    (task: Task) => {
      openTaskDetail(task.id);
    },
    [openTaskDetail],
  );

  const handleStatusChange = useCallback(
    (task: TaskWithColumn, newColumnId: string) => {
      if (task.columnId === newColumnId) {
        return;
      }

      const targetColumn = currentBoard?.columns.find(
        (col) => col.id === newColumnId,
      );
      if (targetColumn) {
        moveTask(
          task.id,
          task.columnId,
          newColumnId,
          targetColumn.tasks.length,
        );
      }
    },
    [currentBoard, moveTask],
  );

  const handleTaskDeleteClick = useCallback((task: TaskWithColumn) => {
    setDeleteConfirmDialog({ isOpen: true, task });
  }, []);

  const handleTaskDelete = useCallback(() => {
    if (deleteConfirmDialog.task) {
      deleteTask(
        deleteConfirmDialog.task.id,
        deleteConfirmDialog.task.columnId,
      );
    }
  }, [deleteTask, deleteConfirmDialog.task]);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteConfirmDialog({ isOpen: false, task: null });
  }, []);

  const getCompletionRate = useCallback((task: Task): number => {
    if (!task.subTasks || task.subTasks.length === 0) {
      return 0;
    }
    const completed = task.subTasks.filter((sub) => sub.completed).length;
    return Math.round((completed / task.subTasks.length) * 100);
  }, []);

  const renderCell = useCallback(
    (task: TaskWithColumn, columnId: string) => {
      switch (columnId) {
        case "actions":
          return (
            <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <IconButton
                aria-label="タスクを削除"
                variant="invisible"
                icon={XIcon}
                size="small"
                onClick={() => handleTaskDeleteClick(task)}
                sx={{
                  "&:hover": {
                    bg: "transparent",
                    color: "danger.fg",
                  },
                }}
              />
            </div>
          );

        case "title":
          return (
            <Text
              sx={{
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontWeight: "semibold",
                color: task.completedAt ? "fg.default" : "fg.default",
                textDecoration: task.completedAt ? "line-through" : "none",
                fontSize: 1,
              }}
            >
              {task.title}
            </Text>
          );

        case "status":
          return (
            <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <ActionMenu>
                <ActionMenu.Anchor>
                  <Button
                    variant="invisible"
                    size="small"
                    trailingVisual={TriangleDownIcon}
                    sx={{
                      padding: 0,
                      minHeight: "auto",
                      border: "none",
                      "&:hover": {
                        bg: "transparent",
                      },
                    }}
                  >
                    <StatusBadge
                      size="medium"
                      variant="default"
                      fontWeight="400"
                    >
                      {task.status}
                    </StatusBadge>
                  </Button>
                </ActionMenu.Anchor>
                <ActionMenu.Overlay>
                  <ActionList selectionVariant="single">
                    <ActionList.Group
                      title="ステータス変更"
                      selectionVariant="single"
                    >
                      {currentBoard?.columns.map((column) => (
                        <ActionList.Item
                          key={column.id}
                          onSelect={() => handleStatusChange(task, column.id)}
                          selected={task.columnId === column.id}
                        >
                          {column.title}
                        </ActionList.Item>
                      ))}
                    </ActionList.Group>
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            </Box>
          );

        case "priority":
          return (
            <div>
              {task.priority ? (
                <Text sx={{ color: "fg.default", fontSize: 1 }}>
                  {getPriorityText(task.priority)}
                </Text>
              ) : (
                <Text sx={{ color: "fg.default", fontSize: 1 }}>-</Text>
              )}
            </div>
          );

        case "dueDate": {
          if (!task.dueDate) {
            return (
              <div>
                <Text sx={{ color: "fg.default", fontSize: 1 }}>-</Text>
              </div>
            );
          }

          const dueDate = new Date(task.dueDate);
          const { isOverdue, isDueToday, isDueTomorrow } =
            getDateStatus(dueDate);
          const formattedDate = formatDate(task.dueDate, "MM/dd HH:mm");

          const getDateColor = () => {
            if (isOverdue) {
              return "danger.emphasis";
            }
            if (isDueToday) {
              return "attention.emphasis";
            }
            if (isDueTomorrow) {
              return "accent.emphasis";
            }
            return "fg.default";
          };

          return (
            <Text
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: 1,
                color: getDateColor(),
              }}
            >
              {formattedDate}
              {task.recurrence?.enabled && <SyncIcon size={12} />}
            </Text>
          );
        }

        case "labels":
          return (
            <div
              style={{
                display: "flex",
                gap: '4px',
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {task.labels?.slice(0, 2).map((label) => (
                <LabelChip key={label.id} label={label} />
              ))}
              {task.labels && task.labels.length > 2 && (
                <Text
                  sx={{
                    fontSize: 0,
                    color: "fg.default",
                    px: 2,
                    py: 1,
                    border: "1px solid",
                    borderColor: "border.default",
                    borderRadius: 2,
                  }}
                >
                  +{task.labels.length - 2}
                </Text>
              )}
            </div>
          );

        case "subTasks":
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {task.subTasks && task.subTasks.length > 0 ? (
                <>
                  <CheckIcon size={12} />
                  <Text sx={{ fontSize: 1, color: "fg.default" }}>
                    {task.subTasks.filter((sub) => sub.completed).length}/
                    {task.subTasks.length}
                  </Text>
                </>
              ) : (
                <Text sx={{ color: "fg.default", fontSize: 1 }}>-</Text>
              )}
            </div>
          );

        case "files":
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {task.files && task.files.length > 0 ? (
                <>
                  <PaperclipIcon size={12} />
                  <Text sx={{ fontSize: 1, color: "fg.default" }}>
                    {task.files.length}
                  </Text>
                </>
              ) : (
                <Text sx={{ color: "fg.default", fontSize: 1 }}>-</Text>
              )}
            </div>
          );

        case "progress":
          return (
            <div>
              {task.subTasks && task.subTasks.length > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: '8px' }}>
                  <SubTaskProgressBar
                    completedCount={
                      task.subTasks.filter((sub) => sub.completed).length
                    }
                    totalCount={task.subTasks.length}
                  />
                  <Text sx={{ fontSize: 1, color: "fg.default" }}>
                    {getCompletionRate(task)}%
                  </Text>
                </div>
              ) : (
                <Text sx={{ color: "fg.default", fontSize: 1 }}>-</Text>
              )}
            </div>
          );

        case "createdAt":
          return (
            <Text sx={{ fontSize: 1, color: "fg.default" }}>
              {formatDate(task.createdAt, "MM/dd HH:mm")}
            </Text>
          );

        case "updatedAt":
          return (
            <Text sx={{ fontSize: 1, color: "fg.default" }}>
              {formatDate(task.updatedAt, "MM/dd HH:mm")}
            </Text>
          );

        case "completedAt":
          return (
            <div>
              {task.completedAt ? (
                <Text sx={{ fontSize: 1, color: "fg.default" }}>
                  {formatDate(task.completedAt, "MM/dd HH:mm")}
                </Text>
              ) : (
                <Text sx={{ color: "fg.default", fontSize: 1 }}>-</Text>
              )}
            </div>
          );

        case "description":
          return (
            <div>
              {task.description ? (
                <Text
                  sx={{
                    display: "block",
                    fontSize: 0,
                    color: "fg.default",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "580px",
                  }}
                  title={stripHtml(task.description)}
                >
                  {stripHtml(task.description)}
                </Text>
              ) : (
                <Text sx={{ color: "fg.default", fontSize: 0 }}>-</Text>
              )}
            </div>
          );

        case "recurrence":
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "var(--fgColor-default)",
              }}
            >
              {task.recurrence?.enabled ? (
                <>
                  <SyncIcon size={12} />
                  <Text sx={{ fontSize: 1 }}>
                    {task.recurrence.pattern === "daily" && "毎日"}
                    {task.recurrence.pattern === "weekly" && "毎週"}
                    {task.recurrence.pattern === "monthly" && "毎月"}
                    {task.recurrence.pattern === "yearly" && "毎年"}
                  </Text>
                </>
              ) : (
                <Text sx={{ color: "fg.default", fontSize: 1 }}>-</Text>
              )}
            </div>
          );

        default:
          return <Text sx={{ fontSize: 1, color: "fg.default" }}>-</Text>;
      }
    },
    [
      currentBoard,
      handleStatusChange,
      handleTaskDeleteClick,
      getCompletionRate,
    ],
  );

  if (!currentBoard) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 120px)",
          color: "var(--fgColor-default)",
        }}
      >
        <Text>ボードを選択してください</Text>
      </div>
    );
  }

  return (
    <div
      key={`tableview-${tableColumnsData.forceRender}`}
      style={{
        height: "calc(100vh - 120px)",
        overflow: "auto",
        background: "var(--bgColor-canvas-subtle)",
        padding: "32px",
      }}
    >
      {/* テーブル */}
      <div
        key={`table-${tableColumnsData.forceRender}`}
        style={{
          borderRadius: '8px',
          overflow: "auto",
          background: "var(--bgColor-default)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          minWidth: "fit-content",
        }}
      >
        {/* ヘッダー行 */}
        <Box
          style={{ gridTemplateColumns: tableColumnsData.gridTemplateColumns }}
          sx={{
            display: "grid",
            bg: "var(--bgColor-default)",
            borderBottom: "1px solid",
            borderColor: "border.default",
            boxShadow: "0 0 2px rgba(0,0,0,0.05)",
            py: 2,
            px: 3,
            gap: 2,
            minWidth: "fit-content",
            position: "relative",
          }}
        >
          {tableColumnsData.visibleColumns.map((column: TableColumn) => (
            <div
              key={column.id}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <Text sx={{ fontWeight: "bold", fontSize: 1 }}>
                {column.label}
              </Text>
              {column.id === "title" && (
                <CounterLabel sx={{ ml: 1, flexShrink: 0 }}>
                  {filteredAndSortedTasks.length}
                </CounterLabel>
              )}
            </div>
          ))}
          {/* 設定ボタンを固定位置に配置 */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "12px",
              transform: "translateY(-50%)",
            }}
          >
            <TableColumnManager />
          </div>
        </Box>

        {/* データ行 */}
        {filteredAndSortedTasks.map((task, index) => {
          if (!isTaskWithColumn(task)) {
            logger.warn("Task is missing required column properties:", task);
            return null;
          }

          return (
            <Box
              key={task.id}
              style={{
                gridTemplateColumns: tableColumnsData.gridTemplateColumns,
              }}
              sx={{
                display: "grid",
                py: 2,
                px: 3,
                gap: 2,
                alignItems: "center",
                borderBottom:
                  index < filteredAndSortedTasks.length - 1
                    ? "1px solid"
                    : "none",
                borderColor: "border.default",
                cursor: "pointer",
                minWidth: "fit-content",
                "&:hover": {
                  bg: "canvas.subtle",
                },
              }}
              onClick={() => handleTaskClick(task)}
            >
              {tableColumnsData.visibleColumns.map((column: TableColumn) => (
                <Box key={column.id}>{renderCell(task, column.id)}</Box>
              ))}
            </Box>
          );
        })}
      </div>

      {/* 空状態 */}
      {filteredAndSortedTasks.length === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 0",
            color: "var(--fgColor-default)",
          }}
        >
          <Text sx={{ fontSize: 1, mb: 2 }}>
            {state.taskFilter.type === "all"
              ? "タスクがありません"
              : "フィルタ条件に一致するタスクがありません"}
          </Text>
          {state.taskFilter.type !== "all" && (
            <Button
              variant="invisible"
              size="small"
              onClick={() =>
                setTaskFilter({ type: "all", label: "すべてのタスク" })
              }
            >
              フィルタをクリア
            </Button>
          )}
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        isOpen={deleteConfirmDialog.isOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleTaskDelete}
        taskTitle={deleteConfirmDialog.task?.title || ""}
      />
    </div>
  );
};

export default TableView;
