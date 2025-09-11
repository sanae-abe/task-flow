export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  labels?: Label[];
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
}

export interface KanbanBoard {
  id: string;
  title: string;
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
}