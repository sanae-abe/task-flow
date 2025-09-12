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
  uploadedAt: Date;
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
  createdAt: Date;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  labels?: Label[];
  subTasks?: SubTask[];
  attachments?: FileAttachment[];
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

export interface KanbanBoard {
  id: string;
  title: string;
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
}