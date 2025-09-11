import React from 'react';
import { Box, Text, Label } from '@primer/react';
import { ClockIcon, AlertIcon, CheckIcon } from '@primer/octicons-react';
import { TaskStats } from '../hooks/useTaskStats';

interface TaskStatsDisplayProps {
  stats: TaskStats;
}

const TaskStatsDisplay: React.FC<TaskStatsDisplayProps> = ({ stats }) => {
  const { totalTasks, overdueTasks, dueTodayTasks, dueTomorrowTasks, hasUrgentTasks } = stats;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckIcon size={16} />
        <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
          総タスク数: {totalTasks}
        </Text>
      </Box>

      {hasUrgentTasks && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {overdueTasks > 0 && (
            <Label variant="danger" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AlertIcon size={12} />
              期限切れ: {overdueTasks}
            </Label>
          )}
          
          {dueTodayTasks > 0 && (
            <Label variant="attention" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ClockIcon size={12} />
              今日期限: {dueTodayTasks}
            </Label>
          )}
        </Box>
      )}

      {dueTomorrowTasks > 0 && (
        <Label variant="secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ClockIcon size={12} />
          明日期限: {dueTomorrowTasks}
        </Label>
      )}

      {!hasUrgentTasks && totalTasks > 0 && (
        <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
          緊急なタスクはありません
        </Text>
      )}
    </Box>
  );
};

export default TaskStatsDisplay;