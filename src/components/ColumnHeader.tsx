import React from 'react';

import type { Column } from '../types';

import ColumnActions from './ColumnActions';
import ColumnTitle from './ColumnTitle';

interface ColumnHeaderProps {
  column: Column;
  onTitleEdit: () => void;
  onDeleteColumn: () => void;
  onAddTask: () => void;
}

const headerStyles: React.CSSProperties = {
  display: 'flex',
  paddingBottom: '12px',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  overflow: 'hidden'
};

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  column,
  onTitleEdit,
  onDeleteColumn,
  onAddTask
}) => (
    <div style={headerStyles}>
      <ColumnTitle column={column} />
      <ColumnActions
        onAddTask={onAddTask}
        onTitleEdit={onTitleEdit}
        onDeleteColumn={onDeleteColumn}
      />
    </div>
  );

export default ColumnHeader;