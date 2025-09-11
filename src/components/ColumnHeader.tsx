import React from 'react';
import { Box } from '@primer/react';
import type { Column } from '../types';
import ColumnTitle from './ColumnTitle';
import ColumnActions from './ColumnActions';

interface ColumnHeaderProps {
  column: Column;
  onTitleEdit: () => void;
  onDeleteColumn: () => void;
  onAddTask: () => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  column,
  onTitleEdit,
  onDeleteColumn,
  onAddTask
}) => {

  return (
    <Box
      sx={{
        display: "flex",
        pb: 3,
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <Box sx={{ display: "flex", flex: "1", alignItems: "center" }}>
        <ColumnTitle
          column={column}
          onTitleEdit={onTitleEdit}
        />
      </Box>
      <ColumnActions
        onAddTask={onAddTask}
        onTitleEdit={onTitleEdit}
        onDeleteColumn={onDeleteColumn}
      />
    </Box>
  );
};

export default ColumnHeader;