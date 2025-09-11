import React from 'react';
import { Button, Box, Text, Heading } from '@primer/react';
import { CalendarIcon } from '@primer/octicons-react';
import type { Task } from '../types';

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
  formatDueDate,
  onEdit,
  onDelete
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
      </Box>
      
      <Box 
        sx={{
          display: "flex",
          gap: 3,
          mt: 4,
          pt: 3,
          borderTop: "1px solid",
          borderColor: "border.muted"
        }}
      >
        <Button
          onClick={onEdit}
          size="small"
          sx={{
            fontWeight: '500',
            flex: 1
          }}
        >
          Edit
        </Button>
        <Button
          onClick={onDelete}
          size="small"
          variant="danger"
          sx={{
            fontWeight: '500'
          }}
        >
          Delete
        </Button>
      </Box>
    </Box>
  );
};

export default TaskDisplay;