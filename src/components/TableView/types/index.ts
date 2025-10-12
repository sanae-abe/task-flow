import type { Task, KanbanBoard, TaskFilter } from "../../../types";
import type { TaskWithColumn, TableColumn } from "../../../types/table";

/**
 * 削除確認ダイアログの状態
 */
export interface DeleteConfirmState {
  isOpen: boolean;
  task: TaskWithColumn | null;
}

/**
 * テーブル操作のアクション
 */
export interface TableActions {
  handleTaskClick: (task: Task) => void;
  handleStatusChange: (task: TaskWithColumn, newColumnId: string) => void;
  handleTaskDeleteClick: (task: TaskWithColumn) => void;
  handleTaskDelete: () => void;
  handleDeleteDialogClose: () => void;
}

/**
 * テーブルデータの状態
 */
export interface TableDataState {
  allTasks: TaskWithColumn[];
  filteredAndSortedTasks: TaskWithColumn[];
}

/**
 * TableCellコンポーネントのProps
 */
export interface TableCellProps {
  task: TaskWithColumn;
  columnId: string;
  currentBoard: KanbanBoard | null;
  onStatusChange: (task: TaskWithColumn, newColumnId: string) => void;
  onDeleteClick: (task: TaskWithColumn) => void;
  getCompletionRate: (task: Task) => number;
}

/**
 * TableRowコンポーネントのProps
 */
export interface TableRowProps {
  task: TaskWithColumn;
  index: number;
  totalTasks: number;
  visibleColumns: TableColumn[];
  gridTemplateColumns: string;
  onTaskClick: (task: Task) => void;
  renderCell: (task: TaskWithColumn, columnId: string) => React.ReactNode;
}

/**
 * TableHeaderコンポーネントのProps
 */
export interface TableHeaderProps {
  visibleColumns: TableColumn[];
  gridTemplateColumns: string;
  taskCount: number;
}

/**
 * EmptyStateコンポーネントのProps
 */
export interface EmptyStateProps {
  taskFilter: TaskFilter;
  onClearFilter: () => void;
}
