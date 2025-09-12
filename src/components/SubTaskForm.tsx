import { Box, TextInput, Button } from '@primer/react';
import React from 'react';

interface SubTaskFormProps {
  title: string;
  onTitleChange: (title: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SubTaskForm: React.FC<SubTaskFormProps> = ({
  title,
  onTitleChange,
  onSubmit,
  onCancel,
  onKeyDown
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      borderRadius: 2,
      bg: 'canvas.default'
    }}
  >
    <TextInput
      value={title}
      onChange={(e) => onTitleChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder="サブタスク名を入力..."
      autoFocus
      sx={{ flex: 1 }}
    />
    <Button
      onClick={onSubmit}
      variant="primary"
      size="small"
      disabled={!title.trim()}
    >
      追加
    </Button>
    <Button
      onClick={onCancel}
      size="small"
    >
      キャンセル
    </Button>
  </Box>
);

export default SubTaskForm;