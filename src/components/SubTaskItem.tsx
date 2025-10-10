import { TrashIcon, CheckCircleIcon, CheckCircleFillIcon } from '@primer/octicons-react';
import { Box, Text } from '@primer/react';
import React from 'react';

import type { SubTask } from '../types';
import IconButton from './shared/IconButton';

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
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
        bg: 'canvas.default',
        cursor: 'pointer',
        position: 'relative',
        '&:hover': {
          bg: 'canvas.subtle'
        },
        '&:hover .delete-button': {
          opacity: '1 !important'
        }
      }}
    >
      <IconButton
        icon={subTask.completed ? CheckCircleFillIcon : CheckCircleIcon}
        onClick={handleToggle}
        ariaLabel={`${subTask.title}を${subTask.completed ? '未完了' : '完了'}にする`}
        variant="success"
        size="small"
        stopPropagation
        sx={{
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
      <Box
        className="delete-button"
        sx={{
          opacity: 0,
          transition: 'opacity 0.2s ease'
        }}
      >
        <IconButton
          icon={TrashIcon}
          onClick={handleDelete}
          ariaLabel={`${subTask.title}を削除`}
          size="small"
          stopPropagation
          sx={{
            color: 'fg.muted',
            '&:hover': {
              bg: 'transparent',
              color: 'danger.fg'
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default SubTaskItem;