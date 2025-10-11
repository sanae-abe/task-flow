import React from 'react';
import { Box } from '@primer/react';
import type { TableRowProps } from '../types';
import { isTaskWithColumn } from '../utils/tableHelpers';
import { logger } from '../../../utils/logger';

/**
 * テーブル行コンポーネント
 *
 * 個別のタスク行を描画します。
 * ホバー効果とクリック処理を含みます。
 */
export const TableRow: React.FC<TableRowProps> = ({
  task,
  index,
  totalTasks,
  visibleColumns,
  gridTemplateColumns,
  onTaskClick,
  renderCell
}) => {
  // 型ガードチェック
  if (!isTaskWithColumn(task)) {
    logger.warn('Task is missing required column properties:', task);
    return null;
  }

  return (
    <Box
      key={task.id}
      style={{ gridTemplateColumns }}
      sx={{
        display: 'grid',
        py: 2,
        px: 3,
        gap: 2,
        alignItems: 'center',
        borderBottom: index < totalTasks - 1 ? '1px solid' : 'none',
        borderColor: 'border.default',
        cursor: 'pointer',
        minWidth: 'fit-content',
        '&:hover': {
          bg: 'canvas.subtle',
        },
      }}
      onClick={() => onTaskClick(task)}
    >
      {visibleColumns.map((column) => (
        <Box key={column.id}>
          {renderCell(task, column.id)}
        </Box>
      ))}
    </Box>
  );
};