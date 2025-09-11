import React, { useState } from 'react';
import { Button, TextInput, Textarea, Box, Text } from '@primer/react';
import type { Label } from '../types';
import LabelSelector from './LabelSelector';

interface AddTaskFormProps {
  onAdd: (title: string, description: string, dueDate?: Date, labels?: Label[]) => void;
  onCancel: () => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAdd, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);

  const handleSubmit = () => {
    if (title.trim()) {
      const dueDateObj = dueDate ? new Date(dueDate) : undefined;
      onAdd(title, description, dueDateObj, labels);
      setTitle('');
      setDescription('');
      setDueDate('');
      setLabels([]);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setLabels([]);
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
          placeholder="タスクタイトルを入力"
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
          placeholder="タスクの説明（任意）"
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
          期限（任意）
        </Text>
        <TextInput
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          sx={{ width: '100%' }}
        />
      </Box>
      <Box>
        <Text sx={{ fontSize: 1, fontWeight: "600", display: "block", mb: 2, color: "fg.default" }}>
          ラベル（任意）
        </Text>
        <LabelSelector
          selectedLabels={labels}
          onLabelsChange={setLabels}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button onClick={handleSubmit} variant="primary" sx={{ fontWeight: '500' }}>
          追加
        </Button>
        <Button onClick={handleCancel}>
          キャンセル
        </Button>
      </Box>
    </Box>
  );
};

export default AddTaskForm;