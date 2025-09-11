import React from 'react';
import { TextInput, Box, Heading } from '@primer/react';
import type { Column } from '../types';

interface ColumnTitleProps {
  column: Column;
  isEditingTitle: boolean;
  editingTitle: string;
  setEditingTitle: (title: string) => void;
  onTitleSave: () => void;
  onTitleCancel: () => void;
  onTitleEdit: () => void;
}

const ColumnTitle: React.FC<ColumnTitleProps> = ({
  column,
  isEditingTitle,
  editingTitle,
  setEditingTitle,
  onTitleSave,
  onTitleCancel,
  onTitleEdit
}) => {
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onTitleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onTitleCancel();
    }
  };

  const handleTitleEdit = () => {
    console.log('ColumnTitle: handleTitleEdit called');
    onTitleEdit();
  };

  if (isEditingTitle) {
    return (
      <TextInput
        value={editingTitle}
        onChange={(e) => setEditingTitle(e.target.value)}
        onBlur={onTitleSave}
        onKeyDown={handleTitleKeyDown}
        autoFocus
        sx={{ 
          minWidth: '120px', 
          maxWidth: '200px', 
          fontSize: 2, 
          fontWeight: '600',
          border: 'none',
          backgroundColor: 'transparent',
          '&:focus': {
            backgroundColor: 'canvas.subtle',
            border: '1px solid',
            borderColor: 'accent.emphasis'
          }
        }}
      />
    );
  }

  return (
    <Box sx={{ display: "flex", flex: "1", alignItems: "center", gap: 1 }}>
      <Heading 
        sx={{ 
          fontSize: 2, 
          margin: 0, 
          cursor: 'pointer',
          fontWeight: '600',
          color: 'fg.default',
          '&:hover': { color: 'accent.fg' }
        }}
        onDoubleClick={handleTitleEdit}
        title="Double-click to edit"
      >
        {column.title}
      </Heading>
      <Box
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          fontSize: 1,
          fontWeight: '600'
        }}
      >
        {column.tasks.length}
      </Box>
    </Box>
  );
};

export default ColumnTitle;