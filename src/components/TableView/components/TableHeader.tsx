import React from 'react';
import { Box, Text, CounterLabel } from '@primer/react';
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
  taskCount
}) => (
    <Box
      style={{ gridTemplateColumns }}
      sx={{
        display: 'grid',
        bg: 'canvas.default',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        boxShadow: '0 0 2px rgba(0,0,0,0.05)',
        py: 2,
        px: 3,
        gap: 2,
        minWidth: 'fit-content',
        position: 'relative',
      }}
    >
      {visibleColumns.map((column) => (
        <div key={column.id} style={{ display: 'flex', alignItems: 'center', gap: "4px" }}>
          <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>
            {column.label}
          </Text>
          {column.id === 'title' && (
            <CounterLabel sx={{ ml: 1, flexShrink: 0 }}>
              {taskCount}
            </CounterLabel>
          )}
        </div>
      ))}

      {/* 設定ボタンを固定位置に配置 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: "12px",
          transform: 'translateY(-50%)',
        }}
      >
        <TableColumnManager />
      </div>
    </Box>
  );