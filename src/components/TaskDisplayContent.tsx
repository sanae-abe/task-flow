import React from 'react';
import { Box, Text, Heading } from '@primer/react';
import { CalendarIcon } from '@primer/octicons-react';
import type { Task } from '../types';
import { getDateStatus, formatDueDate } from '../utils/dateHelpers';
import { getLabelColors } from '../utils/labelHelpers';

interface TaskDisplayContentProps {
  task: Task;
}

const TaskDisplayContent: React.FC<TaskDisplayContentProps> = ({ task }) => {
  const { isOverdue, isDueToday, isDueTomorrow } = getDateStatus(task.dueDate);

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>Description</Heading>
        <Box
          sx={{
            p: 3,
            bg: "canvas.subtle",
            border: "1px solid",
            borderRadius: 2,
            borderColor: "border.default"
          }}
        >
          {task.description ? (
            <Text sx={{ fontSize: 1 }}>{task.description}</Text>
          ) : (
            <Text sx={{ fontSize: 1, color: "fg.muted", fontStyle: "italic" }}>
              No description set
            </Text>
          )}
        </Box>
      </Box>

      {task.dueDate && (
        <Box sx={{ mb: 4 }}>
          <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>Due Date</Heading>
          <Box
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              bg: isOverdue 
                ? 'danger.subtle' 
                : isDueToday 
                ? 'attention.subtle'
                : isDueTomorrow 
                ? 'accent.subtle' 
                : 'canvas.subtle',
              borderRadius: 2,
              border: '1px solid',
              borderColor: isOverdue 
                ? 'danger.emphasis' 
                : isDueToday 
                ? 'attention.emphasis'
                : isDueTomorrow 
                ? 'accent.emphasis' 
                : 'border.default'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <CalendarIcon size={16} />
              <Text sx={{ fontSize: 1 }}>{formatDueDate(task.dueDate)}</Text>
            </Box>
            {isOverdue && (
              <Text
                sx={{
                  fontSize: 0,
                  fontWeight: "bold",
                  color: "#ffffff",
                  bg: "danger.emphasis",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}
              >
                Overdue
              </Text>
            )}
            {isDueToday && !isOverdue && (
              <Text
                sx={{
                  fontSize: 0,
                  fontWeight: "bold",
                  color: "#ffffff",
                  bg: "attention.emphasis",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}
              >
                Due Today
              </Text>
            )}
            {isDueTomorrow && !isOverdue && !isDueToday && (
              <Text
                sx={{
                  fontSize: 0,
                  fontWeight: "bold",
                  color: "#ffffff",
                  bg: "accent.emphasis",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}
              >
                Due Tomorrow
              </Text>
            )}
          </Box>
        </Box>
      )}

      {task.labels && task.labels.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>Labels</Heading>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {task.labels.map((label) => {
              const colors = getLabelColors(label.color);
              
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
        </Box>
      )}
    </>
  );
};

export default TaskDisplayContent;