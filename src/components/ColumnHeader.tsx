import { Box } from '@primer/react';
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

const headerStyles = {
  display: 'flex',
  pb: 3,
  justifyContent: 'space-between',
  alignItems: 'center'
} as const;

const titleContainerStyles = {
  display: 'flex',
  flex: 1,
  alignItems: 'center'
} as const;

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  column,
  onTitleEdit,
  onDeleteColumn,
  onAddTask
}) => (
    <Box sx={headerStyles}>
      <Box sx={titleContainerStyles}>
        <ColumnTitle column={column} />
      </Box>
      <ColumnActions
        onAddTask={onAddTask}
        onTitleEdit={onTitleEdit}
        onDeleteColumn={onDeleteColumn}
      />
    </Box>
  );

export default ColumnHeader;