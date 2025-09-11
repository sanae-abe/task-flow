import React, { useState } from 'react';
import { Button, TextInput, Textarea, Box, Text } from '@primer/react';

interface AddTaskFormProps {
  onAdd: (title: string, description: string, dueDate?: Date) => void;
  onCancel: () => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAdd, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      const dueDateObj = dueDate ? new Date(dueDate) : undefined;
      onAdd(title, description, dueDateObj);
      setTitle('');
      setDescription('');
      setDueDate('');
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    onCancel();
  };

  return (
    <Box 
      sx={{
        bg: "canvas.default",
        p: 4,
        border: "1px solid",
        mb: 4,
        borderRadius: 2,
        borderColor: 'border.default',
        boxShadow: '0 0 4px rgba(0, 0, 0, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }}
    >
      <Box>
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task Title"
          autoFocus
          sx={{ 
            fontSize: 2, 
            fontWeight: '500',
            width: '100%'
          }}
        />
      </Box>
      <Box>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task Description (optional)"
          sx={{ 
            resize: 'none', 
            height: '80px',
            fontSize: 1,
            width: '100%'
          }}
        />
      </Box>
      <Box>
        <Text sx={{ fontSize: 1, fontWeight: "600", display: "block", mb: 2, color: "fg.default" }}>
          Due Date (optional)
        </Text>
        <TextInput
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          sx={{ width: '100%' }}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button onClick={handleSubmit} variant="primary" sx={{ fontWeight: '500' }}>
          Add
        </Button>
        <Button onClick={handleCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default AddTaskForm;