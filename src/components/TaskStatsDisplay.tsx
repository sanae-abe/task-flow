import { ClockIcon, AlertIcon, CheckCircleIcon, InfoIcon } from '@primer/octicons-react';
import { Box, Text, Label } from '@primer/react';
import React from 'react';

import type { TaskStats } from '../hooks/useTaskStats';

interface TaskStatsDisplayProps {
  stats: TaskStats;
}

interface UrgentLabelProps {
  variant: 'danger' | 'attention' | 'accent';
  icon: React.ComponentType<{ size: number }>;
  count: number;
  label: string;
}

const UrgentLabel: React.FC<UrgentLabelProps> = ({ variant, icon: Icon, count, label }) => (
  <Label variant={variant} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Icon size={12} />
    {label}: {count}
  </Label>
);

const TaskStatsDisplay: React.FC<TaskStatsDisplayProps> = ({ stats }) => {
  const { totalTasks, overdueTasks, dueTodayTasks, dueTomorrowTasks, hasUrgentTasks } = stats;

  const urgentLabels = [
    { condition: overdueTasks > 0, variant: 'danger' as const, icon: AlertIcon, count: overdueTasks, label: '期限切れ' },
    { condition: dueTodayTasks > 0, variant: 'attention' as const, icon: ClockIcon, count: dueTodayTasks, label: '今日期限' },
    { condition: dueTomorrowTasks > 0, variant: 'accent' as const, icon: ClockIcon, count: dueTomorrowTasks, label: '明日期限' }
  ].filter(item => item.condition);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Text sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 1, color: 'fg.muted' }}>
        <CheckCircleIcon size={16} />
        総未完了タスク数: {totalTasks}
      </Text>

      {hasUrgentTasks && urgentLabels.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {urgentLabels.map((item, index) => (
            <UrgentLabel
              key={index}
              variant={item.variant}
              icon={item.icon}
              count={item.count}
              label={item.label}
            />
          ))}
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