import { CheckCircleIcon, CheckCircleFillIcon } from '@primer/octicons-react';
import { Box, Text, Heading, IconButton } from '@primer/react';
import React from 'react';

import type { TaskDisplayProps } from '../types/task';

import DueDateBadge from './DueDateBadge';
import TaskIndicators from './TaskIndicators';
import TaskLabels from './TaskLabels';

const TaskDisplay: React.FC<TaskDisplayProps> = ({
  task,
  isOverdue,
  isDueToday,
  isDueTomorrow,
  formatDueDate,
  onComplete,
  isRightmostColumn = false
}) => (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {onComplete && (
          <IconButton
            aria-label={isRightmostColumn ? "タスクを未完了にする" : "タスクを完了にする"}
            icon={isRightmostColumn ? CheckCircleFillIcon : CheckCircleIcon}
            size="small"
            onClick={onComplete}
            variant="invisible"
            sx={{
              color: 'success.fg',
              '&:hover': {
                bg: 'transparent',
                color: 'success.fg',
              }
            }}
          />
        )}
        <Heading sx={{
          fontSize: 1,
          margin: 0,
          fontWeight: '600',
          color: 'fg.default',
          lineHeight: '1.4',
          flex: 1
        }}>
          {task.title}
        </Heading>
      </Box>

      {task.description && (
        <Text sx={{
          fontSize: 1, color: "fg.muted",
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}>
          {task.description}
        </Text>
      )}

      <TaskLabels labels={task.labels} />

      {(task.dueDate || (task.subTasks && task.subTasks.length > 0) || (task.attachments && task.attachments.length > 0)) && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          {task.dueDate && (
            <DueDateBadge
              dueDate={task.dueDate}
              isOverdue={isOverdue}
              isDueToday={isDueToday}
              isDueTomorrow={isDueTomorrow}
              formatDueDate={formatDueDate}
            />
          )}
          <TaskIndicators 
            subTasks={task.subTasks}
            attachments={task.attachments}
          />
        </Box>
      )}
    </Box>
  );

export default TaskDisplay;