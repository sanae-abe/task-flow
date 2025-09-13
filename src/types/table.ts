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
    id: 'actions',
    label: '操作',
    width: '40px',
    visible: true,
    sortable: false,
    type: 'actions'
  },
  {
    id: 'title',
    label: 'タスク',
    width: '650px',
    visible: true,
    sortable: true,
    type: 'text',
    accessor: 'title'
  },
  {
    id: 'status',
    label: 'ステータス',
    width: '150px',
    visible: true,
    sortable: true,
    type: 'status'
  },
  {
    id: 'dueDate',
    label: '期限',
    width: '210px',
    visible: true,
    sortable: true,
    type: 'date',
    accessor: 'dueDate'
  },
  {
    id: 'labels',
    label: 'ラベル',
    width: '180px',
    visible: true,
    sortable: false,
    type: 'labels'
  },
  {
    id: 'subTasks',
    label: 'サブタスク',
    width: '100px',
    visible: true,
    sortable: false,
    type: 'text'
  },
  {
    id: 'files',
    label: '添付',
    width: '100px',
    visible: true,
    sortable: false,
    type: 'text'
  },
  {
    id: 'progress',
    label: '進捗',
    width: '120px',
    visible: true,
    sortable: true,
    type: 'progress'
  },
  {
    id: 'createdAt',
    label: '作成日',
    width: '120px',
    visible: true,
    sortable: true,
    type: 'date',
    accessor: 'createdAt'
  }
];

export interface TaskWithColumn extends Task {
  columnId: string;
  columnTitle: string;
  status: string;
}