import type { Task } from '../types';

export interface TableColumn {
  id: string;
  label: string;
  width: string;
  visible: boolean;
  sortable: boolean;
  type: 'text' | 'date' | 'number' | 'status' | 'labels' | 'progress' | 'actions';
  accessor?: string;
  render?: (task: Task) => React.ReactNode;
}

export interface TableColumnSettings {
  columns: TableColumn[];
  columnOrder: string[];
}

export interface TableColumnsHookReturn {
  columns: TableColumn[];
  columnOrder: string[];
  visibleColumns: TableColumn[];
  gridTemplateColumns: string;
  toggleColumnVisibility: (columnId: string) => void;
  updateColumnWidth: (columnId: string, width: string) => void;
  reorderColumns: (newOrder: string[]) => void;
  addCustomColumn: (column: Omit<TableColumn, 'id'>) => void;
  removeColumn: (columnId: string) => void;
  resetToDefaults: () => void;
  _forceRender: number;
  _timestamp: number;
}

export const DEFAULT_COLUMNS: TableColumn[] = [
  {
    id: 'title',
    label: 'タスク',
    width: '480px',
    visible: true,
    sortable: true,
    type: 'text',
    accessor: 'title'
  },
  {
    id: 'description',
    label: '説明',
    width: '600px',
    visible: false,
    sortable: false,
    type: 'text',
    accessor: 'description'
  },
  {
    id: 'dueDate',
    label: '期限',
    width: '160px',
    visible: true,
    sortable: true,
    type: 'date',
    accessor: 'dueDate'
  },
  {
    id: 'status',
    label: 'ステータス',
    width: '120px',
    visible: true,
    sortable: true,
    type: 'status'
  },
  {
    id: 'progress',
    label: '進捗',
    width: '80px',
    visible: false,
    sortable: true,
    type: 'progress'
  },
  {
    id: 'completedAt',
    label: '完了日',
    width: '120px',
    visible: false,
    sortable: true,
    type: 'date',
    accessor: 'completedAt'
  },
  {
    id: 'labels',
    label: 'ラベル',
    width: '200px',
    visible: true,
    sortable: false,
    type: 'labels'
  },
  {
    id: 'createdAt',
    label: '作成日',
    width: '120px',
    visible: false,
    sortable: true,
    type: 'date',
    accessor: 'createdAt'
  },
  {
    id: 'updatedAt',
    label: '更新日',
    width: '120px',
    visible: true,
    sortable: true,
    type: 'date',
    accessor: 'updatedAt'
  },
  {
    id: 'subTasks',
    label: 'サブタスク',
    width: '100px',
    visible: false,
    sortable: false,
    type: 'text'
  },
  {
    id: 'files',
    label: '添付',
    width: '80px',
    visible: false,
    sortable: false,
    type: 'text'
  },
  {
    id: 'actions',
    label: '操作',
    width: '80px',
    visible: false,
    sortable: false,
    type: 'actions'
  }
];

export interface TaskWithColumn extends Task {
  columnId: string;
  columnTitle: string;
  status: string;
}