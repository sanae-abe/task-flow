export interface Label {
  id: string;
  name: string;
  color: string;
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
  labels?: Label[];
  subTasks?: SubTask[];
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