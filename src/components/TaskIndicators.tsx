import { CheckIcon, PaperclipIcon } from '@primer/octicons-react';
import { Box, Text } from '@primer/react';
import React from 'react';

import type { SubTask, FileAttachment } from '../types';

const INDICATOR_STYLES = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: 1,
    py: 1,
    borderRadius: 2,
    fontSize: 0,
    fontWeight: '400',
    alignSelf: 'flex-start' as const,
    color: 'fg.muted'
  }
} as const;

interface TaskIndicatorsProps {
  subTasks?: SubTask[];
  attachments?: FileAttachment[];
}

const TaskIndicators: React.FC<TaskIndicatorsProps> = ({
  subTasks,
  attachments
}) => {
  const hasSubTasks = subTasks && subTasks.length > 0;
  const hasAttachments = attachments && attachments.length > 0;

  if (!hasSubTasks && !hasAttachments) {return null;}

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
      {hasSubTasks && (
        <Box sx={INDICATOR_STYLES.container}>
          <CheckIcon size={12} />
          <Text sx={{ fontSize: 0 }}>
            {subTasks.filter(sub => sub.completed).length}/{subTasks.length}
          </Text>
        </Box>
      )}

      {hasAttachments && (
        <Box sx={INDICATOR_STYLES.container}>
          <PaperclipIcon size={12} />
          <Text sx={{ fontSize: 0 }}>
            {attachments.length}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default TaskIndicators;