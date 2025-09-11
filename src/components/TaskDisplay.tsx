import React from 'react';
import { Box, Text, Heading, IconButton } from '@primer/react';
import { CalendarIcon, CheckCircleIcon, CheckCircleFillIcon, CheckIcon, PaperclipIcon } from '@primer/octicons-react';
import type { Task } from '../types';
import { getLabelColors } from '../utils/labelHelpers';

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
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                color: 'success.fg'
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

      {task.labels && task.labels.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
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
      )}

      {(task.dueDate || (task.subTasks && task.subTasks.length > 0) || (task.attachments && task.attachments.length > 0)) && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
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
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            {/* サブタスク進捗表示 */}
            {task.subTasks && task.subTasks.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontSize: 0,
                  fontWeight: '500',
                  alignSelf: 'flex-start',
                  color: 'fg.muted'
                }}
              >
                <CheckIcon size={12} />
                {(() => {
                  const completed = task.subTasks.filter(sub => sub.completed).length;
                  const total = task.subTasks.length;
                  return (
                    <>
                      <Text sx={{ fontSize: 0 }}>
                        {completed}/{total}
                      </Text>
                    </>
                  );
                })()}
              </Box>
            )}

            {task.attachments && task.attachments.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontSize: 0,
                  fontWeight: '500',
                  alignSelf: 'flex-start',
                  color: 'fg.muted'
                }}
              >
                <PaperclipIcon size={12} />
                <Text sx={{ fontSize: 0 }}>
                  {task.attachments.length}
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TaskDisplay;