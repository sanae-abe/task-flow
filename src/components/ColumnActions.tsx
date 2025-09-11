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
    onTitleEdit();
  };

  const handleDeleteClick = () => {
    onDeleteColumn();
  };

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <Button
        onClick={onAddTask}
        variant="invisible"
        size="small"
        leadingVisual={PlusIcon}
        aria-label="タスクを追加"
      />
      <Button
        onClick={handleEditClick}
        variant="invisible"
        size="small"
        leadingVisual={PencilIcon}
        aria-label="カラム名を編集"
        title="カラム名を編集"
      />
      <Button
        onClick={handleDeleteClick}
        variant="invisible"
        size="small"
        leadingVisual={TrashIcon}
        aria-label="カラムを削除"
        title="カラムを削除"
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