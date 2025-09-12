import { TrashIcon, CheckCircleIcon, CheckCircleFillIcon } from '@primer/octicons-react';
import { Box, Text, IconButton } from '@primer/react';
import React from 'react';

import type { SubTask } from '../types';

interface SubTaskItemProps {
  subTask: SubTask;
  onToggle: (subTaskId: string) => void;
  onDelete: (subTaskId: string) => void;
}

const SubTaskItem: React.FC<SubTaskItemProps> = ({
  subTask,
  onToggle,
  onDelete
}) => {
  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    onToggle(subTask.id);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(subTask.id);
  };

  return (
    <Box
      onClick={handleToggle}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
        bg: 'canvas.default',
        cursor: 'pointer',
        '&:hover': {
          bg: 'canvas.subtle'
        }
      }}
    >
      <IconButton
        aria-label={`${subTask.title}を${subTask.completed ? '未完了' : '完了'}にする`}
        icon={subTask.completed ? CheckCircleFillIcon : CheckCircleIcon}
        size="small"
        variant="invisible"
        sx={{
          color: 'success.fg',
          '&:hover': {
            bg: 'transparent',
          }
        }}
      />
      <Text
        sx={{
          flex: 1,
          textDecoration: 'none',
          opacity: subTask.completed ? 0.6 : 1,
          fontSize: 1
        }}
      >
        {subTask.title}
      </Text>
      <IconButton
        onClick={handleDelete}
        variant="invisible"
        size="small"
        icon={TrashIcon}
        aria-label={`${subTask.title}を削除`}
        sx={{ 
          color: 'danger.fg',
          '&:hover': {
            bg: 'transparent',
            color: 'danger.fg'
          }
        }}
      />
    </Box>
  );
};

export default SubTaskItem;