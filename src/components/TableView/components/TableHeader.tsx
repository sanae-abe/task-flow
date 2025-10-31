import React from 'react';
import type { TableHeaderProps } from '../types';
import TableColumnManager from '../../TableColumnManager';

/**
 * テーブルヘッダーコンポーネント
 *
 * テーブルのヘッダー行を描画します。
 * カラム名、タスク数、設定ボタンを含みます。
 */
export const TableHeader: React.FC<TableHeaderProps> = ({
  visibleColumns,
  gridTemplateColumns,
  taskCount,
}) => (
  <div
    style={{
      gridTemplateColumns,
      display: 'grid',
      background: 'var(--background)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 0 2px rgba(0,0,0,0.05)',
      padding: '8px 50px 8px 12px',
      gap: '8px',
      minWidth: 'fit-content',
      position: 'relative',
    }}
  >
    {visibleColumns.map(column => (
      <div key={column.id} className='flex items-center gap-1'>
        <span className='font-bold text-sm'>{column.label}</span>
        {column.id === 'title' && (
          <span className='ml-1 shrink-0 bg-neutral-100 text-zinc-900 text-xs px-1.5 py-0.5 rounded-full'>
            {taskCount}
          </span>
        )}
      </div>
    ))}

    {/* 設定ボタンを固定位置に配置 */}
    <div className='absolute top-1/2 right-3 transform -translate-y-1/2'>
      <TableColumnManager />
    </div>
  </div>
);
