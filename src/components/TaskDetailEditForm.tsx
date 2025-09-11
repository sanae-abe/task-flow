import React from 'react';
import { Box, Heading, TextInput, Textarea } from '@primer/react';
import type { Label } from '../types';
import LabelSelector from './LabelSelector';

interface TaskDetailEditFormProps {
  editTitle: string;
  editDescription: string;
  editDueDate: string;
  editLabels: Label[];
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onLabelsChange: (labels: Label[]) => void;
}

const TaskDetailEditForm: React.FC<TaskDetailEditFormProps> = ({
  editTitle,
  editDescription,
  editDueDate,
  editLabels,
  onTitleChange,
  onDescriptionChange,
  onDueDateChange,
  onLabelsChange,
}) => {
  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>タイトル</Heading>
        <TextInput
          value={editTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="タスクタイトルを入力"
          sx={{ width: '100%' }}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>説明</Heading>
        <Textarea
          value={editDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="タスクの説明を入力"
          rows={4}
          sx={{ width: '100%', resize: 'vertical' }}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>期限</Heading>
        <TextInput
          type="date"
          value={editDueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
          sx={{ width: '100%' }}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>ラベル</Heading>
        <LabelSelector
          selectedLabels={editLabels}
          onLabelsChange={onLabelsChange}
        />
      </Box>
    </>
  );
};

export default TaskDetailEditForm;