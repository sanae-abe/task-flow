import React from 'react';
import type { Task } from '../../../types';
import type { TaskWithColumn, TableColumn } from '../../../types/table';
import { TableRow } from './TableRow';

/**
 * テーブルボディコンポーネントのProps
 */
interface TableBodyProps {
  tasks: TaskWithColumn[];
  visibleColumns: TableColumn[];
  gridTemplateColumns: string;
  onTaskClick: (task: Task) => void;
  renderCell: (task: TaskWithColumn, columnId: string) => React.ReactNode;
}

/**
 * テーブルボディコンポーネント
 *
 * タスクデータのテーブル行をマップして描画します。
 * 各行はTableRowコンポーネントとして描画されます。
 */
export const TableBody: React.FC<TableBodyProps> = ({
  tasks,
  visibleColumns,
  gridTemplateColumns,
  onTaskClick,
  renderCell,
}) => (
  <>
    {tasks.map((task, index) => (
      <TableRow
        key={task.id}
        task={task}
        index={index}
        totalTasks={tasks.length}
        visibleColumns={visibleColumns}
        gridTemplateColumns={gridTemplateColumns}
        onTaskClick={onTaskClick}
        renderCell={renderCell}
      />
    ))}
  </>
);
