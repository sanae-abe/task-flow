import React from 'react';
import { Box } from '@primer/react';
import type { Column } from '../types';
import ColumnTitle from './ColumnTitle';
import ColumnActions from './ColumnActions';

interface ColumnHeaderProps {
  column: Column;
  isEditingTitle: boolean;
  editingTitle: string;
  setEditingTitle: (title: string) => void;
  onTitleSave: () => void;
  onTitleCancel: () => void;
  onTitleEdit: () => void;
  onDeleteColumn: () => void;
  onAddTask: () => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  column,
  isEditingTitle,
  editingTitle,
  setEditingTitle,
  onTitleSave,
  onTitleCancel,
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
          isEditingTitle={isEditingTitle}
          editingTitle={editingTitle}
          setEditingTitle={setEditingTitle}
          onTitleSave={onTitleSave}
          onTitleCancel={onTitleCancel}
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