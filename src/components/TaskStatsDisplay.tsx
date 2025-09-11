import React from 'react';
import { Box, Text, Label } from '@primer/react';
import { ClockIcon, AlertIcon, CheckCircleIcon, InfoIcon } from '@primer/octicons-react';
import type { TaskStats } from '../hooks/useTaskStats';

interface TaskStatsDisplayProps {
  stats: TaskStats;
}

const TaskStatsDisplay: React.FC<TaskStatsDisplayProps> = ({ stats }) => {
  const { totalTasks, overdueTasks, dueTodayTasks, dueTomorrowTasks, hasUrgentTasks } = stats;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Text sx={{　display: 'flex', alignItems: 'center', gap: 1, fontSize: 1, color: 'fg.muted' }}>
          <CheckCircleIcon size={16} />
          総未完了タスク数: {totalTasks}
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

          {dueTomorrowTasks > 0 && (
            <Label variant="accent" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ClockIcon size={12} />
              明日期限: {dueTomorrowTasks}
            </Label>
          )}
        </Box>
      )}

      {!hasUrgentTasks && totalTasks > 0 && (
        <Text sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 1, color: 'fg.muted' }}>
          <InfoIcon size={16} />
          緊急なタスクはありません
        </Text>
      )}
    </Box>
  );
};

export default TaskStatsDisplay;