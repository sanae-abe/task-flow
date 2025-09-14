import { Box, Text, Heading } from '@primer/react';
import React from 'react';

import type { Task } from '../types';
import { formatDateTime } from '../utils/dateHelpers';

interface TaskMetadataProps {
  task: Task;
}

const TaskMetadata: React.FC<TaskMetadataProps> = ({ task }) => (
    <Box sx={{ mb: 4 }}>
      <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: '700' }}>作成/更新日時</Heading>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bg: 'canvas.subtle',
          borderRadius: 2,
          fontSize: 1
        }}
      >
        <Text>作成日時: {formatDateTime(task.createdAt)}</Text>
        <Text>更新日時: {formatDateTime(task.updatedAt)}</Text>
      </Box>
    </Box>
  );

export default TaskMetadata;