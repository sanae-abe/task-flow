import { useMemo } from "react";
import type { TaskWithColumn } from "../../../types/table";
import type { KanbanBoard, TaskFilter, SortOption } from "../../../types";
import { sortTasks } from "../../../utils/taskSort";
import { filterTasks } from "../../../utils/taskFilter";
import type { TableDataState } from "../types";

/**
 * テーブルデータ管理カスタムフック
 *
 * 現在のボードからタスクを取得し、フィルタリング・ソートを適用します。
 * TableWithColumn型への変換も行います。
 */
export const useTableData = (
  currentBoard: KanbanBoard | null,
  taskFilter: TaskFilter,
  sortOption: SortOption,
): TableDataState => {
  // 全タスクを TaskWithColumn 形式に変換
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

  // フィルタリング・ソート済みのタスク
  const filteredAndSortedTasks = useMemo(() => {
    let tasks = filterTasks(allTasks, taskFilter) as TaskWithColumn[];
    tasks = sortTasks(tasks, sortOption) as TaskWithColumn[];
    return tasks;
  }, [allTasks, taskFilter, sortOption]);

  return {
    allTasks,
    filteredAndSortedTasks,
  };
};
