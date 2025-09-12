import { Box, Text } from '@primer/react';
import React from 'react';

import type { Label } from '../types';

import FormField, { TextareaField, DateField , FORM_STYLES } from './FormField';
import ImprovedLabelSelector from './ImprovedLabelSelector';

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
}) => (
    <>
      <FormField
        id="task-title"
        label="タイトル"
        value={editTitle}
        placeholder="タスクタイトルを入力"
        onChange={onTitleChange}
      />

      <TextareaField
        id="task-description"
        label="説明"
        value={editDescription}
        placeholder="タスクの説明を入力"
        onChange={onDescriptionChange}
        rows={4}
      />

      <DateField
        id="task-due-date"
        label="期限"
        value={editDueDate}
        onChange={onDueDateChange}
      />

      <Box sx={FORM_STYLES.container}>
        <Text 
          as="label" 
          sx={FORM_STYLES.label}
        >
          ラベル
        </Text>
        <ImprovedLabelSelector
          selectedLabels={editLabels}
          onLabelsChange={onLabelsChange}
        />
      </Box>
    </>
  );

export default TaskDetailEditForm;