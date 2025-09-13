export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64 encoded file data
  uploadedAt: string;
}

export type ImportMode = 'drag-drop' | 'file-select' | 'both';

export interface ImportModeConfig {
  mode: ImportMode;
  label: string;
  description: string;
}

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number; // milliseconds
  createdAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  completedAt: string | null;
  priority: Priority;
  labels: Label[];
  subTasks: SubTask[];
  files: FileAttachment[];
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
}

export type SortOption = 'manual' | 'dueDate' | 'createdAt' | 'updatedAt' | 'title';

export interface SortConfig {
  option: SortOption;
  label: string;
  icon?: string;
}

export type FilterType = 'all' | 'due-within-3-days' | 'due-today' | 'overdue' | 'label' | 'has-labels';

export interface TaskFilter {
  type: FilterType;
  label: string;
  selectedLabels?: string[]; // ラベルIDフィルターの場合に使用（後方互換性のため保持）
  selectedLabelNames?: string[]; // ラベル名フィルターの場合に使用
}

export interface FilterConfig {
  type: FilterType;
  label: string;
  icon?: string;
  description?: string;
}

export type ViewMode = 'kanban' | 'calendar' | 'table';

export interface KanbanBoard {
  id: string;
  title: string;
  columns: Column[];
  labels: Label[];
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface KanbanState {
  boards: KanbanBoard[];
  currentBoard: KanbanBoard | null;
  sortOption: SortOption;
  taskFilter: {
    priority: Priority | null;
    labels: string[];
    dueDate: string | null;
    searchQuery: string;
  };
  viewMode: ViewMode;
}

export type KanbanAction =
  | { type: 'SET_BOARDS'; payload: KanbanBoard[] }
  | { type: 'CREATE_BOARD'; payload: { title: string } }
  | { type: 'SWITCH_BOARD'; payload: { boardId: string } }
  | { type: 'UPDATE_BOARD'; payload: { boardId: string; updates: Partial<KanbanBoard> } }
  | { type: 'DELETE_BOARD'; payload: { boardId: string } }
  | { type: 'ADD_COLUMN'; payload: { title: string } }
  | { type: 'UPDATE_COLUMN'; payload: { columnId: string; title: string } }
  | { type: 'DELETE_COLUMN'; payload: { columnId: string } }
  | { type: 'REORDER_COLUMNS'; payload: { sourceIndex: number; targetIndex: number } }
  | { type: 'ADD_TASK'; payload: { columnId: string; title: string; description?: string; dueDate?: Date; priority?: Priority; labels?: Label[]; files?: FileAttachment[] } }
  | { type: 'UPDATE_TASK'; payload: { taskId: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: { taskId: string } }
  | { type: 'MOVE_TASK'; payload: { taskId: string; sourceColumnId: string; targetColumnId: string; targetIndex: number } }
  | { type: 'ADD_LABEL'; payload: { label: Label } }
  | { type: 'UPDATE_LABEL'; payload: { labelId: string; updates: Partial<Label> } }
  | { type: 'DELETE_LABEL'; payload: { labelId: string } }
  | { type: 'ADD_SUBTASK'; payload: { taskId: string; subTask: SubTask } }
  | { type: 'UPDATE_SUBTASK'; payload: { taskId: string; subTaskId: string; updates: Partial<SubTask> } }
  | { type: 'DELETE_SUBTASK'; payload: { taskId: string; subTaskId: string } }
  | { type: 'SET_SORT_OPTION'; payload: SortOption }
  | { type: 'SET_TASK_FILTER'; payload: KanbanState['taskFilter'] }
  | { type: 'CLEAR_TASK_FILTER' }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode };