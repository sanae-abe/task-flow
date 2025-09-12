import { FormControl, Select, Text } from '@primer/react';
import { memo } from 'react';

import type { Column } from '../types';

interface StatusSelectorProps {
  columns: Column[];
  selectedColumnId: string;
  onColumnChange: (columnId: string) => void;
  required?: boolean;
}

/**
 * ステータス選択コンポーネント
 * カラム一覧から1つを選択するセレクトボックス
 */
const StatusSelector = memo<StatusSelectorProps>(({
  columns,
  selectedColumnId,
  onColumnChange,
  required = false
}) => (
  <div style={{ 
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
    <FormControl required={required}>
      <FormControl.Label>
        <Text style={{ 
          fontSize: '12px', 
          color: 'var(--fgColor-muted)', 
          fontWeight: '600' 
        }}>
          ステータス
        </Text>
      </FormControl.Label>
      <Select
        value={selectedColumnId}
        onChange={(e) => onColumnChange(e.target.value)}
        aria-label="タスクのステータスを選択"
        style={{ width: '100%' }}
      >
        <Select.Option value="">ステータスを選択</Select.Option>
        {columns.map((column) => (
          <Select.Option key={column.id} value={column.id}>
            {column.title}
          </Select.Option>
        ))}
      </Select>
      {required && !selectedColumnId && (
        <FormControl.Validation variant="error">
          ステータスを選択してください
        </FormControl.Validation>
      )}
    </FormControl>
  </div>
));

StatusSelector.displayName = 'StatusSelector';

export default StatusSelector;