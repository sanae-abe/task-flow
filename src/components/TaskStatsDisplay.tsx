import {
  Clock,
  AlertTriangle,
  CircleCheck,
  Info,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { TaskStats } from '../hooks/useTaskStats';
import StatusBadge from './shared/StatusBadge';

interface TaskStatsDisplayProps {
  stats: TaskStats;
}

interface UrgentLabelProps {
  variant: 'danger' | 'warning' | 'info';
  icon: LucideIcon;
  count: number;
  label: string;
}

const UrgentLabel: React.FC<UrgentLabelProps> = ({
  variant,
  icon: IconComponent,
  count,
  label,
}) => (
  <StatusBadge
    variant={variant}
    icon={IconComponent}
    size='small'
    className='border-none bg-transparent'
  >
    {label}: {count}
  </StatusBadge>
);

const TaskStatsDisplay: React.FC<TaskStatsDisplayProps> = ({ stats }) => {
  const { t } = useTranslation();
  const {
    totalTasks,
    overdueTasks,
    dueTodayTasks,
    dueTomorrowTasks,
    hasUrgentTasks,
  } = stats;

  const urgentLabels = [
    {
      condition: overdueTasks > 0,
      variant: 'danger' as const,
      icon: XCircle,
      count: overdueTasks,
      label: t('task.overdue'),
    },
    {
      condition: dueTodayTasks > 0,
      variant: 'warning' as const,
      icon: AlertTriangle,
      count: dueTodayTasks,
      label: t('task.dueToday'),
    },
    {
      condition: dueTomorrowTasks > 0,
      variant: 'info' as const,
      icon: Clock,
      count: dueTomorrowTasks,
      label: t('task.dueTomorrow'),
    },
  ].filter(item => item.condition);

  return (
    <div className='flex items-center gap-4 shrink-0'>
      <div className='flex items-center gap-1 shrink-0 text-xs text-zinc-700'>
        <CircleCheck size={16} />
        <span className='text-xs text-zinc-700'>
          {t('task.incompleteTaskCount')}: {totalTasks}
        </span>
      </div>

      {hasUrgentTasks && urgentLabels.length > 0 && (
        <div className='flex items-center gap-2'>
          {urgentLabels.map((item, index) => (
            <UrgentLabel
              key={index}
              variant={item.variant}
              icon={item.icon}
              count={item.count}
              label={item.label}
            />
          ))}
        </div>
      )}

      {!hasUrgentTasks && totalTasks > 0 && (
        <div className='flex items-center gap-1 text-xs text-zinc-700'>
          <Info size={16} />
          <span className='text-xs text-zinc-700'>
            {t('task.noUrgentTasks')}
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskStatsDisplay;
