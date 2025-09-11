import React from 'react';
import { Box, Text, Heading } from '@primer/react';
import { CalendarIcon } from '@primer/octicons-react';
import type { Task } from '../types';
import { getColorInfo } from '../utils/labels';

interface TaskDisplayProps {
  task: Task;
  isOverdue: () => boolean;
  isDueSoon: () => boolean;
  formatDueDate: (date: Date) => string;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const TaskDisplay: React.FC<TaskDisplayProps> = ({
  task,
  isOverdue,
  isDueSoon,
  formatDueDate
}) => {
  return (
    <Box>
      <Heading sx={{ 
        fontSize: 2, 
        margin: 0, 
        mb: 2, 
        fontWeight: '600',
        color: 'fg.default',
        lineHeight: '1.4'
      }}>
        {task.title}
      </Heading>
      
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
                : isDueSoon() 
                ? 'attention.subtle' 
                : 'neutral.subtle',
              color: isOverdue() 
                ? 'danger.fg' 
                : isDueSoon() 
                ? 'attention.fg' 
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
            Due: {formatDueDate(task.dueDate)}
            {isOverdue() && ' (Overdue)'}
            {isDueSoon() && !isOverdue() && ' (Due Tomorrow)'}
            </Box>
        )}
        
        {task.labels && task.labels.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {task.labels.map((label) => {
              const colorInfo = getColorInfo(label.color);
              return (
                <Box
                  key={label.id}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    bg: colorInfo.bg,
                    color: label.color,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontSize: 0,
                    fontWeight: '500',
                    border: '1px solid',
                    borderColor: label.color
                  }}
                >
                  {label.name}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TaskDisplay;