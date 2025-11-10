import React, { useCallback } from 'react';
import type { TableRowProps } from '../types';
import { isTaskWithColumn } from '../utils/tableHelpers';
import { logger } from '../../../utils/logger';

/**
 * テーブル行コンポーネント
 *
 * 個別のタスク行を描画します。
 * ホバー効果とクリック処理を含みます。
 * アクセシビリティ対応：キーボード操作、ARIA属性
 */
export const TableRow: React.FC<TableRowProps> = ({
  task,
  index,
  totalTasks,
  visibleColumns,
  gridTemplateColumns,
  onTaskClick,
  renderCell,
}) => {
  // キーボードアクセシビリティ: Enter/Spaceでタスク詳細を開く
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onTaskClick(task);
      }
    },
    [onTaskClick, task]
  );

  // 型ガードチェック
  if (!isTaskWithColumn(task)) {
    logger.warn('Task is missing required column properties:', task);
    return null;
  }

  return (
    <div
      key={task.id}
      role='row'
      tabIndex={0}
      aria-label={`タスク: ${task.title}`}
      style={{
        gridTemplateColumns,
        display: 'grid',
        padding: '8px 12px',
        gap: '8px',
        alignItems: 'center',
        borderBottom:
          index < totalTasks - 1 ? '1px solid var(--border)' : 'none',
        cursor: 'pointer',
        minWidth: 'fit-content',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = 'var(--muted)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = '';
      }}
      onClick={() => onTaskClick(task)}
      onKeyDown={handleKeyDown}
    >
      {visibleColumns.map(column => (
        <div key={column.id} role='cell'>
          {renderCell(task, column.id)}
        </div>
      ))}
    </div>
  );
};
