import { useMemo } from "react";

import { useKanban } from "../contexts/KanbanContext";
import type { Task, Column } from "../types";

interface UseTaskColumnReturn {
  column: Column | undefined;
  columnName: string | undefined;
}

/**
 * タスクが属するカラムを取得するカスタムフック
 */
export const useTaskColumn = (task: Task | null): UseTaskColumnReturn => {
  const { state } = useKanban();

  const column = useMemo((): Column | undefined => {
    if (!task?.id || !state.currentBoard?.columns?.length) {
      return undefined;
    }

    // 効率的な検索: early returnでパフォーマンス向上
    return state.currentBoard.columns.find((col) =>
      col.tasks.some((t) => t.id === task.id),
    );
  }, [task?.id, state.currentBoard?.columns]);

  const columnName = useMemo(() => column?.title, [column?.title]);

  return {
    column,
    columnName,
  };
};
