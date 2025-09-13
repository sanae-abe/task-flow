import { CheckCircleIcon, CheckCircleFillIcon, SyncIcon } from '@primer/octicons-react';
import { Box, Text, Heading } from '@primer/react';
import React from 'react';

import type { TaskDisplayProps } from '../types/task';
import IconButton from './shared/IconButton';

import DueDateBadge from './DueDateBadge';
import TaskIndicators from './TaskIndicators';
import TaskLabels from './TaskLabels';

const TaskCardContent: React.FC<TaskDisplayProps> = ({
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
            icon={isRightmostColumn ? CheckCircleFillIcon : CheckCircleIcon}
            onClick={onComplete}
            ariaLabel={isRightmostColumn ? "タスクを未完了にする" : "タスクを完了にする"}
            variant="success"
            size="small"
            sx={{
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
          fontWeight: '500',
          color: 'fg.default',
          lineHeight: '1.4',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          {task.recurrence?.enabled && (
            <SyncIcon size={12} />
          )}
          {task.title}
        </Heading>
      </Box>

      {task.description && (
        <Text sx={{
          fontSize: 1, color: "fg.muted",
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          mb: '2px'
        }}>
          {task.description}
        </Text>
      )}

      <TaskLabels labels={task.labels} />

      {(task.dueDate || (task.subTasks && task.subTasks.length > 0) || (task.files && task.files.length > 0)) && (
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            {task.dueDate && (
              <DueDateBadge
                dueDate={new Date(task.dueDate)}
                isOverdue={isOverdue}
                isDueToday={isDueToday}
                isDueTomorrow={isDueTomorrow}
                formatDueDate={formatDueDate}
              />
            )}
          </div>
          <TaskIndicators 
            subTasks={task.subTasks}
            attachments={task.files}
          />
        </Box>
      )}
    </Box>
  );

export default TaskCardContent;