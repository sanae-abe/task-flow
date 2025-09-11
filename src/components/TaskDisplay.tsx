import React from 'react';
import { Box, Text, Heading, IconButton } from '@primer/react';
import { CalendarIcon, CheckCircleIcon, CheckCircleFillIcon } from '@primer/octicons-react';
import type { Task } from '../types';

interface TaskDisplayProps {
  task: Task;
  isOverdue: () => boolean;
  isDueToday: () => boolean;
  isDueTomorrow: () => boolean;
  formatDueDate: (date: Date) => string;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onComplete?: (e: React.MouseEvent) => void;
  isRightmostColumn?: boolean;
}

const TaskDisplay: React.FC<TaskDisplayProps> = ({
  task,
  isOverdue,
  isDueToday,
  isDueTomorrow,
  formatDueDate,
  onComplete,
  isRightmostColumn = false
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {onComplete && (
          <IconButton
            aria-label={isRightmostColumn ? "タスクを未完了にする" : "タスクを完了"}
            icon={isRightmostColumn ? CheckCircleFillIcon : CheckCircleIcon}
            size="small"
            onClick={onComplete}
            variant="invisible"
            sx={{
              color: 'success.fg',
              '&:hover': {
                bg: 'transparent',
                color: 'success.fg'
              }
            }}
          />
        )}
        <Heading sx={{ 
          fontSize: 2, 
          margin: 0, 
          fontWeight: '600',
          color: 'fg.default',
          lineHeight: '1.4',
          flex: 1
        }}>
          {task.title}
        </Heading>
      </Box>
        
        {task.labels && task.labels.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 ,mb: 3 }}>
            {task.labels.map((label) => {
              const getVariantColors = (variant: string) => {
                switch (variant) {
                  case 'primary':
                    return { bg: 'accent.emphasis', color: 'fg.onEmphasis' };
                  case 'secondary':
                    return { bg: 'neutral.emphasis', color: 'fg.onEmphasis' };
                  case 'accent':
                    return { bg: 'accent.emphasis', color: 'fg.onEmphasis' };
                  case 'success':
                    return { bg: 'success.emphasis', color: 'fg.onEmphasis' };
                  case 'attention':
                    return { bg: 'attention.emphasis', color: 'fg.onEmphasis' };
                  case 'severe':
                    return { bg: 'severe.emphasis', color: 'fg.onEmphasis' };
                  case 'danger':
                    return { bg: 'danger.emphasis', color: 'fg.onEmphasis' };
                  case 'done':
                    return { bg: 'done.emphasis', color: 'fg.onEmphasis' };
                  case 'sponsors':
                    return { bg: 'sponsors.emphasis', color: 'fg.onEmphasis' };
                  default:
                    return { bg: 'neutral.emphasis', color: 'fg.onEmphasis' };
                }
              };
              
              const colors = getVariantColors(label.color);
              
              return (
                <Box
                  key={label.id}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    bg: colors.bg,
                    color: colors.color,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontSize: 0,
                    fontWeight: '500'
                  }}
                >
                  {label.name}
                </Box>
              );
            })}
          </Box>
        )}
      
      {task.description && (
        <Text sx={{ fontSize: 1, color: "fg.muted", 
          mb: 3, 
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {task.description}
        </Text>
      )}
      
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {task.dueDate && (
            <Box 
            sx={{ 
              display: "inline-flex",
              gap: 1,
              bg: isOverdue() 
                ? 'danger.subtle' 
                : isDueToday() 
                ? 'attention.subtle'
                : isDueTomorrow() 
                ? 'accent.subtle' 
                : 'neutral.subtle',
              color: isOverdue() 
                ? 'danger.fg' 
                : isDueToday() 
                ? 'attention.fg'
                : isDueTomorrow() 
                ? 'accent.fg' 
                : 'fg.muted',
              px: 2,
              py: 1,
              alignItems: "center",
              borderRadius: 2,
              fontSize: 0,
              fontWeight: "600",
              alignSelf: 'flex-start' 
            }}
            >
            <CalendarIcon size={12} />
            期限: {formatDueDate(task.dueDate)}
            {isOverdue() && ' (Overdue)'}
            {isDueToday() && !isOverdue() && ' (Due Today)'}
            {isDueTomorrow() && !isOverdue() && !isDueToday() && ' (Due Tomorrow)'}
            </Box>
        )}
      </Box>
    </Box>
  );
};

export default TaskDisplay;