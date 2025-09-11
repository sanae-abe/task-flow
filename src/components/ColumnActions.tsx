import React from 'react';
import { Button, Box } from '@primer/react';
import { PlusIcon, PencilIcon, TrashIcon } from '@primer/octicons-react';

interface ColumnActionsProps {
  onAddTask: () => void;
  onTitleEdit: () => void;
  onDeleteColumn: () => void;
}

const ColumnActions: React.FC<ColumnActionsProps> = ({
  onAddTask,
  onTitleEdit,
  onDeleteColumn
}) => {
  const handleEditClick = () => {
    console.log('ColumnActions: Edit column name clicked');
    onTitleEdit();
  };

  const handleDeleteClick = () => {
    console.log('ColumnActions: Delete column clicked');
    onDeleteColumn();
  };

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <Button
        onClick={onAddTask}
        variant="invisible"
        size="small"
        leadingVisual={PlusIcon}
        aria-label="Add task"
      />
      <Button
        onClick={handleEditClick}
        variant="invisible"
        size="small"
        leadingVisual={PencilIcon}
        aria-label="Edit column name"
        title="Edit column name"
      />
      <Button
        onClick={handleDeleteClick}
        variant="invisible"
        size="small"
        leadingVisual={TrashIcon}
        aria-label="Delete column"
        title="Delete column"
        sx={{
          color: 'danger.fg',
          '&:hover': {
            backgroundColor: 'danger.subtle',
            color: 'danger.fg'
          }
        }}
      />
    </Box>
  );
};

export default ColumnActions;