import React from 'react';
import { Button, TextInput, Textarea, Box, Text } from '@primer/react';

interface TaskEditFormProps {
  editTitle: string;
  editDescription: string;
  editDueDate: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onDueDateChange: (date: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const TaskEditForm: React.FC<TaskEditFormProps> = ({
  editTitle,
  editDescription,
  editDueDate,
  onTitleChange,
  onDescriptionChange,
  onDueDateChange,
  onSave,
  onCancel
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <Box 
      sx={{
        p: 4,
        display: 'flex', 
        flexDirection: 'column',
        gap: 1,
        bg: 'canvas.default',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'border.default',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
      }}
      onKeyDown={handleKeyDown}
    >
      <TextInput
        value={editTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Task Title"
        autoFocus
        sx={{ mb: 3, fontSize: 2, fontWeight: '500' }}
      />
      <Textarea
        value={editDescription}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Task Description"
        sx={{ 
          mb: 4, 
          resize: 'none', 
          height: '80px',
          fontSize: 1
        }}
      />
      <Box sx={{ mb: 4 }}>
        <Text sx={{ fontSize: 1, fontWeight: "600", display: "block", mb: 2, color: "fg.default" }}>
          Due Date (optional)
        </Text>
        <TextInput
          type="date"
          value={editDueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
          sx={{ width: '100%' }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button onClick={onSave} variant="primary" sx={{ fontWeight: '500', flex: 1 }}>
          Save
        </Button>
        <Button onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default TaskEditForm;