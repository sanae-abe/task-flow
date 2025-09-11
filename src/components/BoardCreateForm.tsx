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
          placeholder="新しいボード名"
          autoFocus
          sx={{ minWidth: '200px' }}
        />
        <Button onClick={onCreate} variant="primary">
          作成
        </Button>
        <Button onClick={onCancel}>
          キャンセル
        </Button>
      </Box>
    );
  }

  return (
    <Button 
      onClick={onStartCreate}
      variant="primary"
      aria-label="新しいボードを追加"
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
      新しいボード
    </Button>
  );
};

export default BoardCreateForm;