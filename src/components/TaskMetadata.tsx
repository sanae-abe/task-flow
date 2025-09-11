import React from 'react';
import { Box, Text, Heading } from '@primer/react';
import type { Task } from '../types';
import { formatDateTime } from '../utils/dateHelpers';

interface TaskMetadataProps {
  task: Task;
}

const TaskMetadata: React.FC<TaskMetadataProps> = ({ task }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>作成/更新日</Heading>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bg: 'canvas.subtle',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text sx={{ fontSize: 0, color: "fg.muted" }}>作成日:</Text>
          <Text sx={{ fontSize: 1 }}>{formatDateTime(task.createdAt)}</Text>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text sx={{ fontSize: 0, color: "fg.muted" }}>更新日:</Text>
          <Text sx={{ fontSize: 1 }}>{formatDateTime(task.updatedAt)}</Text>
        </Box>
      </Box>
    </Box>
  );
};

export default TaskMetadata;