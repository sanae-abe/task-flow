import { ClockIcon, AlertIcon, CheckCircleIcon, InfoIcon, XCircleIcon } from '@primer/octicons-react';
import { Text } from '@primer/react';
import React from 'react';

import type { TaskStats } from '../hooks/useTaskStats';
import { HBox } from './shared/FlexBox';
import StatusBadge from './shared/StatusBadge';

interface TaskStatsDisplayProps {
  stats: TaskStats;
}

interface UrgentLabelProps {
  variant: 'danger' | 'warning' | 'info';
  icon: React.ComponentType<{ size: number }>;
  count: number;
  label: string;
}

const UrgentLabel: React.FC<UrgentLabelProps> = ({ variant, icon: IconComponent, count, label }) => (
  <StatusBadge variant={variant} icon={IconComponent} size="small" sx={{ border: 'none', bg: 'transparent' }}>
    {label}: {count}
  </StatusBadge>
);

const TaskStatsDisplay: React.FC<TaskStatsDisplayProps> = ({ stats }) => {
  const { totalTasks, overdueTasks, dueTodayTasks, dueTomorrowTasks, hasUrgentTasks } = stats;

  const urgentLabels = [
    { condition: overdueTasks > 0, variant: 'danger' as const, icon: XCircleIcon, count: overdueTasks, label: '期限切れ' },
    { condition: dueTodayTasks > 0, variant: 'warning' as const, icon: AlertIcon, count: dueTodayTasks, label: '本日期限' },
    { condition: dueTomorrowTasks > 0, variant: 'info' as const, icon: ClockIcon, count: dueTomorrowTasks, label: '明日期限' }
  ].filter(item => item.condition);

  return (
    <HBox align="center" gap={4} shrink={0}>
      <HBox align="center" gap={1} shrink={0} sx={{ fontSize: 0, color: 'fg.muted' }}>
        <CheckCircleIcon size={16} />
        <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
          未完了タスク数: {totalTasks}
        </Text>
      </HBox>

      {hasUrgentTasks && urgentLabels.length > 0 && (
        <HBox align="center" gap={2}>
          {urgentLabels.map((item, index) => (
            <UrgentLabel
              key={index}
              variant={item.variant}
              icon={item.icon}
              count={item.count}
              label={item.label}
            />
          ))}
        </HBox>
      )}

      {!hasUrgentTasks && totalTasks > 0 && (
        <HBox align="center" gap={1} sx={{ fontSize: 0, color: 'fg.muted' }}>
          <InfoIcon size={16} />
          <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
            緊急なタスクはありません
          </Text>
        </HBox>
      )}
    </HBox>
  );
};

export default TaskStatsDisplay;