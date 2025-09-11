import React from 'react';
import { Button, TextInput, Box } from '@primer/react';
import { PlusIcon } from '@primer/octicons-react';

interface BoardCreateFormProps {
  isCreating: boolean;
  newBoardTitle: string;
  onTitleChange: (title: string) => void;
  onCreate: () => void;
  onCancel: () => void;
  onStartCreate: () => void;
}

const BoardCreateForm: React.FC<BoardCreateFormProps> = ({
  isCreating,
  newBoardTitle,
  onTitleChange,
  onCreate,
  onCancel,
  onStartCreate
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCreate();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  if (isCreating) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextInput
          value={newBoardTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter board title"
          autoFocus
          sx={{ minWidth: '200px' }}
        />
        <Button onClick={onCreate} variant="primary">
          Create
        </Button>
        <Button onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    );
  }

  return (
    <Button 
      onClick={onStartCreate}
      variant="primary"
      aria-label="Add Board"
      leadingVisual={PlusIcon}
      sx={{
        backgroundColor: 'accent.emphasis',
        color: '#ffffff',
        border: 'none',
        borderRadius: 2,
        px: 4,
        py: 3
      }}
    >
      New Board
    </Button>
  );
};

export default BoardCreateForm;